import { ButtonInteraction, Message } from "discord.js";
import dayjs from "dayjs";
import { getInfoEmbed, getSuccessEmbed } from "arcybot";
import { Race } from "@masochistme/sdk/dist/v1/types";

import { sdk } from "fetus";
import { RaceButton } from "consts";
import { ImgType, saveImage } from "utils/saveImage";
import { awaitMessage, getUTCDate, createError, ErrorAction } from "utils";
import { informModsAboutRaceFinish } from "./informModsAboutParticipant";

import { getRaceStartEmbed, getRaceStartButtons } from "./__common";

/**
 * Response to race participant clicking the FINISH button.
 * @param interaction
 * @return void
 */
export const raceFinish = async (
  interaction: ButtonInteraction,
): Promise<void> => {
  if (!interaction.isButton()) return;

  try {
    const raceId = interaction.customId.replace(
      `${RaceButton.RACE_FINISH}-`,
      "",
    );
    const race = await sdk.getRaceById({ raceId });
    const participant = await sdk.getRaceParticipantById({
      raceId,
      memberId: interaction.user.id,
    });
    const startDate = participant?.startDate;
    const endDate = new Date();
    const { acknowledged } = await sdk.updateRaceByParticipantId({
      raceId,
      memberId: interaction.user.id,
      update: { endDate },
    });
    if (!acknowledged) throw new Error("Database did not respond.");
    const tempFields = [
      {
        name: "Your start time",
        value: getUTCDate(startDate),
        inline: true,
      },
      {
        name: "Your finish time",
        value: getUTCDate(endDate),
        inline: true,
      },
    ];
    interaction
      .update({
        embeds: [
          getRaceStartEmbed(
            race,
            `☑️ ${race.name.toUpperCase()} - FINISHED`,
            false,
            tempFields,
          ),
        ],
        components: [getRaceStartButtons(raceId, false, false, false, false)],
        fetchReply: true,
      })
      .then(() => {
        raceUploadProof(interaction, race);
      });
  } catch (err: any) {
    createError(interaction, err, ErrorAction.REPLY);
  }
};

const raceUploadProof = async (
  interaction: ButtonInteraction,
  race: Race,
): Promise<void> => {
  const channel = interaction?.channel;
  if (!channel) return;

  channel.send(
    getInfoEmbed(
      "Upload the proof",
      `Please post a proof of you finishing the race below this message within the next ${race.uploadGrace} seconds.
      \nIf you exceed that time it's fine, but every second above the grace period will be added to your final score.`,
    ),
  );
  try {
    const raceId = String(race._id);
    const memberId = interaction.user.id;
    const filter = (msg: Message) => !!msg.attachments.size;
    const time = dayjs(race.endDate).diff(new Date());
    const proofCollection = await awaitMessage<ButtonInteraction>(
      interaction,
      filter,
      time,
    );
    const proof = proofCollection?.attachments?.first()?.proxyURL;
    if (!proof)
      throw new Error(
        "I could not collect a proof. Reason unknown. Probably something fucked up.",
      );
    const fixedImage = await saveImage(
      proof,
      `race-${raceId}_player-${memberId}`,
      ImgType.RACE,
    );
    const { acknowledged } = await sdk.updateRaceByParticipantId({
      raceId,
      memberId,
      update: { proof: fixedImage, proofDate: new Date() },
    });
    if (!acknowledged)
      throw new Error(
        "Could not save your proof. Reason unknown but probably database died or something.",
      );
    channel.send(
      getSuccessEmbed("You successfully uploaded your proof!", fixedImage),
    );
    informModsAboutRaceFinish(raceId, memberId);
  } catch (err: any) {
    createError(interaction, err, ErrorAction.SEND);
  }
};
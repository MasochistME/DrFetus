import {
  ButtonInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  APIEmbed,
  APIEmbedField,
} from "discord.js";
import { getErrorEmbed } from "arcybot";
import { Race, RaceType, RaceScoreBased } from "@masochistme/sdk/dist/v1/types";

import { sdk } from "fetus";
import { RaceButton } from "consts";
import { getUTCDate, cenzor } from "utils";

/**
 * Message sent to race participant on DM when the race begins.
 * @param interaction ButtonInteraction
 * @returns void
 */
export const raceReadyToGo = async (
  interaction: ButtonInteraction,
): Promise<void> => {
  if (!interaction.isButton()) return;
  const raceId = interaction.customId.replace(`${RaceButton.RACE_JOIN}-`, "");
  const race = await sdk.getRaceById({ id: raceId });
  const tempFields = [
    {
      name: "---",
      value: `Good luck! You can start the race whenever it's convenient for you within the time limit.`,
    },
  ];
  interaction.user.send({
    embeds: [
      getRaceStartEmbed(
        race,
        `⏳ ${race.name.toUpperCase()} - PREPARING...`,
        true,
        tempFields,
      ),
    ],
    components: [getRaceStartButtons(raceId, true, false, false, false)],
  });
};

/**
 * Response to race participant clicking the REVEAL button.
 * @param interaction ButtonInteraction
 * @returns void
 */
export const raceReveal = async (
  interaction: ButtonInteraction,
): Promise<void> => {
  if (!interaction.isButton()) return;

  const raceId = interaction.customId.replace(`${RaceButton.RACE_REVEAL}-`, "");
  const race = await sdk.getRaceById({ id: raceId });

  interaction.update({
    embeds: [
      getRaceStartEmbed(
        race,
        `⌛ ${race.name.toUpperCase()} - READY TO GO`,
        false,
      ),
    ],
    components: [getRaceStartButtons(raceId, false, true, false, false)],
  });
};

/**
 * Response to race participant clicking the START button.
 * @param interaction ButtonInteraction
 * @returns void
 */
export const raceStart = async (
  interaction: ButtonInteraction,
): Promise<void> => {
  if (!interaction.isButton()) return;

  const raceId = interaction.customId.replace(`${RaceButton.RACE_START}-`, "");
  const race = await sdk.getRaceById({ id: raceId });
  const startTime = new Date();

  try {
    const { acknowledged } = await sdk.updateRaceByParticipantId({
      raceId,
      discordId: interaction.user.id,
      update: { startTime },
    });
    if (!acknowledged) throw new Error("Database did not respond.");
    const tempFields = [
      {
        name: "Your start time",
        value: startTime.toLocaleTimeString(),
        inline: true,
      },
    ];
    interaction.update({
      embeds: [
        getRaceStartEmbed(
          race,
          `🎮 ${race.name.toUpperCase()} - IN PROGRESS`,
          false,
          tempFields,
        ),
      ],
      components: [getRaceStartButtons(raceId, false, false, true, true)],
    });
  } catch (err: any) {
    interaction.reply(
      getErrorEmbed("Error", err ?? "Something went wrong. Try again later"),
    );
  }
};

/**
 * Response to race participant clicking the FINISH button.
 * @param interaction
 * @returns void
 */
export const raceFinish = async (
  interaction: ButtonInteraction,
): Promise<void> => {
  if (!interaction.isButton()) return;
  const raceId = interaction.customId.replace(`${RaceButton.RACE_FINISH}-`, "");
  const race = await sdk.getRaceById({ id: raceId });
  const endTime = new Date();

  try {
    const { acknowledged } = await sdk.updateRaceByParticipantId({
      raceId,
      discordId: interaction.user.id,
      update: { endTime },
    });
    if (!acknowledged) throw new Error("Database did not respond.");
    const originalEmbed = interaction.message.embeds[0].data;
    const editedEmbed = {
      ...originalEmbed,
      fields: [
        ...(originalEmbed.fields ?? []),
        {
          name: "Your finish time",
          value: endTime.toLocaleTimeString(),
          inline: true,
        },
      ],
    };
    interaction.update({
      embeds: [
        {
          ...editedEmbed,
          title: `☑️ ${race.name.toUpperCase()} - FINISHED`,
        },
      ],
      components: [getRaceStartButtons(raceId, false, false, false, false)],
    });
  } catch (err: any) {
    interaction.reply(
      getErrorEmbed("Error", err ?? "Something went wrong. Try again later"),
    );
  }
};

/**
 * Response to race participant clicking the GIVE UP button.
 * @param interaction
 * @returns void
 */
export const raceGiveUp = async (
  interaction: ButtonInteraction,
): Promise<void> => {
  if (!interaction.isButton()) return;
  const raceId = interaction.customId.replace(
    `${RaceButton.RACE_GIVE_UP}-`,
    "",
  );
  const race = await sdk.getRaceById({ id: raceId });

  try {
    const { acknowledged } = await sdk.updateRaceByParticipantId({
      raceId,
      discordId: interaction.user.id,
      update: { dnf: true },
    });
    if (!acknowledged) throw new Error("Database did not respond.");
    const tempFields = [
      {
        name: "---",
        value: `You gave up :( You won't be able to rejoin this race.`,
      },
    ];
    interaction.update({
      embeds: [
        getRaceStartEmbed(
          race,
          `❌ ${race.name.toUpperCase()} - WALKOVER`,
          false,
          tempFields,
        ),
      ],
      components: [getRaceStartButtons(raceId, false, false, false, false)],
    });
  } catch (err: any) {
    interaction.reply(
      getErrorEmbed("Error", err ?? "Something went wrong. Try again later"),
    );
  }
};

/**
 * Creates a row of buttons for the user to manage their race.
 * @param raceId string
 * @param canFinish boolean
 * @returns ActionRowBuilder<ButtonBuilder>
 */
const getRaceStartButtons = (
  raceId: string,
  isRevealButtonEnabled: boolean,
  isStartButtonEnabled: boolean,
  isFinishButtonEnabled: boolean,
  isGiveUpButtonEnabled: boolean,
) => {
  const buttonRevealRace = new ButtonBuilder()
    .setCustomId(`${RaceButton.RACE_REVEAL}-${raceId}`)
    .setLabel("REVEAL")
    .setStyle(
      isRevealButtonEnabled ? ButtonStyle.Primary : ButtonStyle.Secondary,
    )
    .setDisabled(!isRevealButtonEnabled);
  const buttonStartRace = new ButtonBuilder()
    .setCustomId(`${RaceButton.RACE_START}-${raceId}`)
    .setLabel("START")
    .setStyle(
      isStartButtonEnabled ? ButtonStyle.Success : ButtonStyle.Secondary,
    )
    .setDisabled(!isStartButtonEnabled);
  const buttonFinishRace = new ButtonBuilder()
    .setCustomId(`${RaceButton.RACE_FINISH}-${raceId}`)
    .setLabel("FINISH")
    .setStyle(
      isFinishButtonEnabled ? ButtonStyle.Primary : ButtonStyle.Secondary,
    )
    .setDisabled(!isFinishButtonEnabled);
  const buttonGiveUpRace = new ButtonBuilder()
    .setCustomId(`${RaceButton.RACE_GIVE_UP}-${raceId}`)
    .setLabel("GIVE UP")
    .setStyle(ButtonStyle.Danger)
    .setDisabled(!isGiveUpButtonEnabled);
  const buttonBar = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buttonRevealRace,
    buttonStartRace,
    buttonFinishRace,
    buttonGiveUpRace,
  );
  return buttonBar;
};

/**
 * Creates an embed for user to start and finish the race
 * @param race Race
 * @param isCenzored boolean
 * @returns APIEmbed
 */
const getRaceStartEmbed = (
  race: Race,
  title: string,
  isCenzored: boolean,
  newFields?: APIEmbedField[],
): APIEmbed => {
  const fields: APIEmbedField[] = [
    {
      name: "Instructions",
      value: isCenzored ? cenzor(race.instructions) : race.instructions,
    },
    {
      name: "Start time",
      value: getUTCDate(race.startTime),
      inline: true,
    },
    {
      name: "Finish time",
      value: getUTCDate(race.endTime),
      inline: true,
    },
    {
      name: "Download link",
      value: isCenzored ? cenzor(race.downloadLink) : race.downloadLink,
    },
    {
      name: "Download grace period",
      value: `${race.downloadGrace} seconds`,
      inline: true,
    },
    {
      name: "Screenshot upload grace period",
      value: `${race.uploadGrace} seconds`,
      inline: true,
    },
  ];

  if (race.type === RaceType.SCORE_BASED)
    fields.push({
      name: "Play time limit",
      value: `${(race as RaceScoreBased).playLimit} minutes`,
      inline: true,
    });

  const embed: APIEmbed = {
    title,
    ...(!isCenzored && race.icon && { thumbnail: { url: race.icon } }),
    fields: [
      ...fields,
      {
        name: "Race organizer",
        value: `<@${race.organizer}>`,
      },
      ...(newFields ?? []),
    ],
  };

  return embed;
};
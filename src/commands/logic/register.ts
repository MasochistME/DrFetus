import {
  ActionRowBuilder,
  APIEmbed,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { DiscordInteraction, getSuccessEmbed, getErrorEmbed } from "arcybot";
import { getChannelById, getOption } from "utils";

/**
 * Allows user to sent their MasochistME link for the mod approval
 * and connection of MasochistME profile to Discord profile
 * @param interaction DiscordInteraction
 * @returns void
 */
export const register = async (
  interaction: DiscordInteraction,
): Promise<void> => {
  const regex = new RegExp(/(?<=masochist.me\/profile\/).*/);
  const link = interaction.options.getString("link", true);

  const isMasochistLink = regex.test(link);
  const steamId = link.match(regex)?.[0];

  if (!isMasochistLink ?? !steamId) {
    interaction.reply(
      getErrorEmbed(
        "Incorrect link",
        "The link you provided is not a correct Masochist.ME profile.",
        true,
      ),
    );
    return;
  }

  const modRoomId = getOption("room_mod");
  const channel = getChannelById(interaction, modRoomId);

  await channel?.send({
    embeds: [getModApprovalEmbed(interaction, steamId)],
    components: [getModApprovalButtons()],
  });

  interaction.reply(
    getSuccessEmbed(
      "Success!",
      "Your registration request has been sent to the mod team. Please wait for their approval.",
    ),
  );
};

/**
 * Creates a row of buttons - approve and reject - for the mod review of user registration
 * @returns ActionRowBuilder<ButtonBuilder>
 */
const getModApprovalButtons = () => {
  const buttonReject = new ButtonBuilder()
    .setCustomId("reject")
    .setLabel("Reject")
    .setStyle(ButtonStyle.Danger);
  const buttonApprove = new ButtonBuilder()
    .setCustomId("approve")
    .setLabel("Approve")
    .setStyle(ButtonStyle.Success);
  const buttonBar = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buttonReject,
    buttonApprove,
  );

  return buttonBar;
};

/**
 * Creates an embed for the mod review of user registration
 * @param interaction DiscordInteraction
 * @param steamId string - user's Steam ID
 * @returns APIEmbed
 */
const getModApprovalEmbed = (
  interaction: DiscordInteraction,
  steamId: string,
) => {
  const embed: APIEmbed = {
    title: "🔧 User registration request",
    fields: [
      {
        name: "---",
        value: `User <@${interaction.user.id}> requested registration.\nReview their application and approve or reject.`,
      },
      {
        name: "Steam profile",
        value: `https://steamcommunity.com/profiles/${steamId}`,
      },
      {
        name: "Masochist.ME link",
        value: `http://masochist.me/profile/${steamId}`,
      },
    ],
  };

  return embed;
};
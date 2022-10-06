import axios from "axios";
import { APIEmbed } from "discord.js";
import { DiscordInteraction, getErrorEmbed } from "arcybot";

import { API_URL, USER_NO_DESCRIPTION } from "consts";
import { getMemberFromAPI } from "api";
import { Member } from "types";
import { cache } from "fetus";

type PartialMember = Pick<
  Member,
  "id" | "name" | "avatar" | "description" | "url"
> & {
  tierCompletion: string;
  badges: string;
  rank: string;
};

export const profile = async (
  interaction: DiscordInteraction,
): Promise<void> => {
  const userId = interaction.user.id;
  await interaction.deferReply();

  try {
    const member = await getMemberFromAPI(userId);
    if (!member)
      throw `Your Discord account is not connected to the Masochist.ME profile.
      \nTo be able to use \`/profile\` command, please register first with the \`/register\` command.`;

    const rankingUrl = `${API_URL}/ranking`;
    const fullRanking = await axios.get(rankingUrl);
    if (fullRanking.status !== 200) throw fullRanking.data;

    const usefulMemberInfo: PartialMember = {
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      url: member.url,
      description: member.description,
      tierCompletion: getMemberTierCompletion(member),
      badges: getMemberBadges(member, fullRanking),
      rank: getMemberRank(member, fullRanking),
    };
    const embed = getMemberEmbed(usefulMemberInfo);
    interaction.editReply({ embeds: [embed] });
  } catch (err: any) {
    interaction.editReply(
      getErrorEmbed("Something went wrong :C", err ?? "Try again later.", true),
    );
  }
};

/**
 * Creates an embed for the mod review of user registration
 * @param interaction DiscordInteraction
 * @param steamId string - user's Steam ID
 * @returns APIEmbed
 */
const getMemberEmbed = (member: PartialMember) => {
  const embed: APIEmbed = {
    title: member.name.toUpperCase(),
    thumbnail: { url: member.avatar },
    fields: [
      {
        name: "Description",
        value: member.description ?? USER_NO_DESCRIPTION,
      },
      {
        name: "Steam profile",
        value: `https://steamcommunity.com/profiles/${member.id}`,
      },
      {
        name: "Masochist.ME link",
        value: `http://masochist.me/profile/${member.id}`,
      },
      {
        name: "Rank:",
        value: member.rank,
        inline: true,
      },
      {
        name: "Badges unlocked:",
        value: member.badges,
        inline: true,
      },
      {
        name: "Tier completion:",
        value: member.tierCompletion,
        inline: true,
      },
    ],
  };

  return embed;
};

/**
 * Returns member's MasochistME rank.
 * @param member Member
 * @returns string
 */
const getMemberRank = (member: Member, fullRanking: any) => {
  const memberPosition =
    fullRanking.data.findIndex((r: any) => r.id === member.id) ?? "?";
  const memberRanking = fullRanking.data.find((r: any) => r.id === member.id);
  return `\`\`#${memberPosition}\`\`\n\n**Total points:**\n\`\`${memberRanking.points.sum}\`\``;
};

/**
 * Returns the summary of member's tier completion statistics.
 * @param member Member
 * @returns string
 */
const getMemberTierCompletion = (member: Member) => {
  const memberTierCompletionSummary = cache.points
    .map(point => {
      const memberTierCompletion = member.ranking[point.id];
      return `\`\`Tier ${point.id} - ${memberTierCompletion}\`\``;
    })
    .join("\n");
  return memberTierCompletionSummary;
};

/**
 * Returns a number of badges that the member earned.
 * @param member Member
 * @returns string
 */
const getMemberBadges = (member: Member, fullRanking: any) => {
  const memberRanking = fullRanking.data.find((r: any) => r.id === member.id);
  const { points, total } = memberRanking.points.badges;

  return `\`\`${total}\`\`\n\n**Badges points:**\n\`\`${points}\`\``;
};
import { HexColorString, MessageEmbed } from 'discord.js';
import { client, config } from '../..';
import { Command } from '../../Types';
import { commandAllowed } from '../../util/commands';
import {
    getLevelCost,
    getRankedLeaderboard,
    redisClient,
} from '../../util/levels';
import {
    getChannelList,
    getIDFromMention,
    getRandomHexColor,
} from '../../util/text';

module.exports = <Command>{
    name: 'rank',
    description: 'Check your rank in the server',
    args: '[user]',
    minArgs: 0,
    async execute(message, args) {
        if (!commandAllowed(message, config.levels?.commandChannels)) {
            throw `You can't use that command here!\nYou can only use it in ${getChannelList(
                config.levels.commandChannels[message.guild.id]
            )}`;
        }
        if (!redisClient) throw 'Levels are not enabled!';
        const leaderboard = await getRankedLeaderboard();
        const member = args.length
            ? message.guild.members.cache.get(getIDFromMention(args[0]))
            : message.member;
        let user: { id: string; name: string; pfpURL: string; color: string };
        if (member) {
            user = {
                id: member.id,
                name: member.displayName,
                pfpURL: member.user.avatarURL(),
                color: member.displayHexColor,
            };
        } else {
            const u = client.users.cache.get(getIDFromMention(args[0]));
            user = {
                id: u.id,
                name: u.username,
                pfpURL: u.avatarURL(),
                color: getRandomHexColor(),
            };
        }
        const rank = leaderboard.data.findIndex((val) => val.uid == user.id);
        const data = leaderboard.data[rank].data;
        const embed = new MessageEmbed()
            .setAuthor(user.name, user.pfpURL)
            .setColor(<HexColorString>user.color)
            .setTitle(`Rank #${rank + 1}`)
            .addField('Messages', data.count.toString(), true)
            .addField('XP', data.xp.toString(), true)
            .addField('Level', data.level.toString(), true)
            .setDescription(
                `${getLevelCost(data.level + 1) - data.xp}XP to next level`
            )
            .setTimestamp(leaderboard.cacheDate);
        message.channel.send({ embeds: [embed] });
    },
};

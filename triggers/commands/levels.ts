import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { client, config } from '../..';
import { Command } from '../../Types';
import { commandAllowed } from '../../util/commands';
import {
    getLevelNumber,
    getRankedLeaderboard,
    redisClient,
} from '../../util/levels';
import { getChannelList, getRandomHexColor } from '../../util/text';

const PAGE_SIZE = 10;

module.exports = <Command>{
    name: 'levels',
    description: 'Check the server leaderboard',
    args: '[page]',
    minArgs: 0,
    async execute(message, args) {
        if (!commandAllowed(message, config.levels?.commandChannels)) {
            throw `You can't use that command here!\nYou can only use it in ${getChannelList(
                config.levels.commandChannels[message.guild.id]
            )}`;
        }
        if (!redisClient) throw 'Levels are not enabled!';
        const leaderboard = await getRankedLeaderboard();
        const page = parseInt(args[0]) || 1;
        let embed = new MessageEmbed()
            .setTitle('Leaderboard')
            .setDescription(
                `**Page ${page}**: ${PAGE_SIZE * (page - 1) + 1}-${
                    PAGE_SIZE * page
                } of ${leaderboard.data.length}`
            )
            .setColor(getRandomHexColor())
            .setTimestamp(leaderboard.cacheDate);
        const onPage = leaderboard.data.slice(
            (page - 1) * PAGE_SIZE,
            page * PAGE_SIZE
        );
        const fields: EmbedFieldData[] = [];
        onPage.forEach((val, index) => {
            const user = client.users.cache.get(val.uid);
            const xp = `${val.data.xp.toLocaleString()} Exp.`.padEnd(14);
            const level = `Lvl. ${getLevelNumber(val.data.xp)}`.padEnd(10);
            const messages = `${val.data.count.toLocaleString()} Message${
                val.data.count != 1 ? 's' : ''
            }`.padEnd(14);
            fields.push({
                name: `#${index + 1 + PAGE_SIZE * (page - 1)}: ${
                    message.guild.members.cache.get(user.id)?.nickname ||
                    user.username
                }`,
                value: '`' + xp + level + messages + '`',
            });
        });
        embed = embed.addFields(fields);
        message.channel.send(embed);
    },
};

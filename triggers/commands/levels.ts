import { EmbedField, EmbedFieldData, MessageEmbed } from "discord.js";
import { client, config } from "../..";
import { Command } from "../../Types";
import { commandAllowed } from "../../util/commands";
import { getRankedLeaderboard, redisClient } from "../../util/levels";
import { getChannelList, getChannelListFromArray, getRandomHexColor } from "../../util/text";

const PAGE_SIZE = 10;

module.exports = <Command> {
    name: 'levels',
    description: 'Check the server leaderboard',
    args: '[page]',
    minArgs: 0,
    async execute(message, args) {
        if (!commandAllowed(message, config.levels?.channels)) {
            throw `You can't use that command here!\nYou can only use it in ${getChannelList(config.levels.channels[message.guild.id])}`;
        }
        if (!redisClient) throw 'Levels are not enabled!';
        let leaderboard = await getRankedLeaderboard();
        let page = parseInt(args[0]) || 1;
        let embed = new MessageEmbed()
            .setTitle('Leaderboard')
            .setDescription(`**Page ${page}**: ${PAGE_SIZE * (page - 1) + 1}-${PAGE_SIZE * page} of ${leaderboard.data.length}`)
            .setColor(getRandomHexColor())
            .setTimestamp(leaderboard.cacheDate);
        let onPage = leaderboard.data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
        let fields:EmbedFieldData[] = [];
        onPage.forEach((val, index) => {
            let user = client.users.cache.get(val.uid);
            fields.push({
                name: `#${(index + 1) + PAGE_SIZE * (page - 1)}: ${user.username}`,
                value: `\`${val.data.xp} Exp.   Lvl. ${val.data.level}   ${val.data.count} Message${val.data.count != 1 ? 's' : ''}\``
            });
        })
        embed = embed.addFields(fields);
        message.channel.send(embed);
    }
}
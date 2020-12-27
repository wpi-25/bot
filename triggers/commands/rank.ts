import { MessageEmbed } from "discord.js";
import { client } from "../..";
import { Command } from "../../Types";
import { getRankedLeaderboard, redisClient } from "../../util/levels";
import { rand } from "../../util/math";
import { getIDFromMention, getRandomHexColor } from "../../util/text";

module.exports = <Command> {
    name: 'rank',
    description: 'Check your rank in the server',
    args: '[user]',
    minArgs: 0,
    async execute(message, args) {
        if (!redisClient) throw 'Levels are not enabled!';
        let leaderboard = await getRankedLeaderboard();
        let member = args.length ? message.guild.members.cache.get(getIDFromMention(args[0])) : message.member;
        let user:{id:string, name:string, pfpURL:string, color:string};
        if (member) {
            user = {
                id: member.id,
                name: member.displayName,
                pfpURL: member.user.avatarURL(),
                color: member.displayHexColor
            }
        } else {
            let u = client.users.cache.get(getIDFromMention(args[0]));
            user = {
                id: u.id,
                name: u.username,
                pfpURL: u.avatarURL(),
                color: getRandomHexColor()
            }
        }
        let rank = leaderboard.data.findIndex(val => val.uid == user.id);
        let data = leaderboard.data[rank].data;
        let embed = new MessageEmbed()
            .setAuthor(user.name, user.pfpURL)
            .setColor(user.color)
            .setTitle(`Rank #${rank + 1}`)
            .addField('Messages', data.count, true)
            .addField('XP', data.xp, true)
            .addField('Level', data.level, true)
            .setTimestamp(leaderboard.cacheDate);
        message.channel.send(embed);
    }
}
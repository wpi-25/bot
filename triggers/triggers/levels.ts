import { TriggeredCommand } from "../../Types";
import { client, config } from "../..";
import { rand } from "../../util/math";
import { getLevelNumber, getUserLevel, redisClient, setUserLevel } from "../../util/levels";
import { DiscordAPIError, Guild, GuildMember, Role } from "discord.js";

module.exports = <TriggeredCommand> {
    trigger: ()=>true,  // Trigger on every message
    async execute(message) {
        if (redisClient && !message.content.startsWith(config.prefix)) {  // If levels are enabled and it's not a command
            let uid = message.author.id;
            let level = await getUserLevel(uid);

            level.count++;
            if (level.xp == null || message.createdAt.getTime() - level.last.getTime() >= config.levels.timeout) {
                if (!level.xp) level.xp = 0;
                level.xp += Math.round(rand(config.levels.xpRange));    // Random from min to max in xpRange
            }
            level.last = message.createdAt;
            let newLevel = getLevelNumber(level.xp);
            if (newLevel > level.level) {
                message.reply(`🎉 Congrats! You just leveled up to level ${newLevel}!`);
                const member = message.member;

                
                let newRole = member.guild.roles.cache.filter(role =>
                    role.name.startsWith('Level') &&
                    getLevelNumberFromRole(role) <= newLevel)
                    .sort((a:Role, b:Role) => getLevelNumberFromRole(a) - getLevelNumberFromRole(b))
                    .last();
                
                member.roles.cache.forEach(role =>
                    (newRole.name.startsWith('Level') && role.id != newRole.id) ?
                        member.roles.remove(role)
                      : null
                );
                
                member.roles.add(newRole);



                
                // if (/*User has any level roles */) {
                //     const returnedRole = member.roles.cache.find(role => {return role.name.startsWith("Level")})
                //     const roleLevel = returnedRole.name.substring(6);

                //     if (config.levels.roles.includes(newLevel)) {
                //         member.roles.remove(returnedRole);
                //         member.roles.add(member.guild.roles.cache.find(role => {return role.name.endsWith(`Level ${newLevel}`)})) //This should just check if it's fully equal but idk the method
                //     }

                // } else {
                //     if (config.levels.roles.includes(newLevel)) {
                //         member.roles.add(member.guild.roles.cache.find(role => {return role.name.endsWith(`Level ${newLevel}`)})) //This should just check if it's fully equal but idk the method
                //     } else {
                //         // Loop through the config.levels.roles against newLevel to find the most recent level role?
                //     }
                // }
            }

            await setUserLevel(uid, level);
        }
    }
}

function getLevelNumberFromRole(role:Role) {
    if (role.name.includes('Level')) {
        return parseInt(role.name.match(/[0-9]+/)[0]);
    }
    return undefined;
}
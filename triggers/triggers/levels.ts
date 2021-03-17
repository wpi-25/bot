import { TriggeredCommand } from '../../Types';
import { config } from '../..';
import { rand } from '../../util/math';
import {
    getLevelNumber,
    getUserLevel,
    redisClient,
    setUserLevel,
    setLevelRoles,
    queuedLevelUpdates,
} from '../../util/levels';

module.exports = <TriggeredCommand>{
    trigger: () => true, // Trigger on every message
    async execute(message) {
        if (
            redisClient && 
            !(
                message.content.startsWith(config.prefix) ||
                config.levels.ignorePrefix.find(
                    element => message.content.startsWith(element)
                )
            )
        ){
            // If levels are enabled and it's not a command
            const uid = message.author.id;
            const level = await getUserLevel(uid);

            level.count++;
            if (
                level.xp == null ||
                message.createdAt.getTime() - level.last.getTime() >=
                    config.levels.timeout
            ) {
                if (!level.xp) level.xp = 0;
                level.xp += Math.round(rand(config.levels.xpRange)); // Random from min to max in xpRange
            }
            level.last = message.createdAt;
            const newLevel = getLevelNumber(level.xp);
            const levelUpdateQueued = queuedLevelUpdates.includes(
                message.author.id
            );
            if (newLevel != level.level || levelUpdateQueued) {
                if (newLevel > level.level) {
                    message.reply(
                        `🎉 Congrats! You just leveled up to level ${newLevel}!`
                    );
                }

                const member = message.member;

                const changedStuff = await setLevelRoles(member, newLevel);
                if (levelUpdateQueued) {
                    console.log(
                        `${member.displayName} had an update queued so their roles were updated (something happened: ${changedStuff})`
                    );
                    queuedLevelUpdates.splice(
                        queuedLevelUpdates.indexOf(member.id),
                        1
                    );
                }
            }

            await setUserLevel(uid, level);
        }
    },
};

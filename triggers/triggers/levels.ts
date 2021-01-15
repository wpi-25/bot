import { TriggeredCommand } from "../../Types";
import { config } from "../..";
import { rand } from "../../util/math";
import { getLevelNumber, getUserLevel, redisClient, setUserLevel } from "../../util/levels";

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
            }

            await setUserLevel(uid, level);
        }
    }
}
import { Command } from '../../Types';
import { redisClient, setUserLevel } from '../../util/levels';
import { getIDFromMention } from '../../util/text';

module.exports = <Command>{
    name: 'lvlclear',
    aliases: ['levelclear'],
    description: 'Clear someone\'s levels',
    requiredPerms: 'admin',
    args: '<user/snowflake>',
    minArgs: 1,
    async execute(message, args) {
        if (!redisClient) throw 'Levels are not enabled!';
        let uid = getIDFromMention(args[0]);
        setUserLevel(uid, {count: 0, xp: 0, level: 0, last:new Date(0)});
    }
}
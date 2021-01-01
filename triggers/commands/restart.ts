import { shutdown } from '../../helpers/lifecycle';
import { Command } from '../../Types';

module.exports = <Command>{
    name: 'restart',
    description: 'Restart/update the bot',
    requiredPerms: 'admin',
    async execute(message) {
        await message.reply('i\'ll be back!');
        shutdown();
    }
}
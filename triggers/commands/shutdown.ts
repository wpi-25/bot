import { shutdown } from '../../helpers/lifecycle';
import { Command } from '../../Types';

module.exports = <Command>{
    name: 'shutdown',
    aliases: ['die', 'sd'],
    description: 'Shutdown the bot',
    requiredPerms: 'admin',
    async execute(message) {
        await message.reply('shutting down!');
        shutdown(true);
    },
};

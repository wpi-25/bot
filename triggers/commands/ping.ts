import { Command } from '../../Types';

module.exports = <Command>{
    name: 'ping',
    description: 'Pong!',
    async execute(message) {
        message.channel.send('Pong!');
    },
};

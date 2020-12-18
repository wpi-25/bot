import { Command } from "../../Types";

module.exports = <Command> {
    name: 'ping',
    description: 'Pong!',
    execute(message) {
        message.channel.send('Pong!');
    }
}
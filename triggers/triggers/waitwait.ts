import { TriggeredCommand } from "../../Types";

module.exports = <TriggeredCommand> {
    trigger: 'wait wait',
    execute(message) {
        message.channel.send('don\'t tell me');
    }
}
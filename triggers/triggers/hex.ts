import { MessageEmbed, MessageMentions } from 'discord.js';
import { TriggeredCommand } from '../../Types';

module.exports = <TriggeredCommand>{
    trigger: (message) =>
        message.content.match(/(#[0-9a-fA-F]{6})/g)?.filter((match) => {
            // If there's no matches, ?. just returns undefined for the whole object and we won't evaluate anymore
            // We're trying to get rid of any false positives - part of a channel tag
            const channels = message.content.match(
                MessageMentions.CHANNELS_PATTERN
            );
            if (!channels) return true; // If there're'n't any channels, we don't have to worry about it
            let includes = false;
            channels.forEach((channel) => {
                if (channel.includes(match)) {
                    // If this match is part of a channel
                    includes = true;
                }
            });
            return !includes; // False if it's there
        }),
    async execute(message, args: RegExpMatchArray) {
        args.forEach((val) => {
            message.channel.send(
                new MessageEmbed().setTitle(val.toLowerCase()).setColor(val)
            );
        });
    },
};

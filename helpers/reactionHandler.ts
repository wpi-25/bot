import {
    MessageReaction,
    User,
    PartialUser,
    Emoji,
    TextChannel,
    DMChannel,
} from 'discord.js';
import { client } from '..';
import { reactions } from './modules';

const react = async (reaction: MessageReaction, user: User | PartialUser) => {
    const channel = <TextChannel | DMChannel>reaction.message.channel;
    console.log(
        `${user.tag} reacted with ${reaction.emoji.name} in #${
            'name' in channel ? channel.name : channel.recipient.username
        }`
    );
    reactions.forEach((command) => {
        let evaluatorOutput = undefined;
        switch (typeof command.trigger) {
            case 'object':
                if (Array.isArray(command.trigger)) {
                    command.trigger.findIndex((e: Emoji | string) => {
                        switch (typeof e) {
                            case 'object': // It's an Emoji
                                return reaction.emoji.id == e.id;

                            case 'string':
                                if (e.length > 1) {
                                    return reaction.emoji.id == e;
                                } else {
                                    return reaction.emoji.name == e;
                                }
                        }
                    });
                }
                break;

            case 'string':
                if (command.trigger.length > 1) {
                    evaluatorOutput = reaction.emoji.id == command.trigger;
                } else {
                    evaluatorOutput = reaction.emoji.name == command.trigger;
                }
                break;
        }
        if (evaluatorOutput) {
            command.execute(reaction, user, evaluatorOutput);
        }
    });
};

export function setupReactionListeners() {
    client.on('messageReactionAdd', react);
}

import { Message, MessageEmbed } from 'discord.js';
import { client, config } from '..';
import { hasPermission } from '../Permissions';
import { getCommand } from '../util/commands';
import { triggers } from './modules';

const onMessage = async (message: Message) => {
    // TODO: Do we want it to log all messages?
    // console.log(`in #${message.channel.type != 'dm' ? message.channel.name : message.channel.recipient} by @${message.author.tag}: ${message.content}`);
    processCommands(message);
    processTriggers(message);
};

const processCommands = async (message: Message) => {
    // Look for and run commands
    if (!message.author.bot && message.content.startsWith(config.prefix)) {
        const args = message.content.slice(config.prefix.length).split(/ +/);
        const trigger = args.shift().toLowerCase();
        console.log(`Found command ${trigger}`);
        try {
            const command = getCommand(trigger);
            let caughtError = false;
            if (!command) throw `Command ${trigger}`;
            if (command.args && !args.length) {
                if (command.minArgs && args.length < command.minArgs) {
                    message.reply(
                        `You need to provide more arguments for this command!\nUsage: \`${config.prefix}${trigger} ${command.args}\``
                    );
                    caughtError = true;
                }
            }
            if (command.guildOnly && !message.guild) {
                message.reply(`You must use this command within a guild!`);
                caughtError = true;
            }
            if (!caughtError && hasPermission(message, command)) {
                await command.execute(message, args, client);
            } else if (!caughtError) {
                message.reply("You can't do that!");
            }
        } catch (e) {
            console.warn(e);
            if (typeof e == 'string' && e.startsWith('Command')) {
                await message.reply("😕 That's not a command!");
            } else {
                const error = new MessageEmbed()
                    .setColor('#f44336')
                    // @ts-ignore because the compiler was complaining about converting the `any` to a string
                    .setDescription(`${e || '*no error content*'}`);
                console.warn(`WARN: ${e}`);
                await message.reply({
                    content: "🤬 That didn't work!",
                    embeds: [error],
                });
            }
        }
    }
};

const processTriggers = async (message: Message) => {
    // Look for and run triggers
    if (!message.author.bot) {
        triggers.forEach(async (trigger) => {
            try {
                let evaluatorOutput = undefined;
                switch (typeof trigger.trigger) {
                    case 'object': // RegExp
                        evaluatorOutput = message.content.match(
                            <RegExp>trigger.trigger
                        );
                        break;

                    case 'string':
                        evaluatorOutput = message.content.includes(
                            trigger.trigger
                        );
                        break;

                    case 'function':
                        evaluatorOutput = trigger.trigger(message);
                        break;
                }
                if (evaluatorOutput) {
                    // We got *something*... pass it on
                    await trigger.execute(message, evaluatorOutput);
                }
            } catch (e) {
                const error = new MessageEmbed()
                    .setColor('#f44336')
                    // @ts-ignore because the compiler was complaining about converting the `any` to a string
                    .setDescription(`${e}`);
                console.warn(`WARN: ${e}`);
                message.reply({
                    content: "🤬 That didn't work!",
                    embeds: [error],
                });
            }
        });
    }
};

export function setupMessageListeners() {
    client.on('messageCreate', onMessage);
}

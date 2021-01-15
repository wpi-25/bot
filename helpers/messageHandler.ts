import { Message, MessageEmbed } from "discord.js";
import { client, config } from "..";
import { hasPermission } from "../Permissions";
import { getCommand } from "../util/commands";
import { triggers } from "./modules";

const onMessage = async (message:Message) => {
    // TODO: Do we want it to log all messages?
    // console.log(`in #${message.channel.type != 'dm' ? message.channel.name : message.channel.recipient} by @${message.author.tag}: ${message.content}`);
    processCommands(message);
    processTriggers(message);
}

const processCommands = async (message:Message) => {
    // Look for and run commands
    if (!message.author.bot && message.content.startsWith(config.prefix)) {
        const args = message.content.slice(config.prefix.length).split(/ +/);
        const trigger = args.shift().toLowerCase();
        console.log(`Found command ${trigger}`);
        try {
            let command = getCommand(trigger);
            let caughtError = false;
            if (!command) throw `Command ${trigger}`;
            if (command.args && !args.length) {
                if (command.minArgs && args.length < command.minArgs) {
                    message.reply(`You need to provide more arguments for this command!\nUsage: \`${config.prefix}${trigger} ${command.args}\``)
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
                message.reply('You can\'t do that!');
            }
        } catch (e) {
            console.warn(e);
            if (typeof e == 'string' && e.startsWith('Command')) {
                const error = new MessageEmbed()
                    .setColor('#ff9800')
                    .setTitle('😕 That\'s not a command!')
                    .setDescription(e);
                    let errorMessage = await message.reply(error);
            } else {
                const error = new MessageEmbed()
                    .setColor('#f44336')
                    .setTitle('🤬 That didn\'t work!')
                    .setDescription(e);
                let errorMessage = await message.reply(error);
                let helpMessage = `Something went wrong! Check https://discordapp.com/channels/${errorMessage.guild.id}/${errorMessage.channel.id}/${errorMessage.id}`;
            }
        }
    }
}

const processTriggers = async (message:Message) => {  // Look for and run triggers
    if (!message.author.bot) {
        triggers.forEach(async trigger => {
            try {
                let evaluatorOutput = undefined;
                switch (typeof trigger.trigger) {
                    case 'object': // RegExp
                        evaluatorOutput = message.content.match(<RegExp>trigger.trigger);
                        break;
                    
                    case 'string':
                        evaluatorOutput = message.content.includes(trigger.trigger);
                        break;
                    
                    case 'function':
                        evaluatorOutput = trigger.trigger(message);
                        break;
                }
                if (evaluatorOutput) {  // We got *something*... pass it on
                    await trigger.execute(message, evaluatorOutput, client);
                }
            } catch (e) {
                const error = new MessageEmbed()
                    .setColor('#f44336')
                    .setTitle('🤬 That didn\'t work!')
                    .setDescription(e);
                message.reply(error);
            }
        });
    }
}

export function setupMessageListeners() {
    client.on('message', onMessage);
}
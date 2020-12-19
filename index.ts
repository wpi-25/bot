import {
    Client,
    Collection,
    GuildMember,
    Message,
    MessageEmbed,
    MessageReaction,
    PartialGuildMember,
    PartialUser,
    User,
    VoiceChannel
} from "discord.js";
import * as readline from 'readline';
import { readdirSync } from "fs";
import { getCommand } from './util/commands';
import { Command, ReactionCommand, TriggeredCommand } from "./Types";
import { hasPermission } from "./Permissions";
import * as bot_config from './config.json';

export const config = bot_config;

export const client = new Client();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question(" ===== Press [ENTER] to shutdown cleanly =====\n", a => shutdown(true));

export const shutdown = (really?:boolean) => {
    client.destroy();
    rl.close();
    if (really) console.log(' ===== Shutting down =====\n');
    else console.log(' ===== Restarting =====\n');
    process.exit(really ? 1 : 0);
}

// Import trigger modules
export const commands = new Collection<string, Command>();
const commandFiles = readdirSync('./triggers/commands').filter(file=>file.endsWith('.ts')||file.endsWith('.js'));
for (const file of commandFiles) {
    console.log(`Importing command ${file}`);
    const command:Command = require(`./triggers/commands/${file}`);
    commands.set(command.name, command);
    console.log(`Imported command ${command.name}`);
}
console.log('Imported commands\n');

export const triggers = new Collection<string, TriggeredCommand>();
const triggerFiles = readdirSync('./triggers/triggers').filter(file=>file.endsWith('.ts')||file.endsWith('.js'));
for (const file of triggerFiles) {
    let name = file.slice(0, -3);
    console.log(`Importing trigger ${file}`);
    const trigger:TriggeredCommand = require(`./triggers/triggers/${file}`);
    triggers.set(name, trigger);
    console.log(`Imported trigger ${name}`);
}
console.log('Imported triggers\n');

export const reactions = new Collection<string, ReactionCommand>();
const reactionFiles = readdirSync('./triggers/reactions').filter(file=>file.endsWith('.ts')||file.endsWith('.js'));
for (const file of reactionFiles) {
    let name = file.slice(0, -3);
    console.log(`Importing reaction command ${file}`);
    const reaction:ReactionCommand = require(`./triggers/reactions/${file}`);
    reactions.set(name, reaction);
    console.log(`Imported reaction command ${name}`);
}
console.log('Imported reaction commands\n');

client.on('ready', ()=>{
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setPresence({activity:{'type':'WATCHING',name:'🐐'}});
    updateMembers();
});

const message = async (message:Message) => {
    // TODO: Do we want it to log all messages?
    // console.log(`in #${message.channel.type != 'dm' ? message.channel.name : message.channel.recipient} by @${message.author.tag}: ${message.content}`);

    const lower = message.content.toLowerCase();
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
                if (args.length < command.minArgs) {
                    message.reply(`You need to provide more arguments for this command!\nUsage: \`${config.prefix}${trigger} ${command.args}\``)
                    caughtError = true;
                }
            }
            if (command.guildOnly && !message.guild) {
                message.reply(`You must use this command within a guild!`);
                caughtError = true;
            }
            if (!caughtError && hasPermission(message, command)) {
                command.execute(message, args, client);
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

    // Look for and run triggers
    if (!message.author.bot) {
        triggers.forEach(trigger => {
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
                trigger.execute(message, evaluatorOutput, client);
            }
        })
    }
}

const react = async (reaction:MessageReaction, user:User|PartialUser) => {
    console.log(`${user.tag} reacted with ${reaction.emoji.name} in #${reaction.message.channel.id}`);
    reactions.forEach(command => {
        let evaluatorOutput = undefined;
        switch (typeof command.trigger) {
            case 'object':
                if (Array.isArray(command.trigger)) {
                    command.trigger.findIndex((e) => {
                        switch (typeof e) {
                            case 'object':   // It's an Emoji
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
            command.execute(reaction, user, evaluatorOutput, client);
        }
    });
}

client.on('message', message);
client.on('messageReactionAdd', react);

const updateMembers = (member?:GuildMember|PartialGuildMember) => {
    if (!member || member.guild.id == config.memberCountGuild.guild) {
        let guild = client.guilds.cache.get(config.memberCountGuild.guild);
        // @ts-ignore
        let channel:VoiceChannel = client.channels.cache.get(config.memberCountGuild.channel);
        channel.setName(`${guild.memberCount} Members`);
    }
}

client.on('guildMemberAdd', member => { console.log(`${member.displayName} joined`); updateMembers(member);});
client.on('guildMemberRemove', member => {console.log(`${member.displayName} left`);updateMembers(member);});

client.login(config.token);

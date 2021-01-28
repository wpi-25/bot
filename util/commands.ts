import { Message, Snowflake } from 'discord.js';
import { config } from '..';
import { commands } from '../helpers/modules';
import { Command } from '../Types';

export const getCommand = (trigger: string) =>
    commands.find(
        (cmd) =>
            trigger == cmd.name || // Is this the command's name? OR
            (cmd.aliases && cmd.aliases.includes(trigger)) // Does the command have aliases which include the trigger
    );
export const getUsage = (command: Command) =>
    `${config.prefix}${command.name} ${command.args ? command.args : ''}`;

export const commandAllowed = (
    message: Message,
    rule: { [key: string]: string | string[] }
) => {
    if (rule && message.guild.id in rule) {
        // If there's a rule defined and the guild is in the rule
        switch (
            typeof rule[message.guild.id] // And the rule for this guild is
        ) {
            case 'string': // A string,
                return message.channel.id == rule[message.guild.id]; // Check if this is the right channel

            case 'object': // If it's an array,
                return (<Array<Snowflake>>rule[message.guild.id]).includes(
                    message.channel.id
                ); // Check if this channel is in the array
        }
    }
    return true; // If there's no rule defined or this guild is not in the rule, we're OK
};

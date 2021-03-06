import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { Command, ReactionCommand, TriggeredCommand } from '../Types';

// Import trigger modules
export const commands = new Collection<string, Command>();
const commandFiles = readdirSync('./triggers/commands').filter((file) =>
    file.endsWith('.ts')
);
for (const file of commandFiles) {
    // console.log(`Importing command ${file}`);
    try {
        const command: Command = require(`../triggers/commands/${file}`);
        commands.set(command.name, command);
        console.log(`Imported command ${command.name}`);
    } catch (e) {
        console.warn(
            `[WARN]\tCould not import command ${file.slice(0, -3)}\n`,
            e
        );
    }
}
// console.log('Imported commands\n');

export const triggers = new Collection<string, TriggeredCommand>();
const triggerFiles = readdirSync('./triggers/triggers').filter((file) =>
    file.endsWith('.ts')
);
for (const file of triggerFiles) {
    const name = file.slice(0, -3);
    // console.log(`Importing trigger ${file}`);
    try {
        const trigger: TriggeredCommand = require(`../triggers/triggers/${file}`);
        triggers.set(name, trigger);
        console.log(`Imported trigger ${name}`);
    } catch (e) {
        console.warn(`[WARN]\tCould not import trigger ${name}\n`, e);
    }
}
// console.log('Imported triggers\n');

export const reactions = new Collection<string, ReactionCommand>();
const reactionFiles = readdirSync('./triggers/reactions').filter((file) =>
    file.endsWith('.ts')
);
for (const file of reactionFiles) {
    const name = file.slice(0, -3);
    // console.log(`Importing reaction command ${file}`);
    try {
        const reaction: ReactionCommand = require(`../triggers/reactions/${file}`);
        reactions.set(name, reaction);
        console.log(`Imported reaction command ${name}`);
    } catch (e) {
        console.warn(`[WARN]\tCould not import trigger ${name}\n`, e);
    }
}
// console.log('Imported reaction commands\n');

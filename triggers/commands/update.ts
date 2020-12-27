import { exec } from 'child_process';
import { Message, MessageEmbed } from 'discord.js';
import { shutdown } from '../..';
import { Command } from '../../Types';

module.exports = <Command> {
    name: 'update',
    description: 'Update to the latest commit from GitHub',
    requiredPerms: 'admin',
    async execute (message) {
        updateBot(message);
    }
}

export const updateBot = (message?:Message) => {
    if (message) message.channel.startTyping();
    let process = exec('git pull', (error, stdout, stderr) => {
        console.log({error, stdout, stderr});
    });
    process.on('close', async code => {
        message.channel.stopTyping();
        if (code == 0) {
            if (message) await message.channel.send('Restarting...');
            shutdown();
        } else {
            message.channel.send('Something went wrong... Please check the logs and try again');
        }
    });
}
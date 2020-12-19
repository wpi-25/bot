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
    exec('git pull', async (err, stdout, stderr) => {
        if (message) message.channel.stopTyping();
        if (err) {
            message.channel.send({
                embed: new MessageEmbed()
                    .setTitle('Node Errored')
                    .setColor('RED')
                    .setDescription(err)
            });
        }
        if (stdout) {
            message.channel.send({
                embed: new MessageEmbed()
                    .setTitle('Command Output')
                    .setColor('GREEN')
                    .setDescription(stdout)
            });
        }
        if (stderr) {
            message.channel.send({
                embed: new MessageEmbed()
                    .setTitle('Command Errored')
                    .setColor('RED')
                    .setDescription(stderr)
            });
        }

        if (!err && !stderr && !stdout.includes('Already up to date.')) {
            if (message) await message.channel.send('Restarting...');
            shutdown();
        }
    });
}
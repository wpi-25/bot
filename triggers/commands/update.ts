import { exec } from 'child_process';
import { Message } from 'discord.js';
import { shutdown } from '../../helpers/lifecycle';
import { Command } from '../../Types';

module.exports = <Command>{
    name: 'update',
    description: 'Update to the latest commit from GitHub',
    requiredPerms: 'admin',
    async execute(message) {
        updateBot(message);
    },
};

export const updateBot = (message?: Message) => {
    if (message) message.channel.startTyping();
    exec('git pull', async (error, stdout, stderr) => {
        console.log({ error, stdout, stderr });
        message.channel.stopTyping();
        await message.channel.send(
            '```\n' + stdout + '\n``````\n' + stderr + '\n```'
        );
        if (error == null && !stdout.includes('up to date')) {
            if (message) await message.channel.send('Restarting...');
            shutdown();
        } else {
            message.channel.send(
                'Something went wrong... Please check the logs and try again'
            );
        }
    });
};

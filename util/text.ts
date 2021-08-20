import { HexColorString, Snowflake } from 'discord.js';
import { rand } from './math';

export const getTextAfter = (fragment: string, main: string) =>
    main.substr(main.indexOf(fragment) + fragment.length);

export const getIDFromMention = (mention: string) => {
    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);
        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }
    } else if (!mention.match(/[0-9]+/)) {
        throw 'incorrectly formatted mention';
    }

    return mention;
};

export const getIDFromTag = (mention: string) => {
    if (mention.startsWith('<#') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);
    } else {
        throw 'incorrectly formatted mention';
    }

    return mention;
};

export function getRandomHexColor() {
    const color = <HexColorString>`#${rand([0, 0xffffff]).toString(16)}`;
    return color;
}

export function getChannelList(list: string | Array<Snowflake>) {
    return list
        ? typeof list == 'string'
            ? `<#${list}>`
            : getChannelListFromArray(list)
        : 'anywhere';
}

export function getChannelListFromArray(list: Array<Snowflake>) {
    let out = '';
    list.forEach((id, i) => {
        out += `<#${id}>${i != list.length - 1 ? ', ' : ''}`;
    });
    return out;
}

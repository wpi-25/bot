import { rand } from "./math";

export const getTextAfter = (fragment:string, main:string) => main.substr(main.indexOf(fragment) + fragment.length);

export const getIDFromMention = (mention:string) => {
    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);
        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }
    } else if (!mention.match(/[0-9]+/)) {
        throw 'incorrectly formatted mention';
    }
    
    return mention;
}

export const getIDFromTag = (mention:string) => {
    if (mention.startsWith('<#') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);
    } else {
        throw 'incorrectly formatted mention';
    }
    
    return mention;
}

export function getRandomHexColor() {
    return `#${rand([0, 0xffffff]).toString(16)}`;
}
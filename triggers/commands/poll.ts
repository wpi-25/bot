import { EmbedFieldData, MessageEmbed, TextChannel } from 'discord.js';
import { Command } from '../../Types';
import { getIDFromTag } from '../../util/text';


module.exports = <Command>{
    name: 'poll',
    description: 'Starts a poll in the current channel',
    args: '<description> <poll options>',
    requiredPerms: 'admin',
    guildOnly: true,
    async execute(message, args) { 

        let descStart = 0
        let descEnd = 0
        for (var i:number = 0; i < args.length; i++) {
            if (args[i].startsWith("\"")) {

                descStart = i
            } else if (args[i].endsWith("\"")) {

                descEnd = i
                break
            }
        }

        let descriptionArr = args.slice(descStart, descEnd+1);

        let description = "" 
        for (var i:number = 0; i < descriptionArr.length; i++) {
            description += `${descriptionArr[i]} `
        }


        description = description.slice(1,-2)

        let choiceStart = descEnd + 1
        let choiceArg = args.slice(choiceStart);
        console.log(`Choice arg: ${choiceArg}`)


        
        let isMultiWordChoice = false;
        let choices = new Array<string>();
        let tmpChoiceStart = 0;
        let tmpChoiceEnd = 0;
        for (var i:number = 0; i < choiceArg.length; i++) {
            let currentChoice = choiceArg[i]
            console.log(currentChoice)
            if (currentChoice.startsWith("\"")) {
                if (currentChoice.endsWith("\"")) {
                    choices.push(currentChoice.slice(1,-1))
                    console.log(`Added single-word choice ${currentChoice.slice(1,-1)}`)
                    continue
                } else {
                    console.log("Found multi-word choice")
                    isMultiWordChoice = true;
                    tmpChoiceStart = i;
                    console.log(tmpChoiceStart)
                    continue
                }
            } else if (currentChoice.endsWith("\"")) {
                tmpChoiceEnd = i;
                console.log(tmpChoiceEnd)
                let tmpChoiceArr = choiceArg.slice(tmpChoiceStart, tmpChoiceEnd+1);
                console.log(tmpChoiceArr)
                let tmpChoice = "";
                for (var k:number = 0; k < tmpChoiceArr.length; k++) {
                    tmpChoice += `${tmpChoiceArr[k]} `
                }
                choices.push(tmpChoice.slice(1,-2))
                console.log(`Added multi-word choice ${tmpChoice}`)
                isMultiWordChoice = false;
                continue
            } else {
                choices.push(currentChoice)
                console.log(`Added choice ${currentChoice}`)
                continue
            }
            
        }

        
        let embedFields = new Array<EmbedFieldData>();
        let reactions = new Array<string>()
        console.log(`Choices: ${choices}`)
        for (var i:number = 0; i < choices.length; i++) {
            let choice = choices[i];
           let choiceProc = choice.split(",");
            console.log(`Processed choice: ${choiceProc}`)
            embedFields.push({name: `${choiceProc[0]}`, value: `​${choiceProc[1]}`, inline: true})
            reactions.push(choiceProc[1])
        }

        const embed = new MessageEmbed()
            .setTitle(description)
            .addFields(embedFields)
        
        let respMsg = message.channel.send(embed);

        for (var i:number = 0; i < reactions.length; i++) {
            (await respMsg).react(reactions[i])
        }
    }
}

import { Message } from "discord.js";


export const sendMsgOrPaste(origMessage:Message, newMessage:string) {
    if (newMessage.length > 2000) {
        let blobData = new Blob(newMessage, {type: "text/plain"})
        const response = await fetch("http://0x0.st", {
            method: 'POST',
            body: blobData
        })
    }
}

node_OnSlashCommand({
    trigger: "levelup",
    action: (data: slashCommandData) => {
        node_GreaterThan(
            {
                a: node_UserInfo({ user: data.user })["age"], b: 5,
                nextIfTrue: () => { node_SendMessage({ text: node_Text({ inputText: "You just leveled up" })["outputText"], channel: data["channel"] }) },
                nextIfFalse: () => { }
            })
    }
})

function node_GreaterThan(inputs: { a: number, b: number, nextIfTrue: () => void, nextIfFalse: () => void }): void {
    if (inputs["a"] > inputs["b"]) { inputs["nextIfTrue"]() }
    else { inputs["nextIfFalse"]() }
}

function node_SendMessage(inputs: { text: string, channel: channel }): void {
    //todo: implement this via discord.js
}

function node_OnSlashCommand(inputs: { trigger: string, action: (data: slashCommandData) => void }): void {
    //todo: implement this via discord.js
}

function node_Text(inputs: { inputText: string }): { outputText: string } {
    return { outputText: inputs["inputText"] }
}

function node_UserInfo(inputs: { user }): { age: number } {
    return { age: inputs["user"]["age"] }
}
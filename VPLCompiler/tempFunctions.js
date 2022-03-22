function node_OnSlashCommand(obj) {
    console.log("made a slash command with trigger: " + obj.trigger)
    console.log("running it now!")
    obj.next(
        {
            channel: "veryCoolTestChannel",
            user: "PogchampMan"
        }

    )
}

function node_IfElse(obj) {
    if (obj.expression === true) obj.if()
    else obj.else()
}

function node_Number(obj) {
    return { outputNumber: obj.inputNumber }
}

function node_GreaterThan(obj) {
    return { result: (obj.a > obj.b) }
}

function node_SendMessage(obj) {
    console.log("Mock sending message: " + obj.inputText + " in channel: " + obj.channel)
}

export default {
    node_OnSlashCommand,
    node_IfElse,
    node_Number,
    node_GreaterThan,
    node_SendMessage
}
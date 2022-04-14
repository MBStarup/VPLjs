import nodeFunctions from "../tempFunctions.js";
nodeFunctions.node_OnSlashCommand(
    {
        trigger: 'useCommand',
        next: (OnSlashCommand_data) => {
            nodeFunctions.node_IfElse(
                {
                    expression: nodeFunctions.node_GreaterThan(
                        {
                            a: 6,
                            b: 4
                        }).result,
                    if: () => {
                        nodeFunctions.node_SendMessage(
                            {
                                channel: OnSlashCommand_data.channel,
                                text: OnSlashCommand_data.text
                            })
                    }, else: () => {
                        nodeFunctions.node_SendMessage(
                            {
                                channel: OnSlashCommand_data.channel,
                                text: 'nope'
                            })
                    }
                })
        }
    })
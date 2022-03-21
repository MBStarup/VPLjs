import graph from './json/smallExample.json' assert {type: "json"}
import fs from 'fs'

fs.writeFile('./test.js', recFillParams(graph, graph.nodes[0]), 'utf8', err => {
    if (err) console.log(err)
    else {
        console.log('success')
    }
})

function setType(string, type) {
    switch (type) {
        case 'text': {
            return `'${string}'` // return as string
        }
        case 'number': {
            return string // return as number
        }
    }
}

function recFillParams(graph, node) {
    let result = `node_${node.name}({`

    node.inputs.forEach(input => {
        result += input.name + ":"
        if (!input.isComingFromOtherBox) {
            result += setType(input.value, input.type) + ","
        } else {
            let connection = graph.connections.find((con) => { return con.in.plug === input.name })
            let nextNode = graph.nodes.find((n) => { return n.id === connection.out.node })
            result += `${recFillParams(graph, nextNode)}.${connection.out.plug},`
        }
    })

    result = result.substring(0, result.length - 1) // remove "," from earliner
    return result + "})"
}
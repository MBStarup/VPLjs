/// <reference path="Graph.ts" />

class GraphRenderer {
    private pos: number = 1
    private rendered: GraphNode[] = []

    private container: HTMLDivElement

    constructor(container: HTMLDivElement) {
        this.container = container
    }

    public RenderNode(n: GraphNode, p: [x: number, y: number]) {
        if (this.rendered.indexOf(n) === -1) {

            let nodeDiv = document.createElement("div")
            nodeDiv.classList.add("node" + this.pos++)
            nodeDiv.setAttribute("style", "pointer-events:all;width:100px;height:100px;background-color:#ff0000;position:absolute;top:" + p[1].toString() + "px;left:" + p[0].toString() + "px")
            nodeDiv.addEventListener("click", (e) => { nodeDiv.style.backgroundColor = "#00ff00" })

            let inputDiv = document.createElement("div")
            inputDiv.classList.add("input")
            nodeDiv.appendChild(inputDiv)
            n.Inputs?.forEach(input => {
                let elem = document.createElement("div")
                elem.classList.add(GraphType[input.Type])
                inputDiv.appendChild(elem)
            });

            let outputDiv = document.createElement("div")
            outputDiv.classList.add("output")
            nodeDiv.appendChild(outputDiv)
            n.Outputs?.forEach(output => {
                let elem = document.createElement("div")
                elem.classList.add(GraphType[output.Type])
                outputDiv.appendChild(elem)
            });

            this.container.appendChild(nodeDiv)
            this.rendered.push(n)
        }
    }

}
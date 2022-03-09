/// <reference path="Graph.ts" />

class GraphEditor {
    nodes: Pair<GraphNode, [number, number]>[] = []
    container: HTMLDivElement;

    constructor(container: HTMLDivElement, bg: HTMLDivElement, graph: Graph) {
        bg.addEventListener("click", this.onClick.bind(this)) //Don't know how "bind" works, but it makes it so the event fucntion has the instance of GraphEditor as 'this' instead of somehting else
        this.container = container;
    }

    onClick(event: MouseEvent) {
        let n = new GraphNode([new GraphPlug(GraphType.Num), new GraphPlug(GraphType.Text), new GraphPlug(GraphType.Emoji)], [new GraphPlug(GraphType.Num), new GraphPlug(GraphType.Time)]);

        this.nodes.push(new Pair(n, [event.clientX, event.clientY]));
        let div = this.RenderNode(n, [event.clientX, event.clientY])
        div.addEventListener("click", (e) => { div.style.backgroundColor = "#00ffff" });
        //div.addEventListener("drag")
    }

    RenderNode(n: GraphNode, p: [x: number, y: number]): HTMLDivElement {
        let nodeDiv = document.createElement("div")
        nodeDiv.classList.add("node")
        nodeDiv.setAttribute("style", "top: " + p[1].toString() + "px; left: " + p[0].toString() + "px")


        let headerDiv = document.createElement("div")
        headerDiv.classList.add("header")
        headerDiv.innerText = "HEADER";
        headerDiv.addEventListener("mousedown", (e) => this.dragNode(e, nodeDiv))
        let bodyDiv = document.createElement("div")
        bodyDiv.classList.add("body")

        nodeDiv.appendChild(headerDiv)
        nodeDiv.appendChild(bodyDiv)


        let inputListDiv = document.createElement("div")
        inputListDiv.classList.add("inputList")
        bodyDiv.appendChild(inputListDiv)
        n.Inputs?.forEach(input => {
            let inputDiv = document.createElement("div")
            inputDiv.classList.add("input")
            let elem = document.createElement("div")
            let text = document.createElement("p")
            elem.classList.add("typeDot", GraphType[input.Type])
            elem.setAttribute("style", "background-color:" + getColor(input.Type))
            text.innerHTML = GraphType[input.Type]
            inputDiv.appendChild(elem)
            inputDiv.appendChild(text)
            inputListDiv.appendChild(inputDiv)
        });

        let outputListDiv = document.createElement("div")
        outputListDiv.classList.add("outputList")
        bodyDiv.appendChild(outputListDiv)
        n.Outputs?.forEach(output => {
            let outputDiv = document.createElement("div")
            outputDiv.classList.add("output")
            let elem = document.createElement("div")
            let text = document.createElement("p")
            elem.classList.add("typeDot", GraphType[output.Type])
            elem.setAttribute("style", "background-color:" + getColor(output.Type))
            text.innerHTML = GraphType[output.Type]
            outputDiv.appendChild(elem)
            outputDiv.appendChild(text)
            outputListDiv.appendChild(outputDiv)
        });

        this.container.appendChild(nodeDiv)
        return nodeDiv;


    }

    dragNode(e: MouseEvent, node: HTMLDivElement) { //https://www.w3schools.com/howto/howto_js_draggable.asp

        let newX;
        let newY;
        let oldX = e.clientX;
        let oldY = e.clientY;

        node.style.zIndex = "1";

        node.addEventListener("mouseup", stopDragNode)
        node.addEventListener("mousemove", dragMove)

        function dragMove(e: MouseEvent) {
            newX = oldX - e.clientX;
            newY = oldY - e.clientY;
            oldX = e.clientX;
            oldY = e.clientY;
            // set the element's new position:
            node.style.top = (node.offsetTop - newY) + "px";
            node.style.left = (node.offsetLeft - newX) + "px";
        }

        function stopDragNode(e: MouseEvent,) {
            node.removeEventListener("mouseup", stopDragNode)
            node.removeEventListener("mousemove", dragMove)
            node.style.zIndex = null;
        }
    }

}

//move to css maybe
function getColor(nodeType: number): string {
    let colors: string[] = []
    colors[GraphType.Bool] = "#cc0000"
    colors[GraphType.Category] = "#330000"
    colors[GraphType.Channel] = "#333300"
    colors[GraphType.Num] = "#330033"
    colors[GraphType.Text] = "#3333ff"

    return colors[nodeType] ?? "#f030a0";
}

function dragMove(arg0: string, dragMove: any) {
    throw new Error("Function not implemented.");
}

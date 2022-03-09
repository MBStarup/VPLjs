/// <reference path="Graph.ts" />

class GraphEditor {
    nodes: Pair<GraphNode, [number, number]>[] = []
    container: HTMLDivElement;
    svgContainer: SVGElement;

    constructor(container: HTMLDivElement, bg: HTMLDivElement, svgContainer: SVGElement, graph: Graph) {
        bg.addEventListener("click", this.spawnNode.bind(this)) //Don't know how "bind" works, but it makes it so the event fucntion has the instance of GraphEditor as 'this' instead of somehting else
        this.container = container;
    }

    spawnNode(e: MouseEvent) {
        e.preventDefault()
        let n = new GraphNode([new GraphPlug(GraphType.Num), new GraphPlug(GraphType.Text), new GraphPlug(GraphType.Emoji)], [new GraphPlug(GraphType.Num), new GraphPlug(GraphType.Time)]);

        this.nodes.push(new Pair(n, [e.clientX, e.clientY]));
        let div = this.RenderNode(n, [e.clientX, e.clientY])
        //div.addEventListener("click", (e) => { div.style.backgroundColor = "#00ffff" });
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
            elem.addEventListener("mousedown", (e) => this.handleCurve(e, elem, input))
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
            elem.addEventListener("mousedown", (e) => this.handleCurve(e, elem, output))
            text.innerHTML = GraphType[output.Type]
            outputDiv.appendChild(elem)
            outputDiv.appendChild(text)
            outputListDiv.appendChild(outputDiv)
        });

        this.container.appendChild(nodeDiv)
        return nodeDiv;


    }

    handleCurve(e: MouseEvent, div: HTMLDivElement, plug: GraphPlug) {
        e.preventDefault()
        let startPosX = e.clientX;
        let startPosY = e.clientY;

        let curve = this.makeSVGElement("path")

        curve.setAttribute("fill", "none")
        curve.setAttribute("stroke", "red")
        curve.setAttribute("stroke-width", "8")

        document.addEventListener("mousemove", dragCurve)
        document.addEventListener("mouseup", releaseCurve)

        svgContainer.appendChild(curve)

        function dragCurve(e: MouseEvent) {
            console.log("Dragging: " + "M " + startPosX + " " + startPosY + " " + e.clientX + " " + e.clientY)
            curve.setAttribute("d", "M " + startPosX + " " + startPosY + " " + e.clientX + " " + e.clientY)
        }

        function releaseCurve(e: MouseEvent) {
            document.removeEventListener("mousemove", dragCurve)
            document.removeEventListener("mouseup", releaseCurve)
        }

    }

    //http://stackoverflow.com/a/3642265/1869660
    makeSVGElement(tag: string, attrs?: string[]): SVGElement {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs) {
            el.setAttribute(k, attrs[k]);
        }
        return el;
    }


    dragNode(e: MouseEvent, node: HTMLDivElement) { //https://www.w3schools.com/howto/howto_js_draggable.asp
        e.preventDefault()

        let newX;
        let newY;
        let oldX = e.clientX;
        let oldY = e.clientY;

        node.style.zIndex = "1";

        document.addEventListener("mouseup", stopDragNode)
        document.addEventListener("mousemove", dragMove)

        function dragMove(e: MouseEvent) {
            newX = oldX - e.clientX;
            newY = oldY - e.clientY;
            oldX = e.clientX;
            oldY = e.clientY;
            // set the element's new position:
            node.style.top = (node.offsetTop - newY) + "px";
            node.style.left = (node.offsetLeft - newX) + "px";
        }

        function stopDragNode(e: MouseEvent) {
            document.removeEventListener("mouseup", stopDragNode)
            document.removeEventListener("mousemove", dragMove)
            node.style.zIndex = null;
        }
    }
}
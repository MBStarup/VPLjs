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
        let start = new point(e.clientX, e.clientY)

        let curveSVG = this.makeSVGElement("path", { "fill": "none", "stroke": "red", "stroke-width": 3 })


        let scaler = 1.5;
        let center = new point(((start.x + e.clientX) / 2), ((start.y + e.clientY) / 2))
        let inverseSlope = (start.x - e.clientX) / (e.clientY - start.y)

        let a1 = ((start.y + center.y) / 2) - (((start.x + center.x) / 2) * inverseSlope)
        let p1 = new point(((start.x + center.x) / 2) + scaler, ((start.y + center.y) / 2) + inverseSlope * scaler + a1)
        let curve = new svgCurve(curveSVG, start, new point(e.clientX, e.clientY), p1)



        let dot = this.makeSVGElement("circle", { "fill": "blue", "r": 5, "pointer-events": "all" })

        document.addEventListener("mousemove", dragCurve)
        document.addEventListener("mouseup", releaseCurve)

        dot.addEventListener("mousedown", handleDot)
        function handleDot(e: MouseEvent) {


            document.addEventListener("mousemove", dragDot)
            document.addEventListener("mouseup", releaseDot)

            function dragDot(e: MouseEvent) {
                curve.setC1(new point(e.clientX, e.clientY))
                dot.setAttribute("cx", curve.c1.x.toString())
                dot.setAttribute("cy", curve.c1.y.toString())
            }

            function releaseDot(e: MouseEvent) {
                document.removeEventListener("mousemove", dragDot)
                document.removeEventListener("mouseup", releaseDot)
            }
        }

        svgContainer.appendChild(curveSVG)
        svgContainer.appendChild(dot)

        function dragCurve(e: MouseEvent) {
            let center = new point(((start.x + e.clientX) / 2), ((start.y + e.clientY) / 2))
            let p1 = center

            curve.setC1(p1)
            curve.setEnd(new point(e.clientX, e.clientY))

            dot.setAttribute("cx", curve.c1.x.toString())
            dot.setAttribute("cy", curve.c1.y.toString())
        }

        function releaseCurve(e: MouseEvent) {
            document.removeEventListener("mousemove", dragCurve)
            document.removeEventListener("mouseup", releaseCurve)
        }

    }

    //http://stackoverflow.com/a/3642265/1869660
    makeSVGElement(tag: string, attrs?: object): SVGElement {
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

class svgCurve {
    start: point
    end: point
    c1: point
    element: SVGElement

    constructor(element: SVGElement, start: point, end: point, c1: point) {
        this.element = element
        this.start = start
        this.end = end
        this.c1 = c1
        this.recalc()
    }

    setStart(p: point) {
        this.start = p
        this.recalc()
    }

    setC1(p: point) {
        this.c1 = p
        this.recalc()
    }

    setEnd(p: point) {
        this.end = p
        this.recalc()
    }

    recalc() {
        this.element.setAttribute("d", this.getSVGData())
    }

    getSVGData(): string {
        let center = new point(((this.start.x + this.end.x) / 2), ((this.start.y + this.end.y) / 2))

        return (" M " + this.start.x + " " + this.start.y + //start point
            " Q " + this.c1.x + " " + this.c1.y + //startpoint curve towards
            " , " + center.x + " " + center.y + //center
            " T " + this.end.x + " " + this.end.y)
    }
}

class point {
    x: number
    y: number

    constructor(x?: number, y?: number) {
        this.x = x ?? 0
        this.y = y ?? 0
    }

    add(p: point): point {
        this.x += p.x
        this.y += p.y
        return this
    }

    subtract(p: point): point {
        this.x -= p.x
        this.y -= p.y
        return this
    }

    multiply(n: number): point {
        this.x *= n
        this.y *= n
        return this
    }

    static add(p1: point, p2: point): point {
        return new point(p1.x + p2.x, p1.y + p2.y)
    }

    static subtract(p1: point, p2: point): point {
        return new point(p1.x - p2.x, p1.y - p2.y)
    }

    static multiply(p1: point, n: number): point {
        return new point(p1.x * n, p1.y * n)
    }
}
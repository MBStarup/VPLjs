/// <reference path="Graph.ts" />

class GraphEditor {
    container: HTMLDivElement
    svgContainer: SVGElement
    count = 0

    constructor(container: HTMLDivElement, bg: HTMLDivElement, svgContainer: SVGElement, graph: Graph) {
        bg.addEventListener("click", this.spawnNode.bind(this)) //Don't know how "bind" works, but it makes it so the event fucntion has the instance of GraphEditor as 'this' instead of somehting else
        this.container = container;
        this.svgContainer = svgContainer;
    }

    spawnNode(e: MouseEvent) {
        ++this.count
        e.preventDefault()
        let myGraphEditorNode = new GraphEditorNode("TestNode" + this.count.toString(), [new InPlug(GraphType.Num), new InPlug(GraphType.Text), new InPlug(GraphType.Emoji), new InPlug(GraphType.Time)], [new OutPlug(GraphType.Num), new OutPlug(GraphType.Time), new OutPlug(GraphType.Text)], new point(e.clientX, e.clientY))
        this.container.appendChild(myGraphEditorNode.div)
    }


}

class svgCurve {
    private start: point
    private center: point
    private end: point
    private c1: point
    private c2: point
    private element: SVGElement
    private events: { id: string, callback: ((curve: svgCurve) => void) }[] = new Array()

    constructor(element: SVGElement, start: point, end: point) {
        this.element = element
        this.start = start
        this.end = end

        this.center = point.add(this.start, this.end).multiply(1 / 2)

        this.c1 = new point((this.start.x + this.center.x) / 2, this.start.y)
        this.c2 = new point((this.end.x + this.center.x) / 2, this.end.y)

        this.recalc()
    }

    //TODO: Fix issues with start and end being at the same height
    //TODO: Figure out why moving the start retains the relative spacing of c1 and c2, but mocing end doesn't

    setStart(p: point) {
        let oldStart = this.start
        this.start = p

        if (this.start.y != this.end.y) {
            this.c1.x = (((this.c1.x - oldStart.x) / (this.end.x - oldStart.x)) * (this.end.x - this.start.x) + this.start.x)
            this.c1.y = (((this.c1.y - oldStart.y) / (this.end.y - oldStart.y)) * (this.end.y - this.start.y) + this.start.y)

            this.c2.x = (((this.c2.x - oldStart.x) / (this.end.x - oldStart.x)) * (this.end.x - this.start.x) + this.start.x)
            this.c2.y = (((this.c2.y - oldStart.y) / (this.end.y - oldStart.y)) * (this.end.y - this.start.y) + this.start.y)
        }

        if (this.start.y < this.end.y && this.start.x < this.end.x) {
            this.c1.y = Math.min(this.c1.y, this.start.y)
            this.c2.y = Math.max(this.c2.y, this.end.y)
        } else {
            this.c1.y = Math.max(this.c1.y, this.start.y)
            this.c2.y = Math.min(this.c2.y, this.end.y)
        }

        this.c1.x = Math.max(this.c1.x, this.start.x)
        this.c2.x = Math.min(this.c2.x, this.end.x)

        this.recalc()
    }

    setC1(p: point) {
        this.c1 = p

        this.c1.x = Math.max(this.c1.x, this.start.x)

        if (this.start.y < this.end.y && this.start.x < this.end.x) {
            this.c1.y = Math.min(this.c1.y, this.start.y)
            this.c2.y = Math.max(this.c2.y, this.end.y)
        } else {
            this.c1.y = Math.max(this.c1.y, this.start.y)
            this.c2.y = Math.min(this.c2.y, this.end.y)
        }

        this.recalc()
    }

    setC2(p: point) {
        this.c2 = p

        this.c2.x = Math.min(this.c2.x, this.end.x)

        if (this.start.y < this.end.y && this.start.x < this.end.x) {

            this.c1.y = Math.min(this.c1.y, this.start.y)
            this.c2.y = Math.max(this.c2.y, this.end.y)
        } else {
            this.c1.y = Math.max(this.c1.y, this.start.y)
            this.c2.y = Math.min(this.c2.y, this.end.y)
        }

        this.recalc()
    }

    setEnd(p: point) {
        let oldEnd = this.end
        this.end = p

        this.c1.x = (((this.c1.x - this.start.x) / (oldEnd.x - this.start.x)) * (this.end.x - this.start.x) + this.start.x)
        this.c1.y = (((this.c1.y - this.start.y) / (oldEnd.x - this.start.y)) * (this.end.y - this.start.y) + this.start.y)

        this.c2.x = (((this.c2.x - this.start.x) / (oldEnd.x - this.start.x)) * (this.end.x - this.start.x) + this.start.x)
        this.c2.y = (((this.c2.y - this.start.y) / (oldEnd.x - this.start.y)) * (this.end.y - this.start.y) + this.start.y)

        if (this.start.y < this.end.y && this.start.x < this.end.x) {

            this.c1.y = Math.min(this.c1.y, this.start.y)
            this.c2.y = Math.max(this.c2.y, this.end.y)
        } else {
            this.c1.y = Math.max(this.c1.y, this.start.y)
            this.c2.y = Math.min(this.c2.y, this.end.y)
        }

        this.recalc()
    }

    getStart(): point {
        return (this.start)
    }

    getC1(): point { return this.c1 }

    getCenter(): point { return this.center }

    getC2(): point { return this.c2 }

    getEnd(): point { return this.end }

    calcCenter(): point {

        let d = [[this.start, this.end], [this.c1, this.c2]]

        let a0 = (d[0][0].y - d[0][1].y) / (d[0][0].x - d[0][1].x)
        let a1 = (d[1][0].y - d[1][1].y) / (d[1][0].x - d[1][1].x)

        let b0 = d[0][0].y - a0 * d[0][0].x
        let b1 = d[1][0].y - a1 * d[1][0].x

        let x = (b0 - b1) / (a1 - a0)
        let y = a0 * x + b0

        if (x != x || y != y) { //couldn't use isNaN for some reason
            return point.add(this.start, this.end).multiply(1 / 2)
        }
        else {
            return new point(x, y)
        }
    }

    recalc() {

        this.onUpdate();

        this.center = this.calcCenter()

        this.element.setAttribute("d", this.getSVGData())
    }

    getSVGData(): string {

        return (" M " + this.start.x + " " + this.start.y + //start point
            " C " + this.c1.x + " " + this.c1.y + //startpoint curve towards
            " , " + this.c1.x + " " + this.c1.y + //center
            " , " + this.center.x + " " + this.center.y + //center
            " C " + + " " + this.c2.x + " " + this.c2.y +
            " , " + + " " + this.c2.x + " " + this.c2.y +
            " , " + this.end.x + " " + this.end.y)
    }

    private onUpdate() {
        this.events.forEach(event => {
            event.callback(this);
        });
    }

    addEvent(id: string, callback: (s: svgCurve) => void) {
        this.events.push({ id, callback })
    }
}

class point {
    x: number
    y: number

    constructor(x?: number, y?: number) {
        this.x = x ?? 0
        this.y = y ?? 0
    }

    static zero: point = new point(0, 0)

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

    copy() { return new point(this.x, this.y) }

    static copy(p: point) { return new point(p.x, p.y) }

    static add(p1: point, p2: point): point { return new point(p1.x + p2.x, p1.y + p2.y) }

    static subtract(p1: point, p2: point): point { return new point(p1.x - p2.x, p1.y - p2.y) }

    static multiply(p1: point, n: number): point { return new point(p1.x * n, p1.y * n) }

    static center(p1: point, p2: point): point { return new point(((p1.x + p2.x) / 2), ((p1.y + p2.y) / 2)) }



    static dotP(p1: point, p2: point): number { return p1.x * p2.x + p1.y * p2.y }

    static unit(p: point) {
        let s = Math.sqrt(p.x * p.x + p.y * p.y)
        return new point(p.x / s, p.y / s)
    }
}

//http://stackoverflow.com/a/3642265/1869660
function makeSVGElement(tag: string, attrs?: object): SVGElement {
    let el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (let k in attrs) {
        el.setAttribute(k, attrs[k]);
    }
    return el;
}

class GraphEditorNode {
    pos: point
    Name: string;
    Inputs: InPlug[];
    Outputs: OutPlug[];
    div: HTMLElement

    constructor(Name: string, Inputs: InPlug[], Outputs: OutPlug[], position: point) {
        this.Name = Name
        this.Inputs = Inputs
        this.Outputs = Outputs
        this.div = this.makeNodeElement(this.Name, this.Inputs, this.Outputs)
        this.setPosition(position)
    }

    setPosition(p: point): void {
        this.pos = p
        this.div.setAttribute("style", "left: " + this.pos.x.toString() + "px;" + "top: " + this.pos.y.toString() + "px;")
    }

    dragNode(e: MouseEvent, node: GraphEditorNode) { //https://www.w3schools.com/howto/howto_js_draggable.asp
        e.preventDefault()

        let newX;
        let newY;
        let oldX = e.clientX;
        let oldY = e.clientY;

        node.div.style.zIndex = "1";

        document.addEventListener("mouseup", stopDragNode)
        document.addEventListener("mousemove", dragMove)

        function dragMove(e: MouseEvent) {
            newX = oldX - e.clientX;
            newY = oldY - e.clientY;
            oldX = e.clientX;
            oldY = e.clientY;

            node.setPosition(new point((node.div.offsetLeft - newX), (node.div.offsetTop - newY)))
        }

        function stopDragNode(e: MouseEvent) {
            document.removeEventListener("mouseup", stopDragNode)
            document.removeEventListener("mousemove", dragMove)
            node.div.style.zIndex = null;
        }
    }

    private makeNodeElement(Name: string, Inputs: InPlug[], Outputs: OutPlug[]): HTMLElement {
        let nodeDiv = document.createElement("div") as NodeDiv
        nodeDiv.classList.add("node")
        nodeDiv.node = this

        let headerDiv = document.createElement("div")
        headerDiv.classList.add("header")
        let headerText = document.createElement("p")
        headerText.innerText = Name;
        headerDiv.appendChild(headerText)
        headerDiv.addEventListener("mousedown", (e) => this.dragNode(e, this)) //Make it draggable
        nodeDiv.appendChild(headerDiv)

        let bodyDiv = document.createElement("div")
        bodyDiv.classList.add("body")
        nodeDiv.appendChild(bodyDiv)

        let inputListDiv = document.createElement("div")
        inputListDiv.classList.add("inputList")
        Inputs?.forEach(input => {
            input.ParentNode = this
            let inputDiv = document.createElement("div")
            inputDiv.classList.add("input")
            let dot = document.createElement("div") as PlugDiv
            dot.plug = input
            let text = document.createElement("p")
            dot.classList.add("typeDot", GraphType[input.Type])
            text.innerHTML = input.Name
            inputDiv.appendChild(dot)
            inputDiv.appendChild(text)
            inputListDiv.appendChild(inputDiv)
        });
        bodyDiv.appendChild(inputListDiv)

        let outputListDiv = document.createElement("div")
        outputListDiv.classList.add("outputList")
        bodyDiv.appendChild(outputListDiv)
        Outputs?.forEach(output => {
            output.ParentNode = this
            let outputDiv = document.createElement("div")
            outputDiv.classList.add("output")
            let dot = document.createElement("div") as PlugDiv
            dot.plug = output
            let text = document.createElement("p")
            dot.classList.add("typeDot", GraphType[output.Type])
            dot.addEventListener("mousedown", (e) => handleCurve(e, dot, output)) //Make clicking the dot do curve things //TODOOO: make this also keep track of relations

            text.innerHTML = output.Name
            outputDiv.appendChild(dot)
            outputDiv.appendChild(text)
            outputListDiv.appendChild(outputDiv)
        });

        return nodeDiv;
    }
}

class Plug {
    Type: GraphType
    ParentNode: GraphEditorNode
    Name: string

    constructor(type: GraphType, Name?: string) {
        this.Type = type
        this.Name = Name ?? GraphType[this.Type]
    }
}

class InPlug extends Plug {
    HasField: boolean
    Connection: GraphPlug

    constructor(type: GraphType, Name?: string, HasField?: boolean) {
        super(type, Name);
        this.HasField = HasField ?? false
    }
}

class OutPlug extends Plug {
    Connection: GraphPlug
}

function handleCurve(e: MouseEvent, div: HTMLDivElement, plug: OutPlug) {
    e.preventDefault()
    let rect = div.getBoundingClientRect()
    let start = new point(rect.x + rect.width / 2, rect.y + rect.height / 2)
    let end = new point(e.clientX, e.clientY)

    let curveSVG = makeSVGElement("path", { "fill": "none", "stroke": window.getComputedStyle(div).backgroundColor, "stroke-width": 4 })

    let center = point.add(start, end).multiply(1 / 2)

    let p1 = new point(center.x, start.y)
    let p2 = new point(center.x, end.y)


    let curve = new svgCurve(curveSVG, start, end)

    let dragCurve = (e: MouseEvent) => {

        end = new point(e.clientX, e.clientY)
        center = point.add(start, end).multiply(1 / 2)


        p1 = new point((start.x + center.x) / 2, start.y)
        p2 = new point((end.x + center.x) / 2, end.y)

        curve.setC1(p1)
        curve.setC2(p2)
        curve.setEnd(end)
    }



    let releaseCurve = (e: MouseEvent) => {
        document.removeEventListener("mousemove", dragCurve)
        document.removeEventListener("mouseup", releaseCurve)

        let targetPlug = e.target as PlugDiv
        while (targetPlug && !targetPlug.plug) {
            targetPlug = targetPlug.parentNode as PlugDiv
        }

        if (!targetPlug) {
            curveSVG.remove()
            return
        }

        if (targetPlug.plug instanceof OutPlug) {
            curveSVG.remove()
            return
        }

        console.log(targetPlug.plug)
        console.log(targetPlug.plug.ParentNode)

        //Associate the plug with the curve



        let dots: { setter: (p: point) => void, getter: () => point, element: SVGElement }[] = [
            { setter: curve.setStart.bind(curve), getter: curve.getStart.bind(curve), element: makeSVGElement("circle", { "fill": "orange", "r": 5, "pointer-events": "all" }) },
            { setter: curve.setC1.bind(curve), getter: curve.getC1.bind(curve), element: makeSVGElement("circle", { "fill": "yellow", "r": 5, "pointer-events": "all" }) },
            { setter: curve.setC2.bind(curve), getter: curve.getC2.bind(curve), element: makeSVGElement("circle", { "fill": "blue", "r": 5, "pointer-events": "all" }) },
            { setter: curve.setEnd.bind(curve), getter: curve.getEnd.bind(curve), element: makeSVGElement("circle", { "fill": "purple", "r": 5, "pointer-events": "all" }) }]
        curve.addEvent("updateshit", (curve) => {
            dots.forEach(dot => {
                dot.element.setAttribute("cx", dot.getter().x.toString())
                dot.element.setAttribute("cy", dot.getter().y.toString())
            })

        })


        dots.forEach(dot => handleDotWrapper(dot))

        function handleDotWrapper(dot: { setter: (p: point) => void, getter: () => point, element: SVGElement }) {
            dot.element.addEventListener("mousedown", handleDot)

            dot.element.setAttribute("cx", dot.getter().x.toString())
            dot.element.setAttribute("cy", dot.getter().y.toString())

            function handleDot(_: MouseEvent) {
                document.addEventListener("mousemove", dragDot)
                document.addEventListener("mouseup", releaseDot)

                function dragDot(e: MouseEvent) {
                    dot.setter(new point(e.clientX, e.clientY))
                    dot.element.setAttribute("cx", dot.getter().x.toString())
                    dot.element.setAttribute("cy", dot.getter().y.toString())
                }

                function releaseDot(_: MouseEvent) {
                    document.removeEventListener("mousemove", dragDot)
                    document.removeEventListener("mouseup", releaseDot)
                }
            }
        }

        dots.forEach(dot => this.svgContainer.appendChild(dot.element))

    }

    this.svgContainer.appendChild(curveSVG)
    //this.svgContainer.appendChild(centerDot)

    document.addEventListener("mousemove", dragCurve)

    releaseCurve = releaseCurve.bind(this)
    document.addEventListener("mouseup", releaseCurve)

}

interface NodeDiv extends HTMLDivElement {
    node: GraphEditorNode
}

interface PlugDiv extends HTMLDivElement {
    plug: Plug
}
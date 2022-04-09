class Graph { }

enum GraphType {
    Action,
    Num,
    Text,
    Bool,
    User,
    Message,
    Time,
    Channel,
    Category,
    Emoji,
    MessageType
}

class VPL_Plug extends HTMLElement {
    Type: GraphType
    ParentNode: VPL_Node
    Name: string
    Curve: svgCurve

    constructor(type: GraphType, Name?: string) {
        super()
        this.Type = type
        this.Name = Name ?? GraphType[this.Type]
    }
}


class VPL_Node extends HTMLElement {
    private pos: point

    Name: string;
    Inputs: InPlug[];
    Outputs: OutPlug[];

    constructor(Name: string, Inputs: InPlug[], Outputs: OutPlug[], position: point) {
        super()
        this.Name = Name
        this.Inputs = Inputs
        this.Outputs = Outputs
        //this.div = this.makeNodeElement(this.Name, this.Inputs, this.Outputs)
        this.setPosition(position)



        this.classList.add("node")
        let headerDiv = document.createElement("div")
        headerDiv.classList.add("header")
        let headerText = document.createElement("p")
        headerText.innerText = Name;
        headerDiv.appendChild(headerText)
        headerDiv.addEventListener("mousedown", (e) => this.dragNode(e, this)) //Make it draggable
        this.appendChild(headerDiv)

        let bodyDiv = document.createElement("div")
        bodyDiv.classList.add("body")
        this.appendChild(bodyDiv)

        let inputListDiv = document.createElement("div")
        inputListDiv.classList.add("inputList")
        bodyDiv.appendChild(inputListDiv)

        let outputListDiv = document.createElement("div")
        outputListDiv.classList.add("outputList")
        bodyDiv.appendChild(outputListDiv)

        Inputs?.forEach(input => {
            input.ParentNode = this
            let inputDiv = document.createElement("div")
            let text = document.createElement("p")
            input.classList.add("typeDot", GraphType[input.Type])
            text.innerHTML = input.Name
            inputDiv.appendChild(input)
            inputDiv.appendChild(text)
            input.addEventListener("mousedown", (e) => handleCurveIn(e, input)) //Make clicking the dot do curve things //TODOOO: make this also keep track of relations
            if (input.Type === GraphType.Action) {
                inputDiv.classList.add("output")  //Acts as an output for css purposes (sits to the right) if it's an action
                outputListDiv.appendChild(inputDiv)
            } else {
                inputListDiv.appendChild(inputDiv)
                inputDiv.classList.add("input")
            }
        });

        Outputs?.forEach(output => {
            output.ParentNode = this
            let outputDiv = document.createElement("div")
            outputDiv.classList.add("output")
            let text = document.createElement("p")
            output.classList.add("typeDot", GraphType[output.Type])
            output.addEventListener("mousedown", (e) => handleCurveOut(e, output)) //Make clicking the dot do curve things //TODOOO: make this also keep track of relations

            text.innerHTML = output.Name
            outputDiv.appendChild(output)
            outputDiv.appendChild(text)
            outputListDiv.appendChild(outputDiv)
        });
    }

    setPosition(p: point): void {
        this.pos = p
        this.setAttribute("style", "left: " + this.pos.x.toString() + "px;" + "top: " + this.pos.y.toString() + "px;")
    }

    getPosition(): point {
        return this.pos
    }


    dragNode(e: MouseEvent, node: VPL_Node) { //https://www.w3schools.com/howto/howto_js_draggable.asp
        e.preventDefault()

        let newX;
        let newY;
        let oldX = e.pageX;
        let oldY = e.pageY;

        node.style.zIndex = "1";

        document.addEventListener("mouseup", stopDragNode)
        document.addEventListener("mousemove", dragMove)

        function dragMove(e: MouseEvent) {
            newX = oldX - e.pageX;
            newY = oldY - e.pageY;
            oldX = e.pageX;
            oldY = e.pageY;

            node.setPosition(new point((node.offsetLeft - newX), (node.offsetTop - newY)))

            node.Inputs.forEach(p => {
                if (p.Connection != null) {
                    let rect = p.getBoundingClientRect()
                    let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2)

                    p.Curve.setEnd(pos)
                }
            })


            node.Outputs.forEach(srcPlug => {
                srcPlug.Connections.forEach(destPlug => {
                    let rect = srcPlug.getBoundingClientRect()
                    let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2)

                    destPlug.Curve.setStart(pos)
                });
            })
        }

        function stopDragNode(e: MouseEvent) {
            document.removeEventListener("mouseup", stopDragNode)
            document.removeEventListener("mousemove", dragMove)
            node.style.zIndex = null;
        }
    }

}

class InPlug extends VPL_Plug {
    HasField: boolean
    Connection: OutPlug = null

    constructor(type: GraphType, Name?: string, HasField?: boolean) {
        super(type, Name);
        this.HasField = HasField ?? false
    }
}

class OutPlug extends VPL_Plug {
    Connections: InPlug[] = []
}

class GraphEditor {
    container: HTMLElement
    svgContainer: SVGElement
    nodes = []
    count = 0

    constructor(container: HTMLElement, bg: HTMLElement, svgContainer: SVGElement, graph: Graph) {
        //-This is a shitty meme, god i hate this, whoever decided tot do this, did way more than a 'little bit' of trolling
        customElements.define('vpl-plug', VPL_Plug);
        customElements.define('vpl-in-plug', InPlug);
        customElements.define('vpl-out-plug', OutPlug);
        customElements.define('vpl-node', VPL_Node);

        bg.addEventListener("click", this.spawnNode.bind(this)) //Don't know how "bind" works, but it makes it so the event fucntion has the instance of GraphEditor as 'this' instead of somehting else
        this.container = container;
        this.svgContainer = svgContainer;

        window.addEventListener("resize", (e) => {
            let editorSize = new point(Math.max(document.body.clientWidth, ...this.nodes.map((n) => n.getPosition().x + 200)), Math.max(document.body.clientHeight, ...this.nodes.map((n) => n.getPosition().y + 200))) //TODO: less arbitrary numbders for with/height of nodes

            setSize(container, editorSize)
            setSize(bg, editorSize)
            setSize(svgContainer, editorSize)
        })
    }

    spawnNode(e: MouseEvent) {
        ++this.count
        e.preventDefault()
        let myGraphEditorNode = new VPL_Node("TestNode" + this.count.toString(), [new InPlug(GraphType.Num), new InPlug(GraphType.Text, "wow"), new InPlug(GraphType.Emoji), new InPlug(GraphType.Time), new InPlug(GraphType.Action, "next->")], [new OutPlug(GraphType.Num), new OutPlug(GraphType.Time), new OutPlug(GraphType.Text)], new point(e.pageX, e.pageY))
        this.container.appendChild(myGraphEditorNode)
        this.nodes.push(myGraphEditorNode)
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
        this.proportionalAdjustControls(oldStart, this.end)

        this.restrictControlPoints()
        this.recalc()
    }

    setC1(p: point) {
        this.c1 = p

        this.c1.x = Math.max(this.c1.x, this.start.x)

        this.restrictControlPoints()
        this.recalc()
    }

    setC2(p: point) {
        this.c2 = p

        this.c2.x = Math.min(this.c2.x, this.end.x)

        this.restrictControlPoints()
        this.recalc()
    }

    setEnd(p: point) {
        let oldEnd = this.end
        this.end = p
        this.proportionalAdjustControls(this.start, oldEnd)
        this.restrictControlPoints()
        this.recalc()
    }

    proportionalAdjustControls(oldStart: point, oldEnd: point) {
        //Logic for moving the control points proportionally
        //Feel free to think of alternatives, I am not a huge fan of this behavior
        //Works great when c1.y is very close to start.y and c2.y is very close to end.y and c2.x > start.x and c1.x < end.x
        //This describes a lot of our usecases, but it's still pretty shit that it gets fucked in all other cases, as there are some other valid cases
        if (this.start.y != this.end.y) {
            this.c1.x = (((this.c1.x - oldStart.x) / (oldEnd.x - oldStart.x)) * (this.end.x - this.start.x) + this.start.x)
            this.c1.y = (((this.c1.y - oldStart.y) / (oldEnd.y - oldStart.y)) * (this.end.y - this.start.y) + this.start.y)

            this.c2.x = (((this.c2.x - oldStart.x) / (oldEnd.x - oldStart.x)) * (this.end.x - this.start.x) + this.start.x)
            this.c2.y = (((this.c2.y - oldStart.y) / (oldEnd.y - oldStart.y)) * (this.end.y - this.start.y) + this.start.y)
        }
    }

    restrictControlPoints() {
        if (this.start.y < this.end.y && this.start.x < this.end.x) {
            this.c1.y = Math.min(this.c1.y, this.start.y)
            this.c2.y = Math.max(this.c2.y, this.end.y)
        } else {
            this.c1.y = Math.max(this.c1.y, this.start.y)
            this.c2.y = Math.min(this.c2.y, this.end.y)
        }


        let leftRightBuffer = 10
        this.c1.x = Math.max(this.c1.x, this.start.x + leftRightBuffer)
        this.c2.x = Math.min(this.c2.x, this.end.x - leftRightBuffer)
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

function handleCurveIn(e: MouseEvent, plug: InPlug) {
    e.preventDefault()
    let rect = plug.getBoundingClientRect()
    let curveSVG = makeSVGElement("path", { "fill": "none", "stroke": window.getComputedStyle(plug).backgroundColor, "stroke-width": 4 })

    let end = new point(rect.x + rect.width / 2, rect.y + rect.height / 2)
    let start = new point(e.pageX, e.pageY)


    let center = point.add(start, end).multiply(1 / 2)
    let p1 = new point(center.x, start.y)
    let p2 = new point(center.x, end.y)

    let curve = new svgCurve(curveSVG, start, end)


    let dragCurve = plug.Type === GraphType.Action ?
        (e: MouseEvent) => {

            start = new point(e.pageX, e.pageY)
            center = point.add(start, end).multiply(1 / 2)


            p1 = new point((start.x + center.x) / 2, start.y)
            p2 = new point((end.x + center.x) / 2, end.y)

            curve.setC1(p1)
            curve.setC2(p2)
            curve.setEnd(start)
        }
        :
        (e: MouseEvent) => {

            start = new point(e.pageX, e.pageY)
            center = point.add(start, end).multiply(1 / 2)


            p1 = new point((start.x + center.x) / 2, start.y)
            p2 = new point((end.x + center.x) / 2, end.y)

            curve.setC1(p1)
            curve.setC2(p2)
            curve.setStart(start)
        }



    let releaseCurve = plug.Type === GraphType.Action ?
        (e: MouseEvent) => { //It's an Action
            document.removeEventListener("mousemove", dragCurve)
            document.removeEventListener("mouseup", releaseCurve)

            let target = e.target as HTMLElement
            while (target != undefined && !(target instanceof VPL_Node)) { //Move up the parent hierachy, useless for the plugs, as they are (currently at least) leaf nodes, but could be useful if we want to select nodeDiv
                target = target.parentNode as HTMLElement
            }

            if (!target) { //If it's not a node
                curveSVG.remove()
                return
            }

            // if (target.nodeType != "Action") { //If it's not an action node
            //     curveSVG.remove()
            //     return
            // }

            // //Associate the plug with the curve

            // let outPlug = targetPlug as OutPlug
            // plug.Connection = outPlug
            // outPlug.Connections.push(plug)

            //outPlug.Curve = curve
            plug.Curve = curve

            //TODO: BIG FIX!!!! Handle actions good

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

            let handleDotWrapper = function (dot: { setter: (p: point) => void, getter: () => point, element: SVGElement }) {
                dot.element.setAttribute("cx", dot.getter().x.toString())
                dot.element.setAttribute("cy", dot.getter().y.toString())

                let handleDot = function (_: MouseEvent) {

                    let dragDot = function (e: MouseEvent) {
                        dot.setter(new point(e.pageX, e.pageY))
                        dot.element.setAttribute("cx", dot.getter().x.toString())
                        dot.element.setAttribute("cy", dot.getter().y.toString())
                    }

                    let releaseDot = function (_: MouseEvent) {
                        document.removeEventListener("mousemove", dragDot)
                        document.removeEventListener("mouseup", releaseDot)
                    }

                    document.addEventListener("mousemove", dragDot)
                    document.addEventListener("mouseup", releaseDot)
                }

                dot.element.addEventListener("mousedown", handleDot)
            }

            dots.forEach(dot => {
                handleDotWrapper(dot)
                this.svgContainer.appendChild(dot.element)
            })
        }
        :
        (e: MouseEvent) => { //It's not an action
            document.removeEventListener("mousemove", dragCurve)
            document.removeEventListener("mouseup", releaseCurve)

            let targetPlug = e.target as VPL_Plug
            while (targetPlug && targetPlug.Type == undefined) { //Move up the parent hierachy, useless for the plugs, as they are (currently at least) leaf nodes, but could be useful if we want to select nodeDiv
                targetPlug = targetPlug.parentNode as VPL_Plug
            }

            if (!targetPlug) { //If it's not a plug
                curveSVG.remove()
                return
            }

            if (targetPlug instanceof InPlug) { //If it's an InPlug
                curveSVG.remove()
                return
            }

            if (targetPlug.Type != plug.Type) { //If it's not a matching type
                curveSVG.remove()
                return
            }

            //Associate the plug with the curve

            let outPlug = targetPlug as OutPlug
            plug.Connection = outPlug
            outPlug.Connections.push(plug)

            outPlug.Curve = curve
            plug.Curve = curve


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

            let handleDotWrapper = function (dot: { setter: (p: point) => void, getter: () => point, element: SVGElement }) {
                dot.element.setAttribute("cx", dot.getter().x.toString())
                dot.element.setAttribute("cy", dot.getter().y.toString())

                let handleDot = function (_: MouseEvent) {

                    let dragDot = function (e: MouseEvent) {
                        dot.setter(new point(e.pageX, e.pageY))
                        dot.element.setAttribute("cx", dot.getter().x.toString())
                        dot.element.setAttribute("cy", dot.getter().y.toString())
                    }

                    let releaseDot = function (_: MouseEvent) {
                        document.removeEventListener("mousemove", dragDot)
                        document.removeEventListener("mouseup", releaseDot)
                    }

                    document.addEventListener("mousemove", dragDot)
                    document.addEventListener("mouseup", releaseDot)
                }

                dot.element.addEventListener("mousedown", handleDot)
            }

            dots.forEach(dot => {
                handleDotWrapper(dot)
                this.svgContainer.appendChild(dot.element)
            })
        }

    this.svgContainer.appendChild(curveSVG)
    //this.svgContainer.appendChild(centerDot)

    document.addEventListener("mousemove", dragCurve)

    releaseCurve = releaseCurve.bind(this)
    document.addEventListener("mouseup", releaseCurve)

}

function handleCurveOut(e: MouseEvent, plug: OutPlug) {
    e.preventDefault()
    let rect = plug.getBoundingClientRect()
    let start = new point(rect.x + rect.width / 2, rect.y + rect.height / 2)
    let end = new point(e.pageX, e.pageY)

    let curveSVG = makeSVGElement("path", { "fill": "none", "stroke": window.getComputedStyle(plug).backgroundColor, "stroke-width": 4 })

    let center = point.add(start, end).multiply(1 / 2)

    let p1 = new point(center.x, start.y)
    let p2 = new point(center.x, end.y)


    let curve = new svgCurve(curveSVG, start, end)

    let dragCurve = (e: MouseEvent) => {

        end = new point(e.pageX, e.pageY)
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

        let targetPlug = e.target as VPL_Plug
        while (targetPlug && targetPlug.Type == undefined) { //Move up the parent hierachy, useless for the plugs, as they are (currently at least) leaf nodes, but could be useful if we want to select nodeDiv
            targetPlug = targetPlug.parentNode as VPL_Plug
        }

        if (!targetPlug) { //If it's not a plug
            curveSVG.remove()
            return
        }

        if (targetPlug instanceof OutPlug) { //If it's an OutPlug
            curveSVG.remove()
            return
        }

        if (targetPlug.Type != plug.Type) { //If it's not a matching type
            curveSVG.remove()
            return
        }

        //Associate the plug with the curve

        let inPlug = targetPlug as InPlug
        inPlug.Connection = plug
        plug.Connections.push(inPlug)

        inPlug.Curve = curve
        plug.Curve = curve


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


        let handleDotWrapper = function (dot: { setter: (p: point) => void, getter: () => point, element: SVGElement }) {
            dot.element.setAttribute("cx", dot.getter().x.toString())
            dot.element.setAttribute("cy", dot.getter().y.toString())

            let handleDot = function (_: MouseEvent) {

                let dragDot = function (e: MouseEvent) {
                    dot.setter(new point(e.pageX, e.pageY))
                    dot.element.setAttribute("cx", dot.getter().x.toString())
                    dot.element.setAttribute("cy", dot.getter().y.toString())
                }

                let releaseDot = function (_: MouseEvent) {
                    document.removeEventListener("mousemove", dragDot)
                    document.removeEventListener("mouseup", releaseDot)
                }

                document.addEventListener("mousemove", dragDot)
                document.addEventListener("mouseup", releaseDot)
            }

            dot.element.addEventListener("mousedown", handleDot)
        }

        dots.forEach(dot => {
            handleDotWrapper(dot)
            this.svgContainer.appendChild(dot.element)
        })
    }

    this.svgContainer.appendChild(curveSVG)
    //this.svgContainer.appendChild(centerDot)

    document.addEventListener("mousemove", dragCurve)

    releaseCurve = releaseCurve.bind(this)
    document.addEventListener("mouseup", releaseCurve)

}


function setSize(e: HTMLElement | SVGElement, p: point) {
    e.style.width = p.x.toString() + "px"
    e.style.height = p.y.toString() + "px"
}
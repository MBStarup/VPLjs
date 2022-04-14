/// <reference path="Stuff.ts" />


class Graph { }

enum GraphType {
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

abstract class VPL_Plug extends HTMLElement {
    ParentNode: VPL_Node
    Name: string
    Curve: svgCurve

    constructor() {
        super()
    }
}


class VPL_Node extends HTMLElement {
    VPL_Node_Type(): string {
        if (this instanceof ActionNode)
            return "ActionNode"

        if (this.IsEvent)
            return "EventNode"

        return "DataNode"
    }

    protected pos: point

    header: HTMLDivElement //TODO: maybe expose the other htmlelements as members too?

    Name: string
    Inputs: InPlug[]
    Outputs: OutPlug[]
    Actions: ActionPlug[]
    ID: number
    IsEvent: boolean

    constructor(Name: string, Actions: ActionPlug[], Inputs: InPlug[], Outputs: OutPlug[], position: point, id: number, isEvent?: boolean) {
        super()
        this.IsEvent = isEvent ?? false
        this.ID = id
        this.Name = Name
        this.Actions = Actions
        this.Inputs = Inputs
        this.Outputs = Outputs
        this.setPosition(position)

        this.classList.add("node")
        let headerDiv = document.createElement("div")
        headerDiv.classList.add("header")
        let headerText = document.createElement("p")
        headerText.innerText = Name;
        headerDiv.appendChild(headerText)
        headerDiv.addEventListener("mousedown", (e) => this.boundDragNode(e))
        this.appendChild(headerDiv)
        this.header = headerDiv

        let bodyDiv = document.createElement("div")
        bodyDiv.classList.add("body")
        this.appendChild(bodyDiv)

        let inputListDiv = document.createElement("div")
        inputListDiv.classList.add("inputList")
        bodyDiv.appendChild(inputListDiv)

        let outputListDiv = document.createElement("div")
        outputListDiv.classList.add("outputList")
        bodyDiv.appendChild(outputListDiv)


        Actions.forEach(action => {
            action.ParentNode = this
            let outputDiv = document.createElement("div")
            outputDiv.classList.add("output")
            let text = document.createElement("p")
            action.classList.add("typeDot", "action")
            action.addEventListener("mousedown", (e) => beginConnection(e, action))

            text.innerHTML = action.Name
            outputDiv.appendChild(action)
            outputDiv.appendChild(text)
            outputListDiv.appendChild(outputDiv)
        });

        Inputs?.forEach(input => {
            input.ParentNode = this
            let inputDiv = document.createElement("div")
            input.classList.add("typeDot", GraphType[input.Type])
            inputDiv.appendChild(input)
            input.addEventListener("mousedown", (e) => beginConnection(e, input))
            inputListDiv.appendChild(inputDiv)
            inputDiv.classList.add("input")

            if (input.HasField) {
                let inputField = document.createElement("input") as HTMLInputElement
                inputField.addEventListener("change", (e) => { input.Value = inputField.value }) //TODO: implement an actual input parsing function, maybe even do drop downs as opposed to text fields for some types?
                inputField.placeholder = input.Name
                inputDiv.appendChild(inputField)
            } else {
                let text = document.createElement("p")
                text.innerHTML = input.Name
                inputDiv.appendChild(text)
            }

        });

        Outputs?.forEach(output => {
            output.ParentNode = this
            let outputDiv = document.createElement("div")
            outputDiv.classList.add("output")
            let text = document.createElement("p")
            output.classList.add("typeDot", GraphType[output.Type])
            output.addEventListener("mousedown", (e) => beginConnection(e, output))

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

    protected oldPos: point //TODO: don't like this being a member fo the class, but it's needed in multiple funcitons... Maybe make it a parameter? But then I'd need wrappers because they're events. WHat to do, what to do...
    protected dragNode() { //https://www.w3schools.com/howto/howto_js_draggable.asp
        this.style.zIndex = "1";

        document.addEventListener("mouseup", this.boundStopDragNode)
        document.addEventListener("mousemove", this.boundDragMove)
    }

    protected dragMove(p: point) {
        this.oldPos = this.oldPos || p //Short circuit evaluation to assign oldPos to p in case of no previous value
        let deltaX = this.oldPos.x - p.x;
        let deltaY = this.oldPos.y - p.y;
        this.oldPos = p


        this.setPosition(new point((this.offsetLeft - deltaX), (this.offsetTop - deltaY)))

        this.Actions.forEach(p => {
            if (p.Connection != null) {
                let rect = p.getBoundingClientRect()
                let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2)

                p.Curve.setStart(pos)
            }
        })

        this.Inputs.forEach(p => {
            if (p.Connection != null) {
                let rect = p.getBoundingClientRect()
                let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2)

                p.Curve.setEnd(pos)
            }
        })


        this.Outputs.forEach(p => {
            p.Connections.forEach(destPlug => {
                let rect = p.getBoundingClientRect()
                let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2)

                destPlug.Curve.setStart(pos)
            });
        })
    }

    protected stopDragNode() {
        document.removeEventListener("mouseup", this.boundStopDragNode)
        document.removeEventListener("mousemove", this.boundDragMove)
        this.style.zIndex = null;
    }

    private boundDragNode = (e: MouseEvent) => { e.preventDefault(); this.dragNode.bind(this)() }
    private boundDragMove = (e: MouseEvent) => { e.preventDefault(); this.dragMove.bind(this)(new point(e.pageX, e.pageY)) }
    private boundStopDragNode = (e: MouseEvent) => { e.preventDefault(); this.stopDragNode.bind(this)() }

}



class InPlug extends VPL_Plug {
    HasField: boolean
    Type: GraphType
    Connection: OutPlug = null
    Value: any

    constructor(type: GraphType, Name?: string, HasField?: boolean) {
        super();
        this.Name = Name ?? GraphType[type]
        this.Type = type
        this.HasField = HasField ?? false
    }
}

class OutPlug extends VPL_Plug {
    Type: GraphType
    Connections: InPlug[] = []

    constructor(type: GraphType, Name?: string) {
        super();
        this.Name = Name ?? GraphType[type]
        this.Type = type
    }
}

class ActionPlug extends VPL_Plug {
    Connection: ActionNode = null

    constructor(Name?: string) {
        super();
        this.Name = Name ?? "ACTION"
    }
}

class ActionNode extends VPL_Node {
    Connections: ActionPlug[] = []
    Curve: svgCurve

    constructor(Name: string, Actions: ActionPlug[], Inputs: InPlug[], Outputs: OutPlug[], position: point, id: number, isEvent?: boolean) {
        super(Name, Actions, Inputs, Outputs, position, id, isEvent)
        this.classList.add("actionNode")
    }

    protected dragMove(p: point) {
        super.dragMove(p)

        this.Connections.forEach(c => {
            let rect = this.header.getBoundingClientRect()
            let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2)

            c.Curve.setEnd(pos)
        })
    }
}

class GraphEditor {
    name: string
    container: HTMLElement
    svgContainer: SVGElement
    nodes = []
    eventNodes = []
    count = 0

    constructor(container: HTMLElement, bg: HTMLElement, svgContainer: SVGElement, graph: Graph) {
        //-This is a shitty meme, god i hate this, whoever decided tot do this, did way more than a 'little bit' of trolling
        //customElements.define('vpl-plug', VPL_Plug);
        customElements.define('vpl-action-plug', ActionPlug);
        customElements.define('vpl-in-plug', InPlug);
        customElements.define('vpl-out-plug', OutPlug);
        customElements.define('vpl-node', VPL_Node);
        customElements.define('vpl-action-node', ActionNode);

        bg.addEventListener("click", (e) => {
            e.preventDefault(); this.spawnNode.bind(this)(new VPL_Node("TestNode" + (this.count++).toString(), [new ActionPlug("Next >>")], [new InPlug(GraphType.Num), new InPlug(GraphType.Text, "wow"), new InPlug(GraphType.Emoji), new InPlug(GraphType.Time)], [new OutPlug(GraphType.Num), new OutPlug(GraphType.Time), new OutPlug(GraphType.Text)], new point(e.pageX, e.pageY), this.count))
        }) //Don't know how "bind" works, but it makes it so the event fucntion has the instance of GraphEditor as 'this' instead of somehting else
        this.container = container;
        this.svgContainer = svgContainer;

        window.addEventListener("resize", (e) => {
            let editorSize = new point(Math.max(document.body.clientWidth, ...this.nodes.map((n) => n.getPosition().x + 200)), Math.max(document.body.clientHeight, ...this.nodes.map((n) => n.getPosition().y + 200))) //TODO: less arbitrary numbders for with/height of nodes

            setSize(container, editorSize)
            setSize(bg, editorSize)
            setSize(svgContainer, editorSize)
        })

        document.addEventListener("keyup", (e) => {
            e.preventDefault();
            if (e.key === 'Enter') {
                download(this.jsonTranspile(), `${this.name}.json`, 'text/json')
            }
        });
    }

    spawnNode(n: VPL_Node) {
        this.container.appendChild(n)
        this.nodes.push(n)
        if (n.IsEvent) {
            this.eventNodes.push(n)
        }
    }


    jsonTranspile(): string {
        let todoStack: VPL_Node[] = [...this.eventNodes]
        let doneStack: VPL_Node[] = []

        while (todoStack.length > 0) {
            let curr = todoStack.pop()
            curr.Actions.forEach((a) => a.Connection ? (doneStack.indexOf(a.Connection) == -1 ? todoStack.push(a.Connection) : "") : "")
            curr.Inputs.forEach((a) => a.Connection ? (doneStack.indexOf(a.Connection.ParentNode) == -1 ? todoStack.push(a.Connection.ParentNode) : "") : "")
            doneStack.push(curr)
        }


        return `
{ 
    "nodes": [ 
        ${doneStack.map((n: VPL_Node) =>
            `{
            "id": ${n.ID},
            "name": "${n.Name}",
            "type": "${n.VPL_Node_Type()}",
            "inputs":  
            { 
                "data": [ 
                    ${n.Inputs.map((a) => `
                    {
                        "name": "${a.Name}",
                        "type": "${GraphType[a.Type]}",
                        "valueIsPath": ${!a.HasField},
                        "value": ${a.Connection === null ? (a.HasField ? a.Value.toString() : "null") : `
                        {
                            "node": ${a.Connection.ParentNode.ID},
                            "plug": "${a.Connection.Name}"
                        }`}
                    }`).reduce((prev, curr, i) => `${prev}${','.repeat((i > 0) as unknown as number)} ${curr}`, "")}
                ],
                "actions": [ 
                    ${n.Actions.map((a) => `
                    {
                        "name": "${a.Name}",
                        "type": "action",
                        "valueIsPath": true,
                        "value": ${a.Connection === null ? "null" : `
                        {
                            "node": ${a.Connection.ID},
                            "plug": "${a.Connection.Name}"
                        }`}
                    }`).reduce((prev, curr, i) => `${prev}${','.repeat((i > 0) as unknown as number)} ${curr}`, "")}
                ]
            },
            "outputs":  
            { 
                "data": [ 
                    ${n.Outputs.map((a) => `
                    {
                        "name": "${a.Name}",
                        "type": "${GraphType[a.Type]}"
                    }`).reduce((prev, curr, i) => `${prev}${','.repeat((i > 0) as unknown as number)} ${curr}`, "")}
                ]
            }
        }`).reduce((prev, curr, i) => `${prev}${','.repeat((i > 0) as unknown as number)} ${curr}`, "")}
    ]
}`
    }

}

function beginConnection(e: MouseEvent, fromPlug: VPL_Plug) {
    e.preventDefault()
    let rect = fromPlug.getBoundingClientRect()
    let curveSVG = makeSVGElement("path", { "fill": "none", "stroke": window.getComputedStyle(fromPlug).backgroundColor, "stroke-width": 4 })
    this.svgContainer.appendChild(curveSVG)

    let from = new point(rect.x + rect.width / 2, rect.y + rect.height / 2)
    let to = new point(e.pageX, e.pageY)
    let center = point.add(from, to).multiply(1 / 2)
    let fromControl = new point(center.x, from.y)
    let toControl = new point(center.x, to.y)

    if (fromPlug instanceof OutPlug) {
        let curve = new svgCurve(curveSVG, from, to)
        let dragConnection = (e: MouseEvent) => {
            to = new point(e.pageX, e.pageY)
            center = point.add(from, to).multiply(1 / 2)

            fromControl = new point(center.x, from.y)
            toControl = new point(center.x, to.y)

            //Kinda cringe we end up recalcing thrice, I could remove the recalc from the setter and expose it, but that would mean the user would have to call it manually
            //A potentially good solution could be to have a setter that takes a variable amount of parameters, coudl be an object, where the unchanging points are just left undefined
            //Todo: low prio, maybe do that?
            curve.setEnd(to)
            curve.setStartControl(fromControl)
            curve.setEndControl(toControl)
        }

        let stopConnection = (e: MouseEvent) => {
            document.removeEventListener("mousemove", dragConnection)
            document.removeEventListener("mouseup", stopConnection)

            let targetPlug = e.target as HTMLElement
            while (targetPlug && !(targetPlug instanceof VPL_Plug)) { //Move up the parent hierachy, useless for the plugs, as they are (currently at least) leaf nodes, but could be useful if we want to select nodeDiv
                targetPlug = targetPlug.parentNode as HTMLElement
            }

            if (!targetPlug || !(targetPlug instanceof InPlug) || (targetPlug.Type != fromPlug.Type)) {
                curveSVG.remove()
                return
            }

            targetPlug.Connection = fromPlug
            fromPlug.Connections.push(targetPlug)

            targetPlug.Curve = curve
            fromPlug.Curve = curve
            addDots(curve)

        }

        document.addEventListener("mousemove", dragConnection)
        stopConnection = stopConnection.bind(this)
        document.addEventListener("mouseup", stopConnection)

    } else if (fromPlug instanceof InPlug) {
        let curve = new svgCurve(curveSVG, to, from)
        let dragConnection = (e: MouseEvent) => {
            to = new point(e.pageX, e.pageY)
            center = point.add(from, to).multiply(1 / 2)

            fromControl = new point(center.x, from.y)
            toControl = new point(center.x, to.y)

            curve.setStart(to)
            curve.setStartControl(toControl)
            curve.setEndControl(fromControl)
        }

        let stopConnection = (e: MouseEvent) => {
            document.removeEventListener("mousemove", dragConnection)
            document.removeEventListener("mouseup", stopConnection)

            let targetPlug = e.target as HTMLElement
            while (targetPlug && !(targetPlug instanceof VPL_Plug)) { //Move up the parent hierachy, useless for the plugs, as they are (currently at least) leaf nodes, but could be useful if we want to select nodeDiv
                targetPlug = targetPlug.parentNode as HTMLElement
            }

            if (!targetPlug || !(targetPlug instanceof OutPlug) || (targetPlug.Type != fromPlug.Type)) {
                curveSVG.remove()
                return
            }

            fromPlug.Connection = targetPlug
            targetPlug.Connections.push(fromPlug)

            targetPlug.Curve = curve
            fromPlug.Curve = curve
            addDots(curve)

        }

        document.addEventListener("mousemove", dragConnection)
        stopConnection = stopConnection.bind(this)
        document.addEventListener("mouseup", stopConnection)

    } else if (fromPlug instanceof ActionPlug) {
        let curve = new svgCurve(curveSVG, from, to)
        let dragConnection = (e: MouseEvent) => {
            to = new point(e.pageX, e.pageY)
            center = point.add(from, to).multiply(1 / 2)

            fromControl = new point(center.x, from.y)
            toControl = new point(center.x, to.y)

            curve.setEnd(to)
            curve.setStartControl(fromControl)
            curve.setEndControl(toControl)
        }

        let stopConnection = (e: MouseEvent) => {
            document.removeEventListener("mousemove", dragConnection)
            document.removeEventListener("mouseup", stopConnection)

            let target = e.target as HTMLElement
            while (target != undefined && !(target instanceof VPL_Node)) { //Move up the parent hierachy, useless for the plugs, as they are (currently at least) leaf nodes, but could be useful if we want to select nodeDiv
                target = target.parentNode as HTMLElement
            }

            if (!target || !(target instanceof ActionNode)) { //If it's not a node
                curveSVG.remove()
                return
            }

            fromPlug.Connection = target
            target.Connections.push(fromPlug)

            target.Curve = curve
            fromPlug.Curve = curve
            addDots(curve)
            target.classList.add("actionConnected")
        }

        document.addEventListener("mousemove", dragConnection)
        stopConnection = stopConnection.bind(this)
        document.addEventListener("mouseup", stopConnection)
    }
    else {
        throw new Error("Started connection on unknown plug type");
    }

    function addDots(curve: svgCurve) {
        let dots: { setter: (p: point) => void, getter: () => point, element: SVGElement }[] = [
            { setter: curve.setStart.bind(curve), getter: curve.getStart.bind(curve), element: makeSVGElement("circle", { "fill": "yellow", "r": 5, "pointer-events": "all" }) },
            { setter: curve.setStartControl.bind(curve), getter: curve.getC1.bind(curve), element: makeSVGElement("circle", { "fill": "orange", "r": 5, "pointer-events": "all" }) },
            { setter: curve.setEndControl.bind(curve), getter: curve.getC2.bind(curve), element: makeSVGElement("circle", { "fill": "purple", "r": 5, "pointer-events": "all" }) },
            { setter: curve.setEnd.bind(curve), getter: curve.getEnd.bind(curve), element: makeSVGElement("circle", { "fill": "blue", "r": 5, "pointer-events": "all" }) }]
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
}
/// <reference path="GraphRenderer.ts" />

class GraphEditor {
    renderer: GraphRenderer;
    nodes: Pair<GraphNode, [number, number]>[] = []

    constructor(container: HTMLDivElement, bg: HTMLDivElement, graph: Graph) {
        this.renderer = new GraphRenderer(container);
        bg.addEventListener("click", this.onClick.bind(this)) //Don't know how "bind" works, but it makes it so the event fucntion has the instance of GraphEditor as 'this' instead of somehting else
    }

    onClick(event: MouseEvent) {
        let inP = new GraphPlug();
        inP.Type = GraphType.Num;

        let outP = new GraphPlug();
        outP.Type = GraphType.Num;

        let n = new GraphNode([inP, inP], [outP]);
        console.log("inputs:");
        console.log(n.Inputs);

        this.nodes.push(new Pair(n, [event.clientX, event.clientY]));
        this.renderer.RenderNode(n, [event.clientX, event.clientY]);
    }
}


class Pair<keyType, valueType> {
    key: keyType;
    value: valueType;

    constructor(key: keyType, value: valueType) {
        this.key = key;
        this.value = value;
    }
}

class EditorNode {
    node: GraphNode
    pos: [number, number]
    name: string
}


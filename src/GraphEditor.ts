/// <reference path="GraphRenderer.ts" />

class GraphEditor {
    renderer: GraphRenderer;
    graph: Graph;


    constructor(canvas: HTMLCanvasElement, graph: Graph) {
        this.renderer = new GraphRenderer(canvas);
        this.graph = graph;

        canvas.addEventListener("mousedown", this.onClick)
    }

    onClick(event: MouseEvent) {
        let n = new GraphNode();
        this.graph.Nodes.push(n);

        event.clientX
    }

    loop() {
        this.renderer.RenderGraph(this.graph);
    }
}
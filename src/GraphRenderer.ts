/// <reference path="Graph.ts" />

class GraphRenderer {
    private pos: number = 1;

    private renderingContext: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement) {
        this.renderingContext = canvas.getContext("2d");
    }

    public RenderGraph(g: Graph) {
        this.renderingContext.fillRect(this.pos += 10, 100, 50, 10);
    }
}
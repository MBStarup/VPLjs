var Graph = /** @class */ (function () {
    function Graph() {
    }
    return Graph;
}());
var GraphNode = /** @class */ (function () {
    function GraphNode() {
    }
    GraphNode.prototype["void"] = function (ins, outs) {
    };
    return GraphNode;
}());
var GraphPlug = /** @class */ (function () {
    function GraphPlug() {
    }
    return GraphPlug;
}());
var GraphRelation = /** @class */ (function () {
    function GraphRelation() {
    }
    return GraphRelation;
}());
var GraphType;
(function (GraphType) {
    GraphType[GraphType["Num"] = 0] = "Num";
    GraphType[GraphType["Text"] = 1] = "Text";
    GraphType[GraphType["Bool"] = 2] = "Bool";
    GraphType[GraphType["User"] = 3] = "User";
    GraphType[GraphType["Message"] = 4] = "Message";
    GraphType[GraphType["Time"] = 5] = "Time";
    GraphType[GraphType["Channel"] = 6] = "Channel";
    GraphType[GraphType["Category"] = 7] = "Category";
    GraphType[GraphType["Emoji"] = 8] = "Emoji";
    GraphType[GraphType["MessageType"] = 9] = "MessageType";
})(GraphType || (GraphType = {}));
/// <reference path="Graph.ts" />
var GraphRenderer = /** @class */ (function () {
    function GraphRenderer(canvas) {
        this.pos = 1;
        this.renderingContext = canvas.getContext("2d");
    }
    GraphRenderer.prototype.RenderGraph = function (g) {
        this.renderingContext.fillRect(this.pos += 10, 100, 50, 10);
    };
    return GraphRenderer;
}());
/// <reference path="GraphRenderer.ts" />
var GraphEditor = /** @class */ (function () {
    function GraphEditor(canvas, graph) {
        this.renderer = new GraphRenderer(canvas);
        this.graph = graph;
    }
    GraphEditor.prototype.loop = function () {
        this.renderer.RenderGraph(this.graph);
    };
    return GraphEditor;
}());
/// <reference path="GraphEditor.ts" />
var canvas = document.getElementById('canvas');
canvas.width = document.body.clientWidth; //document.width is obsolete
canvas.height = document.body.clientHeight; //document.height is obsolete
var e = new GraphEditor(canvas, new Graph());
alert("1");
function mainLoop() {
    e.loop();
    setTimeout(mainLoop, 1000);
}
mainLoop();

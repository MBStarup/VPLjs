var Graph = /** @class */ (function () {
    function Graph() {
    }
    return Graph;
}());
var GraphNode = /** @class */ (function () {
    function GraphNode(ins, outs) {
        this.Inputs = ins;
        this.Outputs = outs;
    }
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
    function GraphRenderer(container) {
        this.pos = 1;
        this.rendered = [];
        this.container = container;
    }
    GraphRenderer.prototype.RenderNode = function (n, p) {
        var _a, _b;
        if (this.rendered.indexOf(n) === -1) {
            var nodeDiv_1 = document.createElement("div");
            nodeDiv_1.classList.add("node" + this.pos++);
            nodeDiv_1.setAttribute("style", "pointer-events:all;width:100px;height:100px;background-color:#ff0000;position:absolute;top:" + p[1].toString() + "px;left:" + p[0].toString() + "px");
            nodeDiv_1.addEventListener("click", function (e) { nodeDiv_1.style.backgroundColor = "#00ff00"; });
            var inputDiv_1 = document.createElement("div");
            inputDiv_1.classList.add("input");
            nodeDiv_1.appendChild(inputDiv_1);
            (_a = n.Inputs) === null || _a === void 0 ? void 0 : _a.forEach(function (input) {
                var elem = document.createElement("div");
                elem.classList.add(GraphType[input.Type]);
                inputDiv_1.appendChild(elem);
            });
            var outputDiv_1 = document.createElement("div");
            outputDiv_1.classList.add("output");
            nodeDiv_1.appendChild(outputDiv_1);
            (_b = n.Outputs) === null || _b === void 0 ? void 0 : _b.forEach(function (output) {
                var elem = document.createElement("div");
                elem.classList.add(GraphType[output.Type]);
                outputDiv_1.appendChild(elem);
            });
            this.container.appendChild(nodeDiv_1);
            this.rendered.push(n);
        }
    };
    return GraphRenderer;
}());
/// <reference path="GraphRenderer.ts" />
var GraphEditor = /** @class */ (function () {
    function GraphEditor(container, bg, graph) {
        this.nodes = [];
        this.renderer = new GraphRenderer(container);
        bg.addEventListener("click", this.onClick.bind(this)); //Don't know how "bind" works, but it makes it so the event fucntion has the instance of GraphEditor as 'this' instead of somehting else
    }
    GraphEditor.prototype.onClick = function (event) {
        var inP = new GraphPlug();
        inP.Type = GraphType.Num;
        var outP = new GraphPlug();
        outP.Type = GraphType.Num;
        var n = new GraphNode([inP, inP], [outP]);
        console.log("inputs:");
        console.log(n.Inputs);
        this.nodes.push(new Pair(n, [event.clientX, event.clientY]));
        this.renderer.RenderNode(n, [event.clientX, event.clientY]);
    };
    return GraphEditor;
}());
var Pair = /** @class */ (function () {
    function Pair(key, value) {
        this.key = key;
        this.value = value;
    }
    return Pair;
}());
var EditorNode = /** @class */ (function () {
    function EditorNode() {
    }
    return EditorNode;
}());
/// <reference path="GraphEditor.ts" />
var container = document.getElementById('container');
var bg = document.getElementById('bg');
bg.style.width = document.body.clientWidth.toString() + "px";
bg.style.height = document.body.clientHeight.toString() + "px";
var e = new GraphEditor(container, bg, new Graph());
alert("sdsds");

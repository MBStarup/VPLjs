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
    function GraphPlug(type) {
        this.Type = type;
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
var Pair = /** @class */ (function () {
    function Pair(key, value) {
        this.key = key;
        this.value = value;
    }
    return Pair;
}());
/// <reference path="Graph.ts" />
var GraphEditor = /** @class */ (function () {
    function GraphEditor(container, bg, graph) {
        this.nodes = [];
        bg.addEventListener("click", this.onClick.bind(this)); //Don't know how "bind" works, but it makes it so the event fucntion has the instance of GraphEditor as 'this' instead of somehting else
        this.container = container;
    }
    GraphEditor.prototype.onClick = function (event) {
        var n = new GraphNode([new GraphPlug(GraphType.Num), new GraphPlug(GraphType.Text), new GraphPlug(GraphType.Emoji)], [new GraphPlug(GraphType.Num), new GraphPlug(GraphType.Time)]);
        this.nodes.push(new Pair(n, [event.clientX, event.clientY]));
        var div = this.RenderNode(n, [event.clientX, event.clientY]);
        //div.addEventListener("click", (e) => { div.style.backgroundColor = "#00ffff" });
        //div.addEventListener("drag")
    };
    GraphEditor.prototype.RenderNode = function (n, p) {
        var _this = this;
        var _a, _b;
        var nodeDiv = document.createElement("div");
        nodeDiv.classList.add("node");
        nodeDiv.setAttribute("style", "top: " + p[1].toString() + "px; left: " + p[0].toString() + "px");
        var headerDiv = document.createElement("div");
        headerDiv.classList.add("header");
        headerDiv.innerText = "HEADER";
        headerDiv.addEventListener("mousedown", function (e) { return _this.dragNode(e, nodeDiv); });
        var bodyDiv = document.createElement("div");
        bodyDiv.classList.add("body");
        nodeDiv.appendChild(headerDiv);
        nodeDiv.appendChild(bodyDiv);
        var inputListDiv = document.createElement("div");
        inputListDiv.classList.add("inputList");
        bodyDiv.appendChild(inputListDiv);
        (_a = n.Inputs) === null || _a === void 0 ? void 0 : _a.forEach(function (input) {
            var inputDiv = document.createElement("div");
            inputDiv.classList.add("input");
            var elem = document.createElement("div");
            var text = document.createElement("p");
            elem.classList.add("typeDot", GraphType[input.Type]);
            text.innerHTML = GraphType[input.Type];
            inputDiv.appendChild(elem);
            inputDiv.appendChild(text);
            inputListDiv.appendChild(inputDiv);
        });
        var outputListDiv = document.createElement("div");
        outputListDiv.classList.add("outputList");
        bodyDiv.appendChild(outputListDiv);
        (_b = n.Outputs) === null || _b === void 0 ? void 0 : _b.forEach(function (output) {
            var outputDiv = document.createElement("div");
            outputDiv.classList.add("output");
            var elem = document.createElement("div");
            var text = document.createElement("p");
            elem.classList.add("typeDot", GraphType[output.Type]);
            text.innerHTML = GraphType[output.Type];
            outputDiv.appendChild(elem);
            outputDiv.appendChild(text);
            outputListDiv.appendChild(outputDiv);
        });
        this.container.appendChild(nodeDiv);
        return nodeDiv;
    };
    GraphEditor.prototype.dragNode = function (e, node) {
        var newX;
        var newY;
        var oldX = e.clientX;
        var oldY = e.clientY;
        node.style.zIndex = "1";
        node.addEventListener("mouseup", stopDragNode);
        node.addEventListener("mousemove", dragMove);
        function dragMove(e) {
            newX = oldX - e.clientX;
            newY = oldY - e.clientY;
            oldX = e.clientX;
            oldY = e.clientY;
            // set the element's new position:
            node.style.top = (node.offsetTop - newY) + "px";
            node.style.left = (node.offsetLeft - newX) + "px";
        }
        function stopDragNode(e) {
            node.removeEventListener("mouseup", stopDragNode);
            node.removeEventListener("mousemove", dragMove);
            node.style.zIndex = null;
        }
    };
    return GraphEditor;
}());
/// <reference path="GraphEditor.ts" />
var container = document.getElementById('container');
container.style.width = document.body.clientWidth.toString() + "px";
container.style.height = document.body.clientHeight.toString() + "px";
var bg = document.getElementById('bg');
bg.style.width = document.body.clientWidth.toString() + "px";
bg.style.height = document.body.clientHeight.toString() + "px";
var e = new GraphEditor(container, bg, new Graph());
alert("sdsds");

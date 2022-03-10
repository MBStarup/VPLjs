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
    function GraphEditor(container, bg, svgContainer, graph) {
        this.nodes = [];
        bg.addEventListener("click", this.spawnNode.bind(this)); //Don't know how "bind" works, but it makes it so the event fucntion has the instance of GraphEditor as 'this' instead of somehting else
        this.container = container;
    }
    GraphEditor.prototype.spawnNode = function (e) {
        e.preventDefault();
        var n = new GraphNode([new GraphPlug(GraphType.Num), new GraphPlug(GraphType.Text), new GraphPlug(GraphType.Emoji)], [new GraphPlug(GraphType.Num), new GraphPlug(GraphType.Time)]);
        this.nodes.push(new Pair(n, [e.clientX, e.clientY]));
        var div = this.RenderNode(n, [e.clientX, e.clientY]);
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
            elem.addEventListener("mousedown", function (e) { return _this.handleCurve(e, elem, input); });
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
            elem.addEventListener("mousedown", function (e) { return _this.handleCurve(e, elem, output); });
            text.innerHTML = GraphType[output.Type];
            outputDiv.appendChild(elem);
            outputDiv.appendChild(text);
            outputListDiv.appendChild(outputDiv);
        });
        this.container.appendChild(nodeDiv);
        return nodeDiv;
    };
    GraphEditor.prototype.handleCurve = function (e, div, plug) {
        e.preventDefault();
        var start = new point(e.clientX, e.clientY);
        var curveSVG = this.makeSVGElement("path", { "fill": "none", "stroke": "red", "stroke-width": 3 });
        var scaler = 1.5;
        var center = new point(((start.x + e.clientX) / 2), ((start.y + e.clientY) / 2));
        var inverseSlope = (start.x - e.clientX) / (e.clientY - start.y);
        var a1 = ((start.y + center.y) / 2) - (((start.x + center.x) / 2) * inverseSlope);
        var p1 = new point(((start.x + center.x) / 2) + scaler, ((start.y + center.y) / 2) + inverseSlope * scaler + a1);
        var curve = new svgCurve(curveSVG, start, new point(e.clientX, e.clientY), p1);
        var dot = this.makeSVGElement("circle", { "fill": "blue", "r": 5, "pointer-events": "all" });
        document.addEventListener("mousemove", dragCurve);
        document.addEventListener("mouseup", releaseCurve);
        dot.addEventListener("mousedown", handleDot);
        function handleDot(e) {
            document.addEventListener("mousemove", dragDot);
            document.addEventListener("mouseup", releaseDot);
            function dragDot(e) {
                curve.setC1(new point(e.clientX, e.clientY));
                dot.setAttribute("cx", curve.c1.x.toString());
                dot.setAttribute("cy", curve.c1.y.toString());
            }
            function releaseDot(e) {
                document.removeEventListener("mousemove", dragDot);
                document.removeEventListener("mouseup", releaseDot);
            }
        }
        svgContainer.appendChild(curveSVG);
        svgContainer.appendChild(dot);
        function dragCurve(e) {
            var center = new point(((start.x + e.clientX) / 2), ((start.y + e.clientY) / 2));
            var p1 = center;
            curve.setC1(p1);
            curve.setEnd(new point(e.clientX, e.clientY));
            dot.setAttribute("cx", curve.c1.x.toString());
            dot.setAttribute("cy", curve.c1.y.toString());
        }
        function releaseCurve(e) {
            document.removeEventListener("mousemove", dragCurve);
            document.removeEventListener("mouseup", releaseCurve);
        }
    };
    //http://stackoverflow.com/a/3642265/1869660
    GraphEditor.prototype.makeSVGElement = function (tag, attrs) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs) {
            el.setAttribute(k, attrs[k]);
        }
        return el;
    };
    GraphEditor.prototype.dragNode = function (e, node) {
        e.preventDefault();
        var newX;
        var newY;
        var oldX = e.clientX;
        var oldY = e.clientY;
        node.style.zIndex = "1";
        document.addEventListener("mouseup", stopDragNode);
        document.addEventListener("mousemove", dragMove);
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
            document.removeEventListener("mouseup", stopDragNode);
            document.removeEventListener("mousemove", dragMove);
            node.style.zIndex = null;
        }
    };
    return GraphEditor;
}());
var svgCurve = /** @class */ (function () {
    function svgCurve(element, start, end, c1) {
        this.element = element;
        this.start = start;
        this.end = end;
        this.c1 = c1;
        this.recalc();
    }
    svgCurve.prototype.setStart = function (p) {
        this.start = p;
        this.recalc();
    };
    svgCurve.prototype.setC1 = function (p) {
        this.c1 = p;
        this.recalc();
    };
    svgCurve.prototype.setEnd = function (p) {
        this.end = p;
        this.recalc();
    };
    svgCurve.prototype.recalc = function () {
        this.element.setAttribute("d", this.getSVGData());
    };
    svgCurve.prototype.getSVGData = function () {
        var center = new point(((this.start.x + this.end.x) / 2), ((this.start.y + this.end.y) / 2));
        return (" M " + this.start.x + " " + this.start.y + //start point
            " Q " + this.c1.x + " " + this.c1.y + //startpoint curve towards
            " , " + center.x + " " + center.y + //center
            " T " + this.end.x + " " + this.end.y);
    };
    return svgCurve;
}());
var point = /** @class */ (function () {
    function point(x, y) {
        this.x = x !== null && x !== void 0 ? x : 0;
        this.y = y !== null && y !== void 0 ? y : 0;
    }
    point.prototype.add = function (p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    };
    point.prototype.subtract = function (p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    };
    point.prototype.multiply = function (n) {
        this.x *= n;
        this.y *= n;
        return this;
    };
    point.add = function (p1, p2) {
        return new point(p1.x + p2.x, p1.y + p2.y);
    };
    point.subtract = function (p1, p2) {
        return new point(p1.x - p2.x, p1.y - p2.y);
    };
    point.multiply = function (p1, n) {
        return new point(p1.x * n, p1.y * n);
    };
    return point;
}());
/// <reference path="GraphEditor.ts" />
var container = document.getElementById('container');
container.style.width = document.body.clientWidth.toString() + "px";
container.style.height = document.body.clientHeight.toString() + "px";
var bg = document.getElementById('bg');
bg.style.width = document.body.clientWidth.toString() + "px";
bg.style.height = document.body.clientHeight.toString() + "px";
var svgContainer = document.getElementById('svgContainer');
svgContainer.style.width = document.body.clientWidth.toString() + "px";
svgContainer.style.height = document.body.clientHeight.toString() + "px";
var e = new GraphEditor(container, bg, svgContainer, new Graph());
alert("sdsds");

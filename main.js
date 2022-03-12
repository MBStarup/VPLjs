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
        this.svgContainer = svgContainer;
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
        var _this = this;
        e.preventDefault();
        var start = new point(e.clientX, e.clientY);
        var end = new point(e.clientX, e.clientY);
        var curveSVG = makeSVGElement("path", { "fill": "none", "stroke": "red", "stroke-width": 3 });
        //let scaler = 1.5;
        var center = point.add(start, end).multiply(1 / 2);
        //let inverseSlope = (start.x - e.clientX) / (e.clientY - start.y)
        //let a1 = ((start.y + center.y) / 2) - (((start.x + center.x) / 2) * inverseSlope)
        //let p1 = new point(((start.x + center.x) / 2) + scaler, ((start.y + center.y) / 2) + inverseSlope * scaler + a1)
        var p1 = new point(center.x, start.y);
        var p2 = new point(center.x, end.y);
        var curve = new svgCurve(curveSVG, start, end, p1, p2);
        var centerDot = makeSVGElement("circle", { "fill": "red", "r": 10, "pointer-events": "all" });
        var dragCurve = function (e) {
            end = new point(e.clientX, e.clientY);
            center = point.add(start, end).multiply(1 / 2);
            p1 = new point(center.x, start.y);
            p2 = new point(center.x, end.y);
            curve.setC1(p1);
            curve.setC2(p2);
            curve.setEnd(end);
            centerDot.setAttribute("cx", curve.getCenter().x.toString());
            centerDot.setAttribute("cy", curve.getCenter().y.toString());
        };
        var releaseCurve = function (e) {
            document.removeEventListener("mousemove", dragCurve);
            document.removeEventListener("mouseup", releaseCurve);
            var dots = [
                { setter: curve.setStart.bind(curve), getter: curve.getStart.bind(curve), element: makeSVGElement("circle", { "fill": "orange", "r": 5, "pointer-events": "all" }) },
                { setter: curve.setC1.bind(curve), getter: curve.getC1.bind(curve), element: makeSVGElement("circle", { "fill": "yellow", "r": 5, "pointer-events": "all" }) },
                { setter: curve.setC2.bind(curve), getter: curve.getC2.bind(curve), element: makeSVGElement("circle", { "fill": "blue", "r": 5, "pointer-events": "all" }) },
                { setter: curve.setEnd.bind(curve), getter: curve.getEnd.bind(curve), element: makeSVGElement("circle", { "fill": "purple", "r": 5, "pointer-events": "all" }) }
            ];
            dots.forEach(function (dot) { return handleDotWrapper(dot); });
            function handleDotWrapper(dot) {
                dot.element.addEventListener("mousedown", handleDot);
                dot.element.setAttribute("cx", dot.getter().x.toString());
                dot.element.setAttribute("cy", dot.getter().y.toString());
                function handleDot(_) {
                    document.addEventListener("mousemove", dragDot);
                    document.addEventListener("mouseup", releaseDot);
                    function dragDot(e) {
                        dot.setter(new point(e.clientX, e.clientY));
                        dot.element.setAttribute("cx", dot.getter().x.toString());
                        dot.element.setAttribute("cy", dot.getter().y.toString());
                        centerDot.setAttribute("cx", curve.getCenter().x.toString());
                        centerDot.setAttribute("cy", curve.getCenter().y.toString());
                    }
                    function releaseDot(_) {
                        document.removeEventListener("mousemove", dragDot);
                        document.removeEventListener("mouseup", releaseDot);
                    }
                }
            }
            dots.forEach(function (dot) { return _this.svgContainer.appendChild(dot.element); });
        };
        this.svgContainer.appendChild(curveSVG);
        this.svgContainer.appendChild(centerDot);
        document.addEventListener("mousemove", dragCurve);
        releaseCurve = releaseCurve.bind(this);
        document.addEventListener("mouseup", releaseCurve);
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
    function svgCurve(element, start, end, c1, c2) {
        this.element = element;
        this.start = start;
        this.end = end;
        this.center = point.add(this.start, this.end).multiply(1 / 2);
        this.c1 = c1 !== null && c1 !== void 0 ? c1 : new point(this.center.x, this.start.y);
        this.c2 = c2 !== null && c2 !== void 0 ? c2 : new point(this.center.x, this.end.y);
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
    svgCurve.prototype.setC2 = function (p) {
        this.c2 = p;
        this.recalc();
    };
    svgCurve.prototype.setEnd = function (p) {
        this.end = p;
        this.recalc();
    };
    svgCurve.prototype.getStart = function () {
        return (this.start);
    };
    svgCurve.prototype.getC1 = function () { return this.c1; };
    svgCurve.prototype.getCenter = function () { return this.center; };
    svgCurve.prototype.getC2 = function () { return this.c2; };
    svgCurve.prototype.getEnd = function () { return this.end; };
    svgCurve.prototype.recalc = function () {
        this.center = point.add(this.start, this.end).multiply(1 / 2);
        this.element.setAttribute("d", this.getSVGData());
    };
    svgCurve.prototype.getSVGData = function () {
        return (" M " + this.start.x + " " + this.start.y + //start point
            " C " + this.c1.x + " " + this.c1.y + //startpoint curve towards
            " , " + this.c1.x + " " + this.c1.y + //center
            " , " + this.center.x + " " + this.center.y + //center
            " C " + +" " + this.c2.x + " " + this.c2.y +
            " , " + +" " + this.c2.x + " " + this.c2.y +
            " , " + this.end.x + " " + this.end.y);
        // return (" M " + this.start.x + " " + this.start.y + //start point
        //     " Q " + this.c1.x + " " + this.c1.y + //startpoint curve towards
        //     " , " + center.x + " " + center.y + //center
        //     " T " + this.end.x + " " + this.end.y)
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
    point.prototype.copy = function () { return new point(this.x, this.y); };
    point.copy = function (p) { return new point(p.x, p.y); };
    point.add = function (p1, p2) { return new point(p1.x + p2.x, p1.y + p2.y); };
    point.subtract = function (p1, p2) { return new point(p1.x - p2.x, p1.y - p2.y); };
    point.multiply = function (p1, n) { return new point(p1.x * n, p1.y * n); };
    point.center = function (p1, p2) { return new point(((p1.x + p2.x) / 2), ((p1.y + p2.y) / 2)); };
    point.dotP = function (p1, p2) { return p1.x * p2.x + p1.y * p2.y; };
    point.unit = function (p) {
        var s = Math.sqrt(p.x * p.x + p.y * p.y);
        return new point(p.x / s, p.y / s);
    };
    point.zero = new point(0, 0);
    return point;
}());
//http://stackoverflow.com/a/3642265/1869660
function makeSVGElement(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) {
        el.setAttribute(k, attrs[k]);
    }
    return el;
}
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

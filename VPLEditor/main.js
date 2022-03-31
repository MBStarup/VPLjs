var Graph = /** @class */ (function () {
    function Graph() {
    }
    return Graph;
}());
var GraphNode = /** @class */ (function () {
    function GraphNode(name, ins, outs) {
        this.Name = name;
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
        this.isDraggingCurve = false;
        bg.addEventListener("click", this.spawnNode.bind(this)); //Don't know how "bind" works, but it makes it so the event fucntion has the instance of GraphEditor as 'this' instead of somehting else
        this.container = container;
        this.svgContainer = svgContainer;
    }
    GraphEditor.prototype.spawnNode = function (e) {
        e.preventDefault();
        var n = new GraphNode("TestNode", [new GraphPlug(GraphType.Num), new GraphPlug(GraphType.Text), new GraphPlug(GraphType.Emoji)], [new GraphPlug(GraphType.Num), new GraphPlug(GraphType.Time)]);
        var nodeDiv = this.makeNodeElement(n);
        nodeDiv.setAttribute("style", "top: " + e.clientY.toString() + "px; left: " + e.clientX.toString() + "px");
        this.container.appendChild(nodeDiv);
        this.nodes.push(n);
    };
    GraphEditor.prototype.handleCurve = function (e, div, plug) {
        var _this = this;
        this.isDraggingCurve = true;
        this.draggingFrom = plug;
        e.preventDefault();
        var rect = div.getBoundingClientRect();
        var start = new point(rect.x + rect.width / 2, rect.y + rect.height / 2);
        var end = new point(e.clientX, e.clientY);
        var curveSVG = makeSVGElement("path", { "fill": "none", "stroke": window.getComputedStyle(div).backgroundColor, "stroke-width": 4 });
        var center = point.add(start, end).multiply(1 / 2);
        var p1 = new point(center.x, start.y);
        var p2 = new point(center.x, end.y);
        var curve = new svgCurve(curveSVG, start, end);
        //let centerDot = makeSVGElement("circle", { "fill": "red", "r": 3, "pointer-events": "all" })
        var dragCurve = function (e) {
            end = new point(e.clientX, e.clientY);
            center = point.add(start, end).multiply(1 / 2);
            p1 = new point((start.x + center.x) / 2, start.y);
            p2 = new point((end.x + center.x) / 2, end.y);
            curve.setC1(p1);
            curve.setC2(p2);
            curve.setEnd(end);
            //centerDot.setAttribute("cx", curve.getCenter().x.toString())
            //centerDot.setAttribute("cy", curve.getCenter().y.toString())
        };
        var releaseCurve = function (e) {
            _this.isDraggingCurve = false;
            _this.draggingFrom = null;
            document.removeEventListener("mousemove", dragCurve);
            document.removeEventListener("mouseup", releaseCurve);
            /*
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
                
                function handleDotWrapper(dot: { setter: (p: point) => void, getter: () => point, element: SVGElement }) {
                dot.element.addEventListener("mousedown", handleDot)
                
                dot.element.setAttribute("cx", dot.getter().x.toString())
                dot.element.setAttribute("cy", dot.getter().y.toString())
                
                function handleDot(_: MouseEvent) {
                    document.addEventListener("mousemove", dragDot)
                    document.addEventListener("mouseup", releaseDot)
                    
                    function dragDot(e: MouseEvent) {
                        dot.setter(new point(e.clientX, e.clientY))
                        dot.element.setAttribute("cx", dot.getter().x.toString())
                        dot.element.setAttribute("cy", dot.getter().y.toString())
                        
                        centerDot.setAttribute("cx", curve.getCenter().x.toString())
                        centerDot.setAttribute("cy", curve.getCenter().y.toString())
                    }
                    
                    function releaseDot(_: MouseEvent) {
                        document.removeEventListener("mousemove", dragDot)
                        document.removeEventListener("mouseup", releaseDot)
                    }
                }
            }

            dots.forEach(dot => this.svgContainer.appendChild(dot.element))
            */
        };
        this.svgContainer.appendChild(curveSVG);
        //this.svgContainer.appendChild(centerDot)
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
    GraphEditor.prototype.makeNodeElement = function (n) {
        var _this = this;
        var _a, _b;
        var nodeDiv = document.createElement("div"); //Make the outer div
        nodeDiv.classList.add("node"); //Set the class for the css
        var headerDiv = document.createElement("div"); //Make the header of the node (Where the name is written)
        headerDiv.classList.add("header"); //Set class for css
        var headerText = document.createElement("p");
        headerText.innerText = n.Name; //Set the text in the header  
        headerDiv.appendChild(headerText);
        headerDiv.addEventListener("mousedown", function (e) { return _this.dragNode(e, nodeDiv); }); //Make it draggable
        nodeDiv.appendChild(headerDiv); //Add the header to the outer div
        var bodyDiv = document.createElement("div"); // make the body of the node (Where the inputs and outputs go)
        bodyDiv.classList.add("body"); //Set class for css
        nodeDiv.appendChild(bodyDiv); //Add the body to the outer div
        var inputListDiv = document.createElement("div"); //Create the container for the inputs
        inputListDiv.classList.add("inputList"); //Set class for css
        (_a = n.Inputs) === null || _a === void 0 ? void 0 : _a.forEach(function (input) {
            var inputDiv = document.createElement("div");
            inputDiv.classList.add("input"); //Set class for css
            var dot = document.createElement("div"); //Make a div for the dot
            var text = document.createElement("p"); //Make a paragraph for the name of the input
            dot.classList.add("typeDot", GraphType[input.Type]); //Set classes for css
            //dot.addEventListener("mousedown", (e) => this.handleCurve(e, dot, input)) //Make clicking the dot do curve things //TODOOO: make this also keep track of relations
            dot.addEventListener("mouseup", function (e) {
                if (_this.draggingFrom.Type == input.Type && _this.isDraggingCurve) {
                    alert("Poggers");
                }
            });
            text.innerHTML = GraphType[input.Type]; //Set the text of the paragrah to be the type of the input (enum -> text)
            inputDiv.appendChild(dot);
            inputDiv.appendChild(text);
            inputListDiv.appendChild(inputDiv);
        });
        bodyDiv.appendChild(inputListDiv); //Add the inputs to the body
        var outputListDiv = document.createElement("div");
        outputListDiv.classList.add("outputList"); //Set class for css
        bodyDiv.appendChild(outputListDiv);
        (_b = n.Outputs) === null || _b === void 0 ? void 0 : _b.forEach(function (output) {
            var outputDiv = document.createElement("div");
            outputDiv.classList.add("output");
            var dot = document.createElement("div");
            var text = document.createElement("p");
            dot.classList.add("typeDot", GraphType[output.Type]); //Set classes for css
            dot.addEventListener("mousedown", function (e) { return _this.handleCurve(e, dot, output); });
            text.innerHTML = GraphType[output.Type];
            outputDiv.appendChild(dot);
            outputDiv.appendChild(text);
            outputListDiv.appendChild(outputDiv);
        });
        return nodeDiv;
    };
    return GraphEditor;
}());
var svgCurve = /** @class */ (function () {
    function svgCurve(element, start, end) {
        this.events = new Array();
        this.element = element;
        this.start = start;
        this.end = end;
        this.center = point.add(this.start, this.end).multiply(1 / 2);
        this.c1 = new point((this.start.x + this.center.x) / 2, this.start.y);
        this.c2 = new point((this.end.x + this.center.x) / 2, this.end.y);
        this.recalc();
    }
    //TODO: Fix issues with start and end being at the same height
    //TODO: Figure out why moving the start retains the relative spacing of c1 and c2, but mocing end doesn't
    svgCurve.prototype.setStart = function (p) {
        var oldStart = this.start;
        this.start = p;
        if (this.start.y != this.end.y) {
            this.c1.x = (((this.c1.x - oldStart.x) / (this.end.x - oldStart.x)) * (this.end.x - this.start.x) + this.start.x);
            this.c1.y = (((this.c1.y - oldStart.y) / (this.end.y - oldStart.y)) * (this.end.y - this.start.y) + this.start.y);
            this.c2.x = (((this.c2.x - oldStart.x) / (this.end.x - oldStart.x)) * (this.end.x - this.start.x) + this.start.x);
            this.c2.y = (((this.c2.y - oldStart.y) / (this.end.y - oldStart.y)) * (this.end.y - this.start.y) + this.start.y);
        }
        if (this.start.y < this.end.y && this.start.x < this.end.x) {
            this.c1.y = Math.min(this.c1.y, this.start.y);
            this.c2.y = Math.max(this.c2.y, this.end.y);
        }
        else {
            this.c1.y = Math.max(this.c1.y, this.start.y);
            this.c2.y = Math.min(this.c2.y, this.end.y);
        }
        this.c1.x = Math.max(this.c1.x, this.start.x);
        this.c2.x = Math.min(this.c2.x, this.end.x);
        this.recalc();
    };
    svgCurve.prototype.setC1 = function (p) {
        this.c1 = p;
        this.c1.x = Math.max(this.c1.x, this.start.x);
        if (this.start.y < this.end.y && this.start.x < this.end.x) {
            this.c1.y = Math.min(this.c1.y, this.start.y);
            this.c2.y = Math.max(this.c2.y, this.end.y);
        }
        else {
            this.c1.y = Math.max(this.c1.y, this.start.y);
            this.c2.y = Math.min(this.c2.y, this.end.y);
        }
        this.recalc();
    };
    svgCurve.prototype.setC2 = function (p) {
        this.c2 = p;
        this.c2.x = Math.min(this.c2.x, this.end.x);
        if (this.start.y < this.end.y && this.start.x < this.end.x) {
            this.c1.y = Math.min(this.c1.y, this.start.y);
            this.c2.y = Math.max(this.c2.y, this.end.y);
        }
        else {
            this.c1.y = Math.max(this.c1.y, this.start.y);
            this.c2.y = Math.min(this.c2.y, this.end.y);
        }
        this.recalc();
    };
    svgCurve.prototype.setEnd = function (p) {
        var oldEnd = this.end;
        this.end = p;
        this.c1.x = (((this.c1.x - this.start.x) / (oldEnd.x - this.start.x)) * (this.end.x - this.start.x) + this.start.x);
        this.c1.y = (((this.c1.y - this.start.y) / (oldEnd.x - this.start.y)) * (this.end.y - this.start.y) + this.start.y);
        this.c2.x = (((this.c2.x - this.start.x) / (oldEnd.x - this.start.x)) * (this.end.x - this.start.x) + this.start.x);
        this.c2.y = (((this.c2.y - this.start.y) / (oldEnd.x - this.start.y)) * (this.end.y - this.start.y) + this.start.y);
        if (this.start.y < this.end.y && this.start.x < this.end.x) {
            this.c1.y = Math.min(this.c1.y, this.start.y);
            this.c2.y = Math.max(this.c2.y, this.end.y);
        }
        else {
            this.c1.y = Math.max(this.c1.y, this.start.y);
            this.c2.y = Math.min(this.c2.y, this.end.y);
        }
        this.recalc();
    };
    svgCurve.prototype.getStart = function () {
        return (this.start);
    };
    svgCurve.prototype.getC1 = function () { return this.c1; };
    svgCurve.prototype.getCenter = function () { return this.center; };
    svgCurve.prototype.getC2 = function () { return this.c2; };
    svgCurve.prototype.getEnd = function () { return this.end; };
    svgCurve.prototype.calcCenter = function () {
        var d = [[this.start, this.end], [this.c1, this.c2]];
        var a0 = (d[0][0].y - d[0][1].y) / (d[0][0].x - d[0][1].x);
        var a1 = (d[1][0].y - d[1][1].y) / (d[1][0].x - d[1][1].x);
        var b0 = d[0][0].y - a0 * d[0][0].x;
        var b1 = d[1][0].y - a1 * d[1][0].x;
        var x = (b0 - b1) / (a1 - a0);
        var y = a0 * x + b0;
        if (x != x || y != y) { //couldn't use isNaN for some reason
            return point.add(this.start, this.end).multiply(1 / 2);
        }
        else {
            return new point(x, y);
        }
    };
    svgCurve.prototype.recalc = function () {
        this.onUpdate(this);
        this.center = this.calcCenter();
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
    };
    svgCurve.prototype.onUpdate = function (curve) {
        var _this = this;
        this.events.forEach(function (event) {
            event.callback(_this);
        });
    };
    svgCurve.prototype.addEvent = function (id, callback) {
        this.events.push({ id: id, callback: callback });
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

/// <reference path="GraphEditor.ts" />

let windowSize = new point(document.body.clientWidth, document.body.clientHeight)

let container = document.getElementById('container') as HTMLDivElement;
setSize(container, windowSize)

let bg = document.getElementById('bg') as HTMLDivElement;
setSize(bg, windowSize)

let svgContainer = document.getElementById('svgContainer') as unknown as SVGElement;
setSize(svgContainer, windowSize)

let e = new GraphEditor(container, bg, svgContainer, new Graph());
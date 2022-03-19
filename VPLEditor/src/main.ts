/// <reference path="GraphEditor.ts" />

let container = document.getElementById('container') as HTMLDivElement;
container.style.width = document.body.clientWidth.toString() + "px"
container.style.height = document.body.clientHeight.toString() + "px"

let bg = document.getElementById('bg') as HTMLDivElement;
bg.style.width = document.body.clientWidth.toString() + "px"
bg.style.height = document.body.clientHeight.toString() + "px"

let svgContainer = document.getElementById('svgContainer') as unknown as SVGElement;
svgContainer.style.width = document.body.clientWidth.toString() + "px"
svgContainer.style.height = document.body.clientHeight.toString() + "px"

let e = new GraphEditor(container, bg, svgContainer, new Graph());
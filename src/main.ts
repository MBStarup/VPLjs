/// <reference path="GraphEditor.ts" />

let container = document.getElementById('container') as HTMLDivElement;

let bg = document.getElementById('bg') as HTMLDivElement;
bg.style.width = document.body.clientWidth.toString() + "px"
bg.style.height = document.body.clientHeight.toString() + "px"

let e = new GraphEditor(container, bg, new Graph());
alert("sdsds");
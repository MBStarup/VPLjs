/// <reference path="GraphEditor.ts" />

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = document.body.clientWidth; //document.width is obsolete
canvas.height = document.body.clientHeight; //document.height is obsolete
let e = new GraphEditor(canvas, new Graph());
alert("2");
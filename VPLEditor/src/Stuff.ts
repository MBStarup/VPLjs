
class point {
    x: number
    y: number

    constructor(x?: number, y?: number) {
        this.x = x ?? 0
        this.y = y ?? 0
    }

    static zero: point = new point(0, 0)

    add(p: point): point {
        this.x += p.x
        this.y += p.y
        return this
    }

    subtract(p: point): point {
        this.x -= p.x
        this.y -= p.y
        return this
    }

    multiply(n: number): point {
        this.x *= n
        this.y *= n
        return this
    }

    copy() { return new point(this.x, this.y) }

    static copy(p: point) { return new point(p.x, p.y) }

    static add(p1: point, p2: point): point { return new point(p1.x + p2.x, p1.y + p2.y) }

    static subtract(p1: point, p2: point): point { return new point(p1.x - p2.x, p1.y - p2.y) }

    static multiply(p1: point, n: number): point { return new point(p1.x * n, p1.y * n) }

    static center(p1: point, p2: point): point { return new point(((p1.x + p2.x) / 2), ((p1.y + p2.y) / 2)) }



    static dotP(p1: point, p2: point): number { return p1.x * p2.x + p1.y * p2.y }

    static unit(p: point) {
        let s = Math.sqrt(p.x * p.x + p.y * p.y)
        return new point(p.x / s, p.y / s)
    }
}

//http://stackoverflow.com/a/3642265/1869660
function makeSVGElement(tag: string, attrs?: object): SVGElement {
    let el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (let k in attrs) {
        el.setAttribute(k, attrs[k]);
    }
    return el;
}


class svgCurve {
    private start: point
    private center: point
    private end: point
    private startControl: point
    private endControl: point
    private element: SVGElement
    private events: { id: string, callback: ((curve: svgCurve) => void) }[] = new Array()

    constructor(element: SVGElement, start: point, end: point) {
        this.element = element
        this.start = start
        this.end = end

        this.center = point.add(this.start, this.end).multiply(1 / 2)

        this.startControl = new point((this.start.x + this.center.x) / 2, this.start.y)
        this.endControl = new point((this.end.x + this.center.x) / 2, this.end.y)

        this.recalc()
    }

    //TODO: Fix issues with start and end being at the same height
    //TODO: Figure out why moving the start retains the relative spacing of c1 and c2, but mocing end doesn't

    setStart(p: point) {
        let oldStart = this.start
        this.start = p
        this.proportionalAdjustControls(oldStart, this.end)

        this.restrictControlPoints()
        this.recalc()
    }

    setStartControl(p: point) {
        this.startControl = p

        this.startControl.x = Math.max(this.startControl.x, this.start.x)

        this.restrictControlPoints()
        this.recalc()
    }

    setEndControl(p: point) {
        this.endControl = p

        this.endControl.x = Math.min(this.endControl.x, this.end.x)

        this.restrictControlPoints()
        this.recalc()
    }

    setEnd(p: point) {
        let oldEnd = this.end
        this.end = p
        this.proportionalAdjustControls(this.start, oldEnd)
        this.restrictControlPoints()
        this.recalc()
    }

    proportionalAdjustControls(oldStart: point, oldEnd: point) {
        //Logic for moving the control points proportionally
        //Feel free to think of alternatives, I am not a huge fan of this behavior
        //Works great when c1.y is very close to start.y and c2.y is very close to end.y and c2.x > start.x and c1.x < end.x
        //This describes a lot of our usecases, but it's still pretty shit that it gets fucked in all other cases, as there are some other valid cases
        if (this.start.y != this.end.y) {
            this.startControl.x = (((this.startControl.x - oldStart.x) / (oldEnd.x - oldStart.x)) * (this.end.x - this.start.x) + this.start.x)
            this.startControl.y = (((this.startControl.y - oldStart.y) / (oldEnd.y - oldStart.y)) * (this.end.y - this.start.y) + this.start.y)

            this.endControl.x = (((this.endControl.x - oldStart.x) / (oldEnd.x - oldStart.x)) * (this.end.x - this.start.x) + this.start.x)
            this.endControl.y = (((this.endControl.y - oldStart.y) / (oldEnd.y - oldStart.y)) * (this.end.y - this.start.y) + this.start.y)
        }
    }

    restrictControlPoints() {
        if (this.start.y < this.end.y && this.start.x < this.end.x) {
            this.startControl.y = Math.min(this.startControl.y, this.start.y)
            this.endControl.y = Math.max(this.endControl.y, this.end.y)
        } else {
            this.startControl.y = Math.max(this.startControl.y, this.start.y)
            this.endControl.y = Math.min(this.endControl.y, this.end.y)
        }


        let leftRightBuffer = 10
        this.startControl.x = Math.max(this.startControl.x, this.start.x + leftRightBuffer)
        this.endControl.x = Math.min(this.endControl.x, this.end.x - leftRightBuffer)
    }

    getStart(): point {
        return (this.start)
    }

    getC1(): point { return this.startControl }

    getCenter(): point { return this.center }

    getC2(): point { return this.endControl }

    getEnd(): point { return this.end }

    calcCenter(): point {

        let d = [[this.start, this.end], [this.startControl, this.endControl]]

        let a0 = (d[0][0].y - d[0][1].y) / (d[0][0].x - d[0][1].x)
        let a1 = (d[1][0].y - d[1][1].y) / (d[1][0].x - d[1][1].x)

        let b0 = d[0][0].y - a0 * d[0][0].x
        let b1 = d[1][0].y - a1 * d[1][0].x

        let x = (b0 - b1) / (a1 - a0)
        let y = a0 * x + b0

        if (x != x || y != y) { //couldn't use isNaN for some reason
            return point.add(this.start, this.end).multiply(1 / 2)
        }
        else {
            return new point(x, y)
        }
    }

    recalc() {

        this.onUpdate();

        this.center = this.calcCenter()

        this.element.setAttribute("d", this.getSVGData())
    }

    getSVGData(): string {

        return (" M " + this.start.x + " " + this.start.y + //start point
            " C " + this.startControl.x + " " + this.startControl.y + //startpoint curve towards
            " , " + this.startControl.x + " " + this.startControl.y + //center
            " , " + this.center.x + " " + this.center.y + //center
            " C " + + " " + this.endControl.x + " " + this.endControl.y +
            " , " + + " " + this.endControl.x + " " + this.endControl.y +
            " , " + this.end.x + " " + this.end.y)
    }

    private onUpdate() {
        this.events.forEach(event => {
            event.callback(this);
        });
    }

    addEvent(id: string, callback: (s: svgCurve) => void) {
        this.events.push({ id, callback })
    }
}


function setSize(e: HTMLElement | SVGElement, p: point) {
    e.style.width = p.x.toString() + "px"
    e.style.height = p.y.toString() + "px"
}
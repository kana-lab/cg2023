import './style.css'
import {SplineCanvas} from "./spline_canvas";
import {BufferAttribute, Vector2} from "three";

const binarySearch = (arr: number[], x: number): number => {
    if (arr[arr.length - 1] < x)
        return arr.length

    let [i, j] = [0, arr.length]
    while (i < j - 1) {
        const m = Math.floor((i + j) / 2)
        if (x < arr[m]) {
            j = m
        } else {
            i = m
        }
    }

    return i
}

// returns one of the roots of `ax^3 + bx^2 + cx + d = 0`
const solve_cubic_equation = (a: number, b: number, c: number, d: number): number => {
    const evaluate = (t: number): number => {
        return a * t ** 3 + b * t ** 2 + c * t + d
    }

    const differential = (t: number): number => {
        return 3 * a * t ** 2 + 2 * b * t + c
    }

    let x = Math.random()
    let e: number
    do {
        e = evaluate(x)
        x -= e / differential(x)
    } while (Math.abs(e) > 1e-6)

    return x
}

class SplineCanvasEx extends SplineCanvas {
    numSteps: number
    splineKind: string
    knotKind: string

    constructor() {
        super();
        this.numSteps = 30
        this.splineKind = "bezier"
        this.knotKind = "centripetal"
    }

    private bezier(ctrlPoints: Vector2[]): Float32Array {
        const n = this.numSteps
        let result = []

        // bezier curve (n dim)
        // de Casteljau's algorithm
        for (let i = 0; i < n; ++i) {
            const t = i / n

            let div_point = []
            for (const elt of ctrlPoints) {
                div_point.push(elt.clone())
            }

            while (div_point.length > 1) {
                for (let j = 0; j < div_point.length - 1; ++j) {
                    div_point[j]
                        .multiplyScalar(1 - t)
                        .addScaledVector(div_point[j + 1], t)
                }
                div_point.pop()
            }

            const v = div_point[0]
            result.push(v.x)
            result.push(v.y)
            result.push(0.)
        }

        const last = ctrlPoints.pop()!
        result.push(last.x)
        result.push(last.y)
        result.push(0.)
        return new Float32Array(result)
    }

    private catmull_rom(ctrlPoints: Vector2[]): Float32Array {
        const n = this.numSteps
        let result = []

        let knot = [0.]
        for (let i = 1; i < ctrlPoints.length; ++i) {
            if (this.knotKind == "uniform") {
                knot.push(i)
            } else if (this.knotKind == "chordal") {
                const dist = ctrlPoints[i - 1].distanceTo(ctrlPoints[i])
                knot.push(knot[i - 1] + dist)
            } else {
                const dist = ctrlPoints[i - 1].distanceTo(ctrlPoints[i])
                knot.push(knot[i - 1] + dist ** 0.5)
            }
        }

        const interval = knot[knot.length - 1] / n;
        for (let i = 0; i < n; ++i) {
            const t = interval * i
            const k = binarySearch(knot, t)

            const [t0, t1, t2, t3] = [knot[k - 1], knot[k], knot[k + 1], knot[k + 2]]
            const [p0, p1, p2, p3] = [
                ctrlPoints[k - 1], ctrlPoints[k], ctrlPoints[k + 1], ctrlPoints[k + 2]
            ]
            const a1 = new Vector2()
            if (k != 0)
                a1
                    .addScaledVector(p0, (t1 - t) / (t1 - t0))
                    .addScaledVector(p1, (t - t0) / (t1 - t0))
            const a2 = new Vector2()
                .addScaledVector(p1, (t2 - t) / (t2 - t1))
                .addScaledVector(p2, (t - t1) / (t2 - t1))
            const a3 = new Vector2()
            if (k != ctrlPoints.length - 2)
                a3
                    .addScaledVector(p2, (t3 - t) / (t3 - t2))
                    .addScaledVector(p3, (t - t2) / (t3 - t2))
            const b1 = new Vector2()
                .addScaledVector(a1, (t2 - t) / (t2 - t0))
                .addScaledVector(a2, (t - t0) / (t2 - t0))
            const b2 = new Vector2()
                .addScaledVector(a2, (t3 - t) / (t3 - t1))
                .addScaledVector(a3, (t - t1) / (t3 - t1))
            const c = new Vector2()
                .addScaledVector(b1, (t2 - t) / (t2 - t1))
                .addScaledVector(b2, (t - t1) / (t2 - t1))

            if (k == 0) {
                result.push(b2.x)
                result.push(b2.y)
            } else if (k == ctrlPoints.length - 2) {
                result.push(b1.x)
                result.push(b1.y)
            } else {
                result.push(c.x)
                result.push(c.y)
            }
            result.push(0.)
        }

        const last = ctrlPoints.pop()!
        result.push(last.x)
        result.push(last.y)
        result.push(0.)
        return new Float32Array(result)
    }

    private c2_interpolation(ctrlPoints: Vector2[]): Float32Array {
        let bezier = [new Vector2()]
        for (let i = 1; i < ctrlPoints.length - 1; ++i) {
            const [p, q, r] = [ctrlPoints[i + 1], ctrlPoints[i], ctrlPoints[i - 1]]
            const a = p.clone().sub(r).lengthSq()
            const b = 3 * p.clone().sub(r).dot(r.clone().sub(q))
            const c = r.clone().multiplyScalar(3).addScaledVector(q, -2).sub(p)
                .dot(r.clone().sub(q))
            const d = -r.clone().sub(q).lengthSq()
            const t = solve_cubic_equation(a, b, c, d)
            bezier.push(
                q.clone()
                    .addScaledVector(r, -((1 - t) ** 2))
                    .addScaledVector(p, -(t ** 2))
                    .divideScalar(2 * (1 - t) * t)
            )
        }

        const n = this.numSteps
        let result = []

        const interval = Math.PI / 2 * (ctrlPoints.length - 1) / n
        for (let j = 0; j < n; ++j) {
            const i = Math.floor((interval * j) / (Math.PI / 2))
            const theta = (interval * j) % (Math.PI / 2)
            const normalized_theta = theta / Math.PI

            const a1 = new Vector2()
            if (i > 0)
                a1
                    .addScaledVector(bezier[i], normalized_theta + 0.5)
                    .addScaledVector(ctrlPoints[i - 1], 0.5 - normalized_theta)
            const a2 = new Vector2()
                .addScaledVector(ctrlPoints[i + 1], normalized_theta + 0.5)
                .addScaledVector(bezier[i], 0.5 - normalized_theta)
            const b1 = new Vector2()
                .addScaledVector(a2, normalized_theta + 0.5)
                .addScaledVector(a1, 0.5 - normalized_theta)

            const a3 = new Vector2()
            if (i < ctrlPoints.length - 2)
                a3
                    .addScaledVector(bezier[i + 1], normalized_theta)
                    .addScaledVector(ctrlPoints[i], 1 - normalized_theta)
            const a4 = new Vector2()
            if (i < ctrlPoints.length - 2)
                a4
                    .addScaledVector(ctrlPoints[i + 2], normalized_theta)
                    .addScaledVector(bezier[i + 1], 1 - normalized_theta)
            const b2 = new Vector2()
                .addScaledVector(a4, normalized_theta)
                .addScaledVector(a3, 1 - normalized_theta)
            const c = new Vector2()
                .addScaledVector(b1, Math.cos(theta) ** 2)
                .addScaledVector(b2, Math.sin(theta) ** 2)

            if (i == 0) {
                result.push(b2.x)
                result.push(b2.y)
            } else if (i == ctrlPoints.length - 2) {
                result.push(b1.x)
                result.push(b1.y)
            } else {
                result.push(c.x)
                result.push(c.y)
            }
            result.push(0.)
        }

        const last = ctrlPoints.pop()!
        result.push(last.x)
        result.push(last.y)
        result.push(0.)
        return new Float32Array(result)
    }

    protected spline(ctrlPoints: Readonly<BufferAttribute>): Float32Array {
        let ctrl_v = []
        for (let i = 0; i < ctrlPoints.count; ++i) {
            const x = ctrlPoints.getX(i)
            const y = ctrlPoints.getY(i)
            ctrl_v.push(new Vector2(x, y))
        }

        if (this.splineKind == "bezier") {
            return this.bezier(ctrl_v)
        } else if (this.splineKind == "catmull") {
            return this.catmull_rom(ctrl_v)
        } else {
            return this.c2_interpolation(ctrl_v)
        }
    }

    setNumSteps(n: number) {
        this.numSteps = n
        this.needsUpdate = true
    }

    setSplineMethod(splineKind: string, knotKind: string) {
        this.splineKind = splineKind
        this.knotKind = knotKind
        this.needsUpdate = true
    }
}

const cvs = new SplineCanvasEx()
cvs.animate();
(globalThis as any).cvs = cvs  // export

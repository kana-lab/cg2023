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

class SplineCanvasEx extends SplineCanvas {
    /*
    private bezier(ctrlPoints: Vector2[]): Float32Array {
        const n = 15
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
     */

    private catmull_rom(ctrlPoints: Vector2[]): Float32Array {
        const n = 30
        let result = []

        let knot = [0.]
        for (let i = 1; i < ctrlPoints.length; ++i) {
            // uniform
            // knot.push(i)

            // chordal
            // const dist = ctrlPoints[i - 1].distanceTo(ctrlPoints[i])
            // knot.push(knot[i - 1] + dist)

            // centripetal
            const dist = ctrlPoints[i - 1].distanceTo(ctrlPoints[i])
            knot.push(knot[i - 1] + dist ** 0.5)
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

    protected spline(ctrlPoints: Readonly<BufferAttribute>): Float32Array {
        let ctrl_v = []
        for (let i = 0; i < ctrlPoints.count; ++i) {
            const x = ctrlPoints.getX(i)
            const y = ctrlPoints.getY(i)
            ctrl_v.push(new Vector2(x, y))
        }

        // return this.bezier(ctrl_v)
        return this.catmull_rom(ctrl_v)
    }
}

const cvs = new SplineCanvasEx()
cvs.animate()

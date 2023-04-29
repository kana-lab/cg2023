import './style.css'
import {SplineCanvas} from "./spline_canvas";
import {BufferAttribute, Vector2} from "three";

// const cvs = new SplineCanvas()
// cvs.animate()


class SplineCanvasEx extends SplineCanvas {
    protected spline(ctrlPoints: Readonly<BufferAttribute>): Float32Array {
        const n = 15

        let ctrl_v = []
        for (let i = 0; i < ctrlPoints.count; ++i) {
            const x = ctrlPoints.getX(i)
            const y = ctrlPoints.getY(i)
            ctrl_v.push(new Vector2(x, y))
        }

        let result = []

        // bezier curve (n dim)
        // de Casteljau's algorithm
        for (let i = 0; i < n; ++i) {
            const t = i / n

            let div_point = []
            for (const elt of ctrl_v) {
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

        result.push(ctrlPoints.getX(ctrlPoints.count - 1))
        result.push(ctrlPoints.getY(ctrlPoints.count - 1))
        result.push(0.)
        return new Float32Array(result)
    }
}

const cvs = new SplineCanvasEx()
cvs.animate()

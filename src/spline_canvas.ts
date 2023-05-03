import {
    BufferAttribute,
    BufferGeometry,
    Line,
    LineBasicMaterial,
    Matrix3,
    Points,
    PointsMaterial,
    Vector2,
} from "three";
import {DraggableGridCanvas} from "./core/draggable_canvas";


export class SplineCanvas extends DraggableGridCanvas {
    ctrlGeometry: BufferGeometry
    needsUpdate: boolean
    sampleGeometry: BufferGeometry
    draggingPoint: number | null

    constructor() {
        super('#main-canvas');

        this.needsUpdate = true
        this.draggingPoint = null

        // 制御点の初期位置を指定
        this.ctrlGeometry = new BufferGeometry()
        this.setNumCtrlPoints(5)

        // 制御点をシーンに追加
        const ctrlMaterial = new PointsMaterial({
            color: 0x0000ff,
            size: 10,
        })
        const ctrls = new Points(this.ctrlGeometry, ctrlMaterial)
        this.scene.add(ctrls)

        // 制御点間をつなぐ直線
        const ctrlLineMaterial = new LineBasicMaterial({color: 0x0000ff})
        const ctrlLine = new Line(this.ctrlGeometry, ctrlLineMaterial)
        this.scene.add(ctrlLine)

        // スプラインのサンプル点をシーンに追加
        this.sampleGeometry = new BufferGeometry()
        const position = this.ctrlGeometry.getAttribute('position') as BufferAttribute
        const buf = new BufferAttribute(this.spline(position), 3)
        this.sampleGeometry.setAttribute('position', buf)

        const sampleMaterial = new PointsMaterial({
            color: 0xffff00,
            size: 10
        })
        const samples = new Points(this.sampleGeometry, sampleMaterial)
        this.scene.add(samples)

        // スプラインのサンプル点をつなぐ直線
        const sampleLineMaterial = new LineBasicMaterial({color: 0xffff00})
        const sampleLine = new Line(this.sampleGeometry, sampleLineMaterial)
        this.scene.add(sampleLine)
    }

    protected onDragStart(mouse: Vector2) {
        const position = this.ctrlGeometry.attributes.position as BufferAttribute

        let [nearestIdx, minDistance] = [0, Infinity]
        for (let i = 0; i < position.count; ++i) {
            const dist = ((mouse.x - position.getX(i)) ** 2 + (mouse.y - position.getY(i)) ** 2) ** 0.5
            if (dist < minDistance) {
                minDistance = dist
                nearestIdx = i
            }
        }

        this.draggingPoint = nearestIdx
    }

    protected onDragEnd(_mouse: Vector2) {
        this.draggingPoint = null
    }

    protected onDrag(mouse: Vector2) {
        if (this.draggingPoint == null) return
        const position = this.ctrlGeometry.attributes.position as BufferAttribute
        position.setX(this.draggingPoint, mouse.x)
        position.setY(this.draggingPoint, mouse.y)
        position.needsUpdate = true
        this.needsUpdate = true
    }

    protected spline(ctrlPoints: Readonly<BufferAttribute>): Float32Array {
        const last = ctrlPoints.count - 1
        const x0 = ctrlPoints.getX(0)
        const y0 = ctrlPoints.getY(0)
        const x2 = ctrlPoints.getX(last)
        const y2 = ctrlPoints.getY(last)
        return new Float32Array([
            x0, y0, 0,
            (x0 + x2) / 2, (y0 + y2) / 2, 0,
            x2, y2, 0,
        ])
    }

    update() {
        super.update()
        if (this.needsUpdate) {
            const position = this.ctrlGeometry.getAttribute('position') as BufferAttribute
            const buf = new BufferAttribute(this.spline(position), 3)
            this.sampleGeometry.setAttribute('position', buf)
            this.needsUpdate = false
        }
    }

    setNumCtrlPoints(numCtrlPoints: number) {
        let vertices = []

        const rotMat = new Matrix3().set(
            Math.cos(Math.PI / 4), Math.sin(Math.PI / 4), 0,
            -Math.sin(Math.PI / 4), Math.cos(Math.PI / 4), 0,
            0, 0, 1
        )
        for (let i = 0; i < numCtrlPoints; ++i) {
            const theta = Math.PI / (numCtrlPoints - 1) * i
            const v = new Vector2(
                3 * Math.cos(theta),
                1.5 * Math.sin(theta) * (i % 2 == 0 ? 1 : 1.5)
            ).applyMatrix3(rotMat)
            vertices.push(v.x)
            vertices.push(v.y)
            vertices.push(0)
        }

        const buf = new BufferAttribute(new Float32Array(vertices), 3)
        this.ctrlGeometry.setAttribute('position', buf)
        this.ctrlGeometry.getAttribute('position').needsUpdate = true

        this.needsUpdate = true
    }
}

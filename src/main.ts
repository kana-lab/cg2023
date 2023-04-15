import './style.css'
import {
    BufferAttribute, BufferGeometry, Line, LineBasicMaterial,
    Points, PointsMaterial, Vector2,
} from "three";
import {DraggableGridCanvas} from "./canvas/draggable_grid_canvas";


class SplineCanvas extends DraggableGridCanvas {
    points: BufferAttribute
    line: Line

    constructor() {
        super('#main-canvas');

        // 制御点の初期位置を指定
        const pointsGeometry = new BufferGeometry()
        const vertices = new Float32Array([
            -3, 3, 0,
            1, 1, 0,
            3, -3, 0,
        ])
        this.points = new BufferAttribute(vertices, 3)
        pointsGeometry.setAttribute('position', this.points)

        // 制御点をシーンに追加
        const pointsMaterial = new PointsMaterial({
            color: 0x0000ff,
            size: 10,
        })
        const points = new Points(pointsGeometry, pointsMaterial)
        this.scene.add(points)

        // 制御点間をつなぐ直線
        const lineMaterial = new LineBasicMaterial({color: 0x0000ff})
        this.line = new Line(pointsGeometry, lineMaterial)
        this.scene.add(this.line)
    }

    update() {
    }

    onDrag(mouse: Vector2) {
        this.points.setX(1, mouse.x)
        this.points.setY(1, mouse.y)
        this.points.needsUpdate = true
    }
}

const cvs = new SplineCanvas()
cvs.animate()

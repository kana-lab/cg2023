import {Canvas} from "./canvas";
import {GridHelper, Vector2} from "three";

export class DraggableCanvas extends Canvas {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas, false);

        const getMousePos = (event: MouseEvent): Vector2 => {
            const x = (event.clientX - canvas.offsetLeft) / canvas.offsetWidth * 2 - 1
            const y = -(event.clientY - canvas.offsetTop) / canvas.offsetHeight * 2 + 1
            const mouse = new Vector2(x * 5, y * 5 * canvas.offsetHeight / canvas.offsetWidth);
            const delta3 = this.controls.object.position
            const delta2 = new Vector2(delta3.x, delta3.y)
            return mouse.divideScalar(this.camera.zoom).add(delta2)
        }

        // ドラッグの開始・修了を検知 (shiftが押されている場合を除く)
        let now_dragging = false
        let shift_key = false
        canvas.addEventListener('mousedown', (event) => {
            if (shift_key) return
            now_dragging = true
            this.onDragStart(getMousePos(event))
        })
        canvas.addEventListener('mouseup', (event) => {
            if (shift_key) return
            now_dragging = false
            this.onDragEnd(getMousePos(event))
        })
        window.addEventListener('keydown', (event) => {
            if (event.shiftKey && !now_dragging)
                shift_key = true
        })
        window.addEventListener('keyup', (event) => {
            if (event.key == 'Shift')
                shift_key = false
        })

        // ドラッグ中ならマウス座標をコールバックに渡す
        canvas.addEventListener('mousemove', (event: MouseEvent) => {
            if (now_dragging) {
                this.onDrag(getMousePos(event))
            }
        })
    }

    protected onDrag(_mouse: Vector2): void {
    }

    protected onDragStart(_mouse: Vector2): void {
    }

    protected onDragEnd(_mouse: Vector2): void {
    }
}

export class DraggableGridCanvas extends DraggableCanvas {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        // グリッドをSceneに追加
        const gridHelper = new GridHelper(100, 100, 0x880000)
        gridHelper.rotation.x = Math.PI / 2
        this.scene.add(gridHelper)
    }
}

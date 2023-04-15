import {Canvas} from "./canvas";
import {GridHelper, Vector2} from "three";

export class DraggableCanvas extends Canvas {
    protected constructor(canvasQuery: string) {
        super(canvasQuery, false);

        // super()中でエラー処理が行われるので、ここではエラー処理は不要
        const canvas = document.querySelector<HTMLElement>(canvasQuery)!

        const getMousePos = (event: MouseEvent): Vector2 => {
            const x = (event.clientX - canvas.offsetLeft) / canvas.offsetWidth * 2 - 1
            const y = -(event.clientY - canvas.offsetTop) / canvas.offsetHeight * 2 + 1
            return new Vector2(x * 5, y * 5);
        }

        // ドラッグの開始・修了を検知
        let now_dragging = false
        canvas.addEventListener('mousedown', (event) => {
            now_dragging = true
            this.onDragStart(getMousePos(event))
        })
        canvas.addEventListener('mouseup', (event) => {
            now_dragging = false
            this.onDragEnd(getMousePos(event))
        })

        // ドラッグ中ならマウス座標をコールバックに渡す
        canvas.addEventListener('mousemove', (event: MouseEvent) => {
            if (now_dragging) {
                this.onDrag(getMousePos(event))
            }
        })
    }

    onDrag(_mouse: Vector2): void {
    }

    onDragStart(_mouse: Vector2): void {
    }

    onDragEnd(_mouse: Vector2): void {
    }
}

export class DraggableGridCanvas extends DraggableCanvas {
    constructor(canvasQuery: string) {
        super(canvasQuery);

        // グリッドをSceneに追加
        const gridHelper = new GridHelper(100, 100, 0x880000)
        gridHelper.rotation.x = Math.PI / 2
        this.scene.add(gridHelper)
    }
}

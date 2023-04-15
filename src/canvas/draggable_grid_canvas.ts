import {Canvas} from "./canvas";
import {GridHelper, Vector2} from "three";

export abstract class DraggableGridCanvas extends Canvas {
    protected constructor(canvasQuery: string) {
        super(canvasQuery, false);

        // グリッドをSceneに追加
        const gridHelper = new GridHelper(100, 100, 0x880000)
        gridHelper.rotation.x = Math.PI / 2
        this.scene.add(gridHelper)

        // super()中でエラー処理が行われるので、ここではエラー処理は不要
        const canvas = document.querySelector<HTMLElement>(canvasQuery)!

        // ドラッグの開始・修了を検知
        let now_dragging = false
        canvas.addEventListener('mousedown', (_e) => {
            now_dragging = true
        })
        canvas.addEventListener('mouseup', (_e) => {
            now_dragging = false
        })

        // ドラッグ中ならマウス座標をコールバックに渡す
        canvas.addEventListener('mousemove', (event: MouseEvent) => {
            if (now_dragging) {
                const x = (event.clientX - canvas.offsetLeft) / canvas.offsetWidth * 2 - 1
                const y = -(event.clientY - canvas.offsetTop) / canvas.offsetHeight * 2 + 1
                const mouse = new Vector2(x * 5, y * 5)
                this.onDrag(mouse)
            }
        })
    }

    abstract onDrag(mouse: Vector2): void;
}

import {
    OrthographicCamera, Scene, WebGLRenderer,
} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";


export class Canvas {
    renderer: WebGLRenderer
    camera: OrthographicCamera
    scene: Scene
    controls: OrbitControls

    constructor(enableRotate = true) {
        // カメラの設定
        const near = 0.1
        const far = 1000
        this.camera = new OrthographicCamera(
            -5, 5, 5, -5, near, far
        )
        this.camera.position.set(0, 0, 100)

        // シーンの設定
        this.scene = new Scene()

        // レンダラーの設定
        const canvas = document.querySelector<HTMLElement>('#main-canvas')!
        this.renderer = new WebGLRenderer({
            canvas,
            // antialias: true,
            // alpha: true,
        })
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)

        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enableRotate = enableRotate
    }

    update() {
    }

    animate() {
        const r = () => {
            requestAnimationFrame(r)
            this.controls.update()
            this.update()
            this.renderer.render(this.scene, this.camera)
        }

        r()
    }
}
import './style.css'
import {Canvas} from './canvas'
import {GridHelper, Mesh, MeshBasicMaterial, PlaneGeometry} from "three";

class ExampleCanvas extends Canvas {
    mesh: Mesh

    constructor() {
        super(false);

        const geometry = new PlaneGeometry(5, 5, 5, 5)
        const material = new MeshBasicMaterial({
            color: 0xff00ff, wireframe: true
        })
        this.mesh = new Mesh(geometry, material)
        this.scene.add(this.mesh)

        const gridHelper = new GridHelper(100, 100, 0x880000)
        gridHelper.rotation.x = Math.PI / 2
        this.scene.add(gridHelper)
    }

    update() {
        this.mesh.rotation.x += 0.01
        this.mesh.rotation.y += 0.01
    }
}

const cvs = new ExampleCanvas()
cvs.animate()

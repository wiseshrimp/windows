class App {
    constructor() {
        this.setupSockets()
        this.setupScene()
    }

    addTestCube = () => {
        let geometry = new THREE.BoxGeometry(1, 1, 1)
        var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        var cube = new THREE.Mesh( geometry, material );
        this.scene.add(cube)
    }

    setupCamera = () => {
        this.camera = new THREE.PerspectiveCamera(
            this.fov,
            this.aspect,
            this.near,
            this.far
        )
        this.camera.position.z = 3
    }

    setupLighting = () => {
        let color = 0xFFFFFF
        let intensity = 1
        let light = this.light = new THREE.DirectionalLight(color, intensity)
        light.position.set(-1, 2, 4)
        this.scene.add(light)
    }

    setupScene = () => {
        this.scene = new THREE.Scene()
        let canvas = this.canvasEl = document.getElementById('canvas')
        this.renderer = new THREE.WebGLRenderer({
            canvas
        })
        this.renderer.shadowMap.enabled = true
        this.raycaster = new THREE.Raycaster()
        this.fov = 75
        this.aspect = 2 // Canvas default
        this.near = 0.1
        this.far = 100

        this.setupCamera()
        this.setupLighting()

        this.addTestCube()

        this.render()
    }

    setupSockets = () => {
        this.socket = io()
    }
    
    render = time => {        
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.render)
      }

}

let app = new App()
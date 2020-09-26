class App {
    constructor() {
        this.setupSockets()
        this.setupScene()
        this.loadObjects()
        this.addWindowImage()
        this.addWall()

        this.addEventListeners()
    }

    addEventListeners = () => {
        document.getElementById('loadThree').addEventListener('click', ev => {
            document.getElementById('clouds').style.display = 'none'
            document.getElementById('main').style.display = 'none'
            this.canvasEl.style.display = 'block'
        })
    }

    addTestCube = () => {
        let geometry = new THREE.BoxGeometry(1, 1, 1)
        let material = new THREE.MeshBasicMaterial( {color: 0x00ff00} )
        let cube = new THREE.Mesh( geometry, material )
        this.scene.add(cube)
    }
    
    addWall = () => {
        let geometry = new THREE.PlaneGeometry(100, 30, 0.1)
        let material = new THREE.MeshBasicMaterial( {color: 0x00ff00} )
        let wall = new THREE.Mesh(geometry, material)
        wall.position.set(0, 0, -11)
        this.scene.add(wall)
        
    }

    addWindowImage = () => {
        this.textureLoader = new THREE.TextureLoader()
        let texture = this.textureLoader.load('test.png')
        let geometry = new THREE.PlaneGeometry(4, 7, .01)
        let material = new THREE.MeshPhongMaterial( {map: texture} )
        let plane = new THREE.Mesh(geometry, material)
        // plane.scale.set(4, 7, .01)
        plane.position.set(0, 4.2, -10)
        this.scene.add(plane)
    }

    loadObjects = () => {
        this.objectLoader = new THREE.OBJLoader()
        this.objectLoader.load(
            './Window.obj',
            obj => {
                var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} )
                this.objectLoader.setMaterials(material)
                obj.scale.set(.005, .005, .005)
                obj.position.set(0, 0, -10)
                obj.castShadow = true
                this.scene.add(obj)
            },
            xhr => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
              },
            err => {
                console.log(err)
            }
        )
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
            canvas,
            alpha: true,
            antialias: true
        })
        this.renderer.setClearColor(0x010101, 0);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true
        this.raycaster = new THREE.Raycaster()
        this.fov = 75
        this.aspect = 2 // Canvas default
        this.near = 0.1
        this.far = 100

        this.setupCamera()
        this.setupLighting()

        // this.addTestCube()

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

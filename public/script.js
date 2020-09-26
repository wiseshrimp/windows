/*

TO DO:
- Connect db
- Setup controls
- Add image uploader to s3 & format image to be correct window ratio before saving
- Make wall/window look nice
- Fix text? Looks very blurry

*/


class App {
    constructor() {
        this.dots = []
        this.setupSockets()
        this.setupScene()
        this.loadObjects()
        this.addWindowImage()
        this.addWall()

        this.addEventListeners()
    }

    addEventListeners = () => {
        document.getElementById('loadThree').addEventListener('click', ev => { // Switching to threejs screen
            document.getElementById('clouds').style.display = 'none'
            document.getElementById('main').style.display = 'none'
            this.canvasEl.style.display = 'block'
            document.getElementById('bulletin').style.display = 'block'
            document.getElementById('canvas').addEventListener('mousemove', this.moveDot)
        })

        document.getElementById('bulletin').addEventListener('submit', ev => {
            let message = document.getElementById('bulletinText').value
            document.getElementById('bulletinText').value = '' // Clear bulletin input

            // Save message to image
            ev.preventDefault()
            let img = textToImage(message) // textToImage.js
            this.bulletinMsg = message
            document.getElementById('bulletinImg').src = img.src
            this.bulletinImg = img

            this.clientX = null
            this.clientY = null
            document.addEventListener('mousemove', this.onMouseMove)
            document.addEventListener('mousedown', this.onMouseDown)
        })

        window.addEventListener('resize', this.onWindowResize)
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
        plane.position.set(0, 4.2, -10)
        this.scene.add(plane)
    }

    loadObjects = () => {
        this.objectLoader = new THREE.OBJLoader()
        this.objectLoader.load(
            './Window.obj',
            obj => {
                var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ) // To change to wood material
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

    moveDot = ev => {
        var mouse = new THREE.Vector3()
        let pos = new THREE.Vector3()
        mouse.set(
            ( ev.clientX / window.innerWidth ) * 2 - 1,
            - ( ev.clientY / window.innerHeight ) * 2 + 1,
            -0.5
        )
        mouse.unproject(this.camera)
        mouse.sub(this.camera.position).normalize()
        let targetZ = -10
        let distance = ( targetZ - this.camera.position.z ) / mouse.z
        pos.copy(this.camera.position ).add(mouse.multiplyScalar( distance ) )
        this.dot = pos

        this.socket.emit('mousemove', {pos})

        // if (!this.dot) {
        //     this.dot = pos
        //     this.socket.emit('mousemove', {pos})
            
        //     // let geometry = new THREE.SphereGeometry(.2, .2, .2)
        //     // let color = new THREE.Color(0xffffff)
        //     // color.setHex(Math.random() * 0xffffff)
        //     // let material = new THREE.MeshBasicMaterial({color})
        //     // this.dot = new THREE.Mesh(geometry, material)
        //     // this.dot.position.set(pos.x, pos.y, -10)
        //     // this.scene.add(this.dot)
        // } else {
        //     this.dot = pos
        //     // this.dot.position.set(pos.x, pos.y, -10)
        // }
    }

    onDotSocket = data => {
        let didx = this.dots.findIndex(el => el.id === data.id)
        if (didx === -1) {
            let geometry = new THREE.SphereGeometry(.2, .2, .2)
            let color = new THREE.Color(0xffffff)
            color.setHex(Math.random() * 0xffffff)
            let material = new THREE.MeshBasicMaterial({color})
            let mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(data.pos.x, data.pos.y, -10)
            this.scene.add(mesh)
            this.dots.push({
                pos: data.pos,
                id: data.id,
                mesh
            })
        } else {
            this.dots[didx].mesh.position.set(data.pos.x, data.pos.y, -10)
            this.dots[didx].pos = data.pos
        }
    }

    onMouseDown = ev => {
        ev.preventDefault()
        this.clientX = null
        this.clientY = null
        document.getElementById('bulletinImg').style.display = 'none'
        document.removeEventListener('mousemove', this.onMouseMove)
        document.removeEventListener('mousedown', this.onMouseDown)

        this.textureLoader = new THREE.TextureLoader()
        let texture = this.textureLoader.load(this.bulletinImg.src)
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
        let geometry = new THREE.PlaneGeometry(7, 5, .01)
        let material = new THREE.MeshPhongMaterial( {map: texture} )
        // material.map.magFilter = THREE.LinearFilter // To do: Filter to make text clearer

        let plane = new THREE.Mesh(geometry, material)

        // 2d => 3d coords
        var mouse = new THREE.Vector3()
        let pos = new THREE.Vector3()
        mouse.set(
            ( ev.clientX / window.innerWidth ) * 2 - 1,
            - ( ev.clientY / window.innerHeight ) * 2 + 1,
            -0.5
        )
        mouse.unproject(this.camera)
        mouse.sub(this.camera.position).normalize()
        let targetZ = -10
        let distance = ( targetZ - this.camera.position.z ) / mouse.z
        pos.copy(this.camera.position ).add(mouse.multiplyScalar( distance ) )
        plane.position.set(pos.x, pos.y, -10)
        this.scene.add(plane)
        
        // Send message & coordinates
        this.socket.emit('message', {
            position: [pos.x, pos.y, -10],
            message: this.bulletinMsg
        })
    }

    onMouseMove = ev => {
        ev.preventDefault()

        if (!this.clientX) {
            document.getElementById('bulletinImg').style.top = `${ev.clientY}px`
            document.getElementById('bulletinImg').style.left = `${ev.clientX}px`
            this.clientX = ev.clientX
            this.clientY = ev.clientY
            document.getElementById('bulletinImg').style.display = 'block'

        } else {
            document.getElementById('bulletinImg').style.transform = `translate(${ev.clientX - this.clientX}px, ${ev.clientY - this.clientY}px)`
        }
    }

    onNewMessage = () => {

    }

    onWindowResize = ev => {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize( window.innerWidth, window.innerHeight )
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
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true
        this.raycaster = new THREE.Raycaster()
        this.fov = 75
        this.aspect = 2 // Canvas default
        this.near = 0.1
        this.far = 100

        this.setupCamera()
        this.setupLighting()
        this.render()
    }

    setupSockets = () => {
        this.socket = io()

        this.socket.on('mousemove', this.onDotSocket)
        this.socket.on('newMessage', this.onNewMessage)
    }
    
    render = time => {        
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.render)
      }

}

let app = new App()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
require('dotenv').config()

class Server {
  constructor() {
    // Set up express server and socket
    this.app = express()
    this.http = require('http').createServer(this.app)
    this.io = require('socket.io')(this.http)
  
    // Set up MongoDB Client
    const MongoClient = require('mongodb').MongoClient
    const uri = process.env.MONGO_URI
    this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  }

  register = () => {
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(express.static(path.join(__dirname, 'public')))
    this.app.use(cors())
    this.app.get('/', (req, res) => {
      res.sendFile(__dirname + '/index.html')
    })

    let upload = multer({ dest: path.join(__dirname, 'temp')})
    this.app.post('/upload', upload.single('image'), (req, res) => {
      if (req.file && req.file.mimetype == 'image/jpeg' && req.file.size < 2000000) { // limit size to 2mb for now
        let image = fs.readFileSync(req.file.path, { encoding: 'base64' })
        const data = {
          timestamp: new Date(),
          content: image,
          name: req.file.originalname
        }
        this.saveToDatabase('images', data)
      }
    })
    
    this.io.on('connection', (socket) => {
      console.log('a user connected')
    
      this.readDatabaseCollection('images').then((images) => {
        console.log(images.length)
        socket.emit('loadWindows', images)
      })
    
      socket.on('disconnect', () => {
        console.log('user disconnected')
      })
    
      socket.on('mousemove', (data) => {
        socket.broadcast.emit('mousemove', {
          id: socket.id, 
          pos: data.pos
        })
      })
    
      socket.on('message', (bulletin) => {
        console.log(bulletin) // {position: [x, y, z], message: ''}
        this.saveToDatabase('bulletin', bulletin)
        
        // Broadcast new message to all other socket clients
        socket.broadcast.emit('newMessage', bulletin)
      })
    })
  }

  readDatabaseCollection = async (collection) => {
    let result = []
    try {
      let cursor = this.client.db('windows').collection(collection).find({})
      result = await cursor.toArray()
    } catch (err) {
      console.error('ReadDatabaseError: ', err)
    } finally {
      return result
    }
  }

  saveToDatabase = async (collection, data) => {
    try {
      await this.client.db('windows').collection(collection).insertOne(data)
    } catch (err) {
      console.error('SaveDatabaseError: ', err)
    }
  }

  run = async () => {
    try {
      await this.client.connect()
      this.register()
      this.http.listen(3000, function(){
        console.log('listening on *:3000')
      })
    } catch (err) {
      console.error('Error running server: ', err)
      await this.client.close()
    }
  }
}

(new Server()).run()

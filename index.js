
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

// Set up express server and socket
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// Set upu MongoDB Client
const MongoClient = require('mongodb').MongoClient
const uri = "mongodb+srv://windows-admin:7foqErRNOpKyc0Mu@cluster0.kbpyb.mongodb.net/windows?retryWrites=true&w=majority"
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

async function uploadImage() {
  try {
    await client.connect()

    // let image = fs.readFileSync('/Users/katiehan/Downloads/test.jpg', { encoding: 'base64' })
    // const document = {
    //   timestamp: new Date(),
    //   content: image,
    //   name: 'test.jpg'
    // }
    // await client.db('windows').collection('images').insertOne(document)

    let cursor = client.db('windows').collection('images').find({})
    let result = await cursor.toArray()
    // console.log(result)
    fs.writeFileSync(path.join(__dirname, result[0].name), result[0].content, { encoding: 'base64' })
  } catch (err) {
    console.error(err)
  } finally {
    await client.close()
  }
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', function(socket) {
  console.log('a user connected')

  socket.on('disconnect', function() {
      console.log('user disconnected')
  })

  socket.on('mousemove', (data, id) => {
    socket.broadcast.emit('mousemove', {
      id: socket.id, 
      pos: data.pos
    })
  })

  socket.on('message', function(bulletin) {
    console.log(bulletin) // {position: [x, y, z], message: ''}
    saveToDatabase('bulletin', bulletin)
    
    // Broadcast new message to all other socket clients
    socket.broadcast.emit('newMessage', bulletin)
  })

})
  
http.listen(3000, function(){
  console.log('listening on *:3000')
})

async function saveToDatabase(collection, data) {
      try {
        await client.connect()
        await client.db('windows').collection(collection).insertOne(data)
      } catch (err) {
        console.error(err)
      } finally {
        await client.close()
      }
}
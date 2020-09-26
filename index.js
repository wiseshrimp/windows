
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const app = express()
var http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', function(socket){
  console.log('a user connected')
  socket.on('disconnect', function(){
      console.log('user disconnected')
  })
  socket.on('mousemove', (data, id) => {
    socket.broadcast.emit('mousemove', {
      id: socket.id, 
      pos: data.pos
    })
  })
  socket.on('message', function(msg){
      console.log(msg) // {position: [x, y, z], message: ''}

      // To do: save message to db
  })
})
  
http.listen(3000, function(){
  console.log('listening on *:3000')
})

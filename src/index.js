const path=require('path')
const express=require('express')
const http = require('http')
const socketio= require("socket.io");
const Filter=require('bad-words')
const {generateMessage}=require('./utils/messages')
const {generateLocationMessage}=require('./utils/locations')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')
const app=express()
const server = http.createServer(app);
const io= socketio(server)

const port=process.env.PORT || 3000
const publicDirectPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectPath))

io.on('connection', (socket) => {
    console.log('New websocket connection')

    
    socket.on('join',(options,callback)=>{
      const{user,error}=addUser({id: socket.id,...options})
      if(error)
      {
        return callback(error)
      } 
      socket.join(user.room)
      socket.emit('message',generateMessage('Auto System','Welcome!'))
      socket.broadcast.to(user.room).emit('message',generateMessage('Auto System',`${user.username} has joined`))
      io.to(user.room).emit('roomData',{
          room: user.room,
          users: getUsersInRoom(user.room)
      })
    })

    socket.on('sendMessage',(message,callback)=>{
      const user=getUser(socket.id)
      const filter=new Filter()
      if(filter.isProfane(message))
      {
        return callback('Profanity is not allowed')
      }
      io.to(user.room).emit('message',generateMessage(user.username,message)) 
      callback('Delivered message')
    })

    socket.on('sendLocation',(coords, callback)=>{
      const user=getUser(socket.id)
      io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitute},${coords.longitute}`))
      callback('Location shared')
    })

    socket.on('disconnect',()=>{
      const user=removeUser(socket.id)
      if(user)
      {
        io.to(user.room).emit('message',generateMessage('Auto System',`${user.username} has left`))
        io.to(user.room).emit('roomData',{
          room: user.room,
          users: getUsersInRoom(user.room)
        })
      }
    })
    
});
server.listen(port, ()=>{
    console.log('Server is on port '+port)
})
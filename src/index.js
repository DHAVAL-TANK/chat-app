const express= require('express');
const path = require('path')
const http = require('http')
const socketio =  require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages') 
const {addUser,getUsersInRoom,getUser,removeUser} = require('./utils/users')

const app = express();
const server =  http.createServer(app)
const io = socketio(server)



const PORT =  process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('New Connection Established')

    socket.on('join',({username,room},callback)=>{
       const {error, user} = addUser({id:socket.id ,username,room})

       if(error){
          return  callback(error)
       }
       //only use in server side. 
        socket.join(user.room)

        //socket.emit , io.emit , socket.boardcast.emit
        //socket.to().emit , socket.boardcast.to().emit

        socket.emit('message',generateMessage("Admin","welcome to the chat App"))
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin",`${user.username} has joined the chat`))

        io.to(user.room).emit("roomData",{
            'room': user.room,
            'users': getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const filter= new Filter();

        if(filter.isProfane(message)){
            return callback("Profinity is not allowed")
        }

        const user = getUser(socket.id)

        if(!user) {
            return callback('User Not Found')
        }

        io.to(user.room).emit('message',generateMessage(user.username,message));
        callback("Message Delivered")
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)

        if(!user) {
            return callback('User Not Found')
        }

        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,coords))
        callback()
    })

    socket.on('disconnect',()=>{
       const user = removeUser(socket.id)

       if(user) {
        socket.broadcast.to(user.room).emit('message',generateMessage("Admin" ,`${user.username} has left the chat`))
        io.to(user.room).emit("roomData",{
            'room': user.room,
            'users': getUsersInRoom(user.room)
        })
       }
      
    })

})

server.listen(PORT,()=>{
    console.log(" Serve is running at port : ",PORT)
})


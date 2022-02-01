const users = []

//addUser , removeUser ,getuser , getUsersInRoom

const addUser = ({id,username,room})=>{

    //clean the data
        username = username.trim().toLowerCase()
        room = room.trim().toLowerCase()
         
    // validate the data
        if(!username  || !room){
            return {
                'error' : "Username and Room are required !"
            }
        }

     //check for existing user
     
     const existingUser =  users.find((user)=>{
         return room=== user.room && username === user.username
     })

     if(existingUser){
         return{
             "error": "User name is in use !"
         }
     }

     //store user

     const user =  {id,username,room}
     users.push(user)

     return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>user.id === id)
  
    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id) =>{
    return users.find((user)=>user.id === id )
}

const getUsersInRoom = (room)=>{
    return  users.filter(user=> user.room === room )
}

module.exports = { addUser, removeUser , getUser , getUsersInRoom}
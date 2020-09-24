const express= require('express');
const socketio=require('socket.io')
const http=require('http');
const router=require('./router');


const PORT= process.env.PORT || 5000;
var app=express();

const server =http.createServer(app);

const io=socketio(server);

app.use(router)

let onlineUsers=new Map();

//New Connection
io.on('connection',(socket)=>{
    
    console.log(`New User connected on ${socket.id}`)
    //Disconnect event
    socket.on('disconnect',()=>{
        console.log(`User disconnected ${socket.id}`)
        
        const user=onlineUsers.get(socket.id);
        if(user)
        {
            onlineUsers.delete(socket.id);
            let adminmsg=`${user.name} has left the chat`;
            const messageObject={
                message:adminmsg,
                room:user.room,
                from:'admin',
                socket:socket.id
            }
            socket.to(user.room).emit('message',messageObject);
            io.to(user.room).emit('users',{online:getOnlineRoom(user.room)})
           
        }
       
    })
  //  io.emit('users',{online:getOnlineRoom('all')})
    //Join event fired by client
    socket.on('join',({name,rid})=>{
       
        if(checkUserExists(name))
        {
            socket.emit('error-join',{error:"User exists"});
            return ;
        }
           
        //trying to join to room
        socket.join(rid,(error)=>{
            if(error)
                io.to(socket.id).emit('error',{error:error});
            else
                {
                    onlineUsers.set(socket.id,{sid:socket.id,name:name,room:rid});
                    socket.emit('join-success',{sid:socket.id,name:name,room:rid});
                    io.to(rid).emit('users',{online:getOnlineRoom(rid)})
                    console.log(`${name} joined in ${rid}`);
                    let adminmsg=`${name} has joined the chat`;
                    const messageObject={
                        message:adminmsg,
                        room:rid,
                        from:'admin',
                        socket:socket.id
                    }
                    socket.to(rid).emit('message',messageObject);
                    
                }
        })
    })
    socket.on('sendMessage',(socketid,rid,message,callback)=>{
        const user=onlineUsers.get(socketid);
        if(user)
        {
            const{name} =user;
            const messageObject={
                message:message,
                room:rid,
                from:name,
                socket:socketid
            }
            io.to(rid).emit('message',messageObject);
            socket.emit('sendMessage-response',{success:true,status:"success"})
            return;
        }
        socket.emit('sendMessage-response',{success:false,status:"you are offline"})
        return ;
    })
})

function checkUserExists(username){

    for (let value of onlineUsers.values()) {
        if(value.name===username)
            return true;
      }
    return false;
}
function getOnlineRoom(room){

    if(room==='all')
     return [...onlineUsers.values()];
    let users=[];
    for (let value of onlineUsers.values()) {
        if(value.room===room)
            users.push(value);
      }
    return users;
}
/*
io.on('connect',(socket)=>{
    console.log(`New User connected on ${socket.id}`)
    socket.on('disconnect',()=>{
        console.log(`User disconnected ${socket.id}`)
        
    })
    socket.on('join',({name,rid},callback)=>{
        
        const{error,user}= addUser({id:socket.id,name:name,rid:rid});

        if(error) return callback({status:error});
        socket.join(user.rid,(err)=>{
            if(err)return callback(error);
            socket.emit('message',{user:'admin', text:`Hello ${user.name}, Welcome to the room ${user.rid}`});
            socket.broadcast.to(user.rid).emit('message',{user:'admin', text:` ${user.name} has joined the room!`});
            console.log(`${user.name} joined the room ${user.rid}`)
        });
        callback({status:"success"});
       
    })
    socket.on('sendMessage',(rid,message,callback)=>{
        console.log(`searching for ${socket.id}`);
        console.log(getallUsers());
        socket.broadcast.to(rid).emit('message',{user:user.name,text:message});
        callback();
    })
})
*/
server.listen(PORT,()=>{console.log(`Server has started listening on PORT:${PORT}`)})
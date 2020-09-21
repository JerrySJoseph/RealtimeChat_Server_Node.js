const users=[];

const addUser=({id,name,rid})=>{
 name=name.trim().toLowerCase();
 rid=rid.trim().toLowerCase();
 
 const userExists=users.find((user)=>user.rid===rid && user.name===name);
 if(userExists)
 {
     return {error:'Username is taken'}
 }
 const user={id,name,rid};
 console.log("Before push");
 console.log(user);
 users.push(user);
 console.log(users)
 return {user};
}

const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id);
    if(index!==-1)
    {
        return users.splice(index,1)[0];
    }
}

const getUser=(id)=> users.find(user=>user.id===id);


const getUsersinRoom=(room)=>users.filter(user=>user.rid===room);

const getallUsers=()=>users;

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersinRoom,
    getallUsers
}
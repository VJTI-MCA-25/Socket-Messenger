// Client side
const socket=io()

const form = document.getElementById("form");
const msgInpBar =  document.getElementById("msg-inp");
const joinBtn= document.getElementById("room-btn");

// Listen for 'user-connected' event from the server
 socket.on('user-connected', (userId) => {
    // Display the connected user's ID
    const messageContainer = document.getElementById('message-box');
    const div = document.createElement('span');
    div.innerHTML= `User <b>${userId}</b> is connected`;
    messageContainer.append(div)
  });

// msg got from server , it will broadcast to all clients
socket.on('message',message=>{
    console.log("Got from backend : "+message)
    createMsgDivs(message);
})

socket.on('disconnect',()=> {
    console.log("disconnecting client");
});

form.addEventListener("submit",function SubmitHandler(event){
    event.preventDefault();
    let user_msg=msgInpBar.value;
    // sends the msg to server as event user-msg
    socket.emit("user-msg" , user_msg);  
    msgInpBar.value="";
})

joinBtn.addEventListener("click",function JoinRoom() {

    let SingleDiv = document.getElementById("message-box");
    
    let roomVal=document.getElementById("room-inp");
    let show = `User has joined room : ${roomVal.value}`; 
   
    let Linebreak = document.createElement('br');
    
    // add the content
    SingleDiv.append(show);

    // add a line break  
    SingleDiv.append(Linebreak);
    
    roomVal.value="";
})

function createMsgDivs(message) {
    let parentDiv = document.getElementById("message-box");
        let msgDiv = document.createElement("div");
        msgDiv.id = "msg";
        
        let userPara = document.createElement("p");
        userPara.id = "user";
        userPara.textContent = "username";
        msgDiv.appendChild(userPara);
        
        let textMsgPara = document.createElement("p");
        textMsgPara.id = "text-msg";
        textMsgPara.textContent = message;
        msgDiv.appendChild(textMsgPara);
        
        parentDiv.appendChild(msgDiv);
}

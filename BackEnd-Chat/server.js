// Server file

// express initialize
const express = require('express');
const app = express();

// method 1 http create server 
// const http = require('http');
// const server = http.createServer(app);

// Method 2
const {createServer} = require('node:http');
const server = createServer(app);

// socket module
// const SocketIO = require('socket.io');
// const io = SocketIO(server);

// or 
const {Server} = require('socket.io');
const io = new Server(server); 


// additional modules
const {join} = require('node:path');

// enable cors in server
const cors = require('cors'); 

app.use(cors({
  origin: ['http://localhost:3000'],
}));

// load frontend folder
app.use(express.static(join(__dirname,'frontend')))

app.get("/",(req,res)=>{
  res.sendFile(join(__dirname ,'frontend','index.html'));
})


// Define a handler for the 'connection' event
io.on('connection', (socket) => {

  // io.emit will bradcast to all  while socket.emit will only show it to itself bjnjk
  io.emit('user-connected' ,socket.id);
  
  // handle event user-msg from client
  socket.on("user-msg" ,(message)=>{
    // broadcast msg as message event to all client
    io.emit("message",message)

    // NOTE : here if we use socket.emit it will send it to itself only
  })

  // disconnect event 
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})



// server listening at port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// adding files from public to be rendered when server is started
app.use(express.static(path.join(__dirname, "public")));

const userSocketMap = {}; 

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

// registering the username 
  socket.on("register", (username) => {
    userSocketMap[username] = socket.id;
    console.log(`${username} registered with socket ID ${socket.id}`);
  });

// code for private messaging
  socket.on("private_message", ({ to, from, text }) => {
    const toSocketId = userSocketMap[to];
    if (toSocketId) {
      io.to(toSocketId).emit("private_message", { from, text });
    }
  });

// if user is disconnected, then log the message "user of this id is disconnected"
  socket.on("disconnect", () => {
    for (let user in userSocketMap) {
      if (userSocketMap[user] === socket.id) {
        delete userSocketMap[user];
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

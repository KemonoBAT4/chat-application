const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Store connected users
const users = new Set();

// Socket.io connection event
io.on('connection', (socket) => {
  console.log('A user connected');

  // Add the new user to the users set
  users.add(socket.id);

  // Notify all users about the new user count
  io.emit('userCount', users.size);

  // Listen for chat messages
  socket.on('chatMessage', (message) => {
    // Broadcast the message to all connected users
    io.emit('chatMessage', message);
  });

  // Socket.io disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');

    // Remove the user from the users set
    users.delete(socket.id);

    // Notify all users about the updated user count
    io.emit('userCount', users.size);
  });
});

const PORT = process.env.PORT || 3000;

// Serve static files from the "public" folder
app.use(express.static('public'));

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
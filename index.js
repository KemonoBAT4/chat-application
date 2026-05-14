const express = require('express');
const http    = require('http');
const socketIO = require('socket.io');

const app    = express();
const server = http.createServer(app);
const io     = socketIO(server);

// username → socket map
const users = new Map(); // socket.id → username

io.on('connection', (socket) => {
  console.log('Nuova connessione:', socket.id);

  // ── Set username ──
  socket.on('setUsername', (rawName) => {
    const username = String(rawName).trim().slice(0, 20) || 'Anonimo';

    // Evita username duplicati
    const taken = [...users.values()].includes(username);
    const finalName = taken ? `${username}_${socket.id.slice(0,3)}` : username;

    users.set(socket.id, finalName);
    console.log(`${finalName} è entrato`);

    // Notifica tutti che qualcuno è entrato
    io.emit('systemMessage', { text: `${finalName} è entrato nella stanza` });
    io.emit('userCount', users.size);
  });

  // ── Chat message ──
  socket.on('chatMessage', (text) => {
    const username = users.get(socket.id) || 'Anonimo';
    const safeText = String(text).trim().slice(0, 500);
    if (!safeText) return;

    const now  = new Date();
    const time = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    io.emit('chatMessage', { username, text: safeText, time });
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    const username = users.get(socket.id) || 'Qualcuno';
    users.delete(socket.id);
    console.log(`${username} ha lasciato la stanza`);

    io.emit('systemMessage', { text: `${username} ha lasciato la stanza` });
    io.emit('userCount', users.size);
  });
});

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

server.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
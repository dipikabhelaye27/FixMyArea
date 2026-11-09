require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const express = require('express');
const app = require('./app');

const server = http.createServer(app);

// Setup Socket.IO for real-time collaboration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Attach io instance to express app so controllers can emit events
app.set('io', io);

// Serve frontend static build in production (Unified fullstack hosting)
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Fallback to index.html for client-side single page navigation
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    const indexHtml = path.join(clientDistPath, 'index.html');
    return res.sendFile(indexHtml, (err) => {
      if (err) next();
    });
  }
  next();
});

// Socket.io connection logging
io.on('connection', (socket) => {
  console.log('Client connected to real-time socket:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`FixMyArea Server & Real-Time Engine running on http://localhost:${PORT}`);
});

module.exports = server;

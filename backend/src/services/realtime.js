const { Server } = require('socket.io');

let io;

function initializeRealtime(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || '*', credentials: true },
  });
  io.on('connection', (socket) => {
    socket.emit('welcome', { message: 'Connected to realtime server' });

    // Client joins a user-specific room to receive order updates
    socket.on('join:user', (userId) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
    });

    // Allow clients to leave room if needed
    socket.on('leave:user', (userId) => {
      if (!userId) return;
      socket.leave(`user:${userId}`);
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
}

module.exports = { initializeRealtime, getIO, emitToUser };




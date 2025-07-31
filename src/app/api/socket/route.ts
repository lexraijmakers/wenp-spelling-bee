import { NextRequest } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

interface ExtendedGlobal {
  io?: SocketIOServer;
}

declare const global: ExtendedGlobal;

const SocketHandler = async (req: NextRequest) => {
  if (!global.io) {
    console.log('Initializing Socket.io server...');
    
    // Create a mock server for Socket.io
    const httpServer = new NetServer();
    
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    global.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join room
      socket.on('join-room', (roomCode: string) => {
        socket.join(roomCode);
        console.log(`Socket ${socket.id} joined room ${roomCode}`);
        socket.emit('room-joined', roomCode);
      });

      // Word selection
      socket.on('word-selected', (data: { roomCode: string; word: string; availableInfo: string[] }) => {
        socket.to(data.roomCode).emit('word-selected', {
          word: data.word,
          availableInfo: data.availableInfo
        });
      });

      // Timer events
      socket.on('timer-start', (data: { roomCode: string; duration: number }) => {
        socket.to(data.roomCode).emit('timer-start', { duration: data.duration });
      });

      socket.on('timer-reset', (data: { roomCode: string }) => {
        socket.to(data.roomCode).emit('timer-reset');
      });

      // Information requests
      socket.on('request-info', (data: { roomCode: string; type: string }) => {
        socket.to(data.roomCode).emit('request-info', { type: data.type });
      });

      socket.on('info-provided', (data: { roomCode: string; type: string; content: string }) => {
        socket.to(data.roomCode).emit('info-provided', { type: data.type, content: data.content });
      });

      // Judge decisions
      socket.on('judge-decision', (data: { roomCode: string; correct: boolean; correctSpelling?: string }) => {
        socket.to(data.roomCode).emit('judge-decision', {
          correct: data.correct,
          correctSpelling: data.correctSpelling
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Start the server on a different port for Socket.io
    httpServer.listen(3001, () => {
      console.log('Socket.io server running on port 3001');
    });
  }

  return new Response('Socket.io server initialized', { status: 200 });
};

export { SocketHandler as GET, SocketHandler as POST };

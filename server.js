const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room
    socket.on('join-room', (roomCode) => {
      socket.join(roomCode);
      console.log(`Socket ${socket.id} joined room ${roomCode}`);
      socket.emit('room-joined', roomCode);
    });

    // Word selection
    socket.on('word-selected', (data) => {
      socket.to(data.roomCode).emit('word-selected', {
        word: data.word,
        availableInfo: data.availableInfo
      });
    });

    // Timer events
    socket.on('timer-start', (data) => {
      socket.to(data.roomCode).emit('timer-start', { duration: data.duration });
    });

    socket.on('timer-reset', (data) => {
      socket.to(data.roomCode).emit('timer-reset');
    });

    // Information requests
    socket.on('request-info', (data) => {
      socket.to(data.roomCode).emit('request-info', { type: data.type });
    });

    socket.on('info-provided', (data) => {
      socket.to(data.roomCode).emit('info-provided', { type: data.type, content: data.content });
    });

    // Judge decisions
    socket.on('judge-decision', (data) => {
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

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
  }
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

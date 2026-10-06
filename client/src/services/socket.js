import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      // console.log(`[Socket Client] Connecté avec l'ID : ${socket.id}`);
      // Re-register user if user info is stored
      const storedUser = localStorage.getItem('mern_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          socket.emit('register-user', user);
        } catch (e) {
          // ignore
        }
      }
    });

    socket.on('disconnect', (reason) => {
      // console.log(`[Socket Client] Déconnecté: ${reason}`);
    });
  }

  return socket;
};

export const registerSocketUser = (user) => {
  const s = getSocket();
  if (user && s.connected) {
    s.emit('register-user', user);
  } else if (user) {
    s.once('connect', () => {
      s.emit('register-user', user);
    });
  }
};

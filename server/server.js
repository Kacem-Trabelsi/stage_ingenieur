import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import reunionRoutes from './routes/reunionRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { seedDatabase } from './config/seeder.js';
import { initializeSocket } from './socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

// Connect to MongoDB
connectDB().then((connected) => {
  if (connected) {
    // Auto-seed initial demo data (Admin & Client users, S2T contracts & invoices)
    seedDatabase();
  }
});

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO Server for real-time WebRTC signaling and chat
const io = initializeSocket(httpServer);
app.set('io', io);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    organization: 'S2T - Smart Tunisian Technoparks El Ghazala',
    message: '🚀 API S2T Gestion Juridique & Facturation opérationnelle',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reunions', reunionRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur S2T Express & Socket.IO démarré sur http://localhost:${PORT}`);
});

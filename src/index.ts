import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import analysisRoutes from './routes/analysis';
import uploadRoutes from './routes/upload';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aibp';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado exitosamente');
  })
  .catch((err) => {
    console.error('❌ Error de conexión MongoDB:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'AIBP Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ AIBP Backend corriendo en puerto ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});

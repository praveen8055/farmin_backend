import express  from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import productRouter from "./routes/productRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import adminRouter from "./routes/adminRoutes.js"
import contactRoutes from './routes/contactRoutes.js';
import { Server } from 'socket.io';
import http from 'http';

import path from 'path';
import { fileURLToPath } from 'url';
// app config
const app = express()
const port = process.env.PORT || 5010;

// Convert Express app to HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5174', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handler with improved logging
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Log all events the socket listens to
  socket.onAny((event, ...args) => {
    console.log(`Socket ${socket.id} event: ${event}`, args);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io so it can be used in other files
export { io };

// middlewares
app.use(express.json())
const whitelist = ['http://localhost:5173', 'http://localhost:5174'];

// Consolidated CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS once
app.use(cors(corsOptions));

// Move logging middleware to the top
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// db connection
connectDB()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// api endpoints
app.use("/api/user", userRouter)
app.use("/api/products", productRouter)
app.use("/api/admin", adminRouter)
app.use("/images",express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order",orderRouter)
app.use('/api/contact', contactRoutes);
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));
app.get("/", (req, res) => {
    res.send("API Working")
  });
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});
app.use((req, res) => {
  res.status(404).json({
      success: false,
      message: 'Route not found'
  });
});

// Use server.listen instead of app.listen
server.listen(port, () => console.log(`Server started on http://localhost:${port}`));


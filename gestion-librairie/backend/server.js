import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Handle favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Debug: Verify environment variables
console.log('Environment Variables:', {
    MONGO_URI: process.env.MONGO_URI ? '*****' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? '*****' : 'MISSING',
    PORT: PORT
});

// Enhanced CORS with debugging
const corsOptions = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*']
};
app.use(cors(corsOptions));
console.log('CORS Configured for:', corsOptions.origin);

// Middleware with request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
app.use(express.json());

// Serve static files from 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log('Static files served from:', path.join(__dirname, "uploads"));

// Database connection with error handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
};
connectDB();

// Route imports
import bookRoutes from "./routes/bookRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const routes = {
    book: bookRoutes,
    author: authorRoutes,
    user: userRoutes,
    loan: loanRoutes,
    auth: authRoutes
};

// Mount routes with logging
Object.entries(routes).forEach(([name, router]) => {
    app.use(`/api/${name}`, router);
    console.log(`✅ Routes mounted: /api/${name}`);
});

// Enhanced health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        dbStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        version: "1.0.1"
    });
});

// Improved 404 handler
app.use((req, res, next) => {
    console.warn(`⚠️ 404: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: "Endpoint not found",
        path: req.path
    });
});

// Enhanced error handler
app.use((err, req, res, next) => {
    console.error('🔥 Error:', {
        path: req.path,
        method: req.method,
        error: err.stack || err.message
    });

    res.status(err.status || 500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Server start with validation
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🔗 Try: curl http://localhost:${PORT}/api/health\n`);
}).on('error', (err) => {
    console.error('💥 Server failed to start:', err);
});
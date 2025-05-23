require('dotenv').config(); // This must be FIRST
const express = require("express");
const cors = require("cors");

// Debug: Verify environment variables
console.log('Environment Variables:', {
    MONGO_URI: process.env.MONGO_URI ? '*****' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? '*****' : 'MISSING',
    PORT: process.env.PORT || '5001 (default)'
});

const connectDB = require("./db");
const app = express();
const PORT = process.env.PORT || 5001;

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

// Database connection with error handling
connectDB().catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
});

// Route imports with debugging
const routes = {
    book: require("./routes/bookRoutes"),
    author: require("./routes/authorRoutes"),
    user: require("./routes/userRoutes"),
    loan: require("./routes/loanRoutes"),
    auth: require("./routes/authRoutes")
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
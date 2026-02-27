import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import "reflect-metadata"; // Required for TypeORM
import { AppDataSource } from "./src/config/db.config.js";
import authRoutes from "./src/routes/auth.routes.js";
import inventoryRoutes from "./src/routes/inventory.routes.js";
import purchaseRequestRoutes from "./src/routes/purchaseRequest.routes.js";
import itemRoutes from "./src/routes/item.routes.js";
import wastageRoutes from "./src/routes/wastage.routes.js";

dotenv.config();

const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
};

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors(corsOptions)); // Cho phép FE truy cập
app.use(express.json());    // Cho phép đọc dữ liệu JSON
app.use(express.urlencoded({ extended: true }));

// 1. Thêm dòng này sau khi tạo 'app' để tắt mã 304 (luôn trả về 200)
app.disable('etag');
// 2. Cập nhật Middleware logging dùng originalUrl
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const timestamp = new Date().toISOString();
        const status = res.statusCode;
        // Dùng req.originalUrl để hiển thị đầy đủ path /api/inventory/...
        console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${status} (${duration}ms)`);
        if (status >= 400) {
            console.log("--- Error Detail ---");
            console.log("Request Body:", req.body);
            console.log("--------------------");
        }
    });
    next();
});

//Register Static path so images can be reached by URL
// If WastagePicture stores "/uploads/wastage/...", this will map correctly to public/uploads/wastage/...
app.use(express.static(path.join(process.cwd(), 'public')));

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to Mini-Store API");
});

//Register SERVICE
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchase-request", purchaseRequestRoutes)
app.use("/api/item", itemRoutes);
app.use("/api/wastage", wastageRoutes);

// Database connection and server start
AppDataSource.initialize()
    .then(() => {
        console.log("Database connected successfully");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });

export default app;

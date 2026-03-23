import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import "./models/association.js";
import router from "./route/auth.routes.js";
import businessRoutes from "./route/business.routes.js";
import userRoutes from "./route/user.routes.js";
import salesRoute from "./route/sales.route.js";
import productRoute from "./route/products.routes.js";
import customerRoute from "./route/customer.routes.js";
import notificationRoute from "./route/notification.routes.js";
import purchaseOrderRoute from "./route/purchaseOrder.routes.js";
import ProfileRouter from "./route/profile.routes.js";
import settingRoute from "./route/settings.routes.js";

import db from "./config/connect.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

const allowedOrigins = [
    "http://localhost:5173",
    process.env.APP_URL,
].filter(Boolean);

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

app.set("trust proxy", 1);

app.use(
    cors({
        origin: (origin, callback) => {
            console.log("Incoming origin:", origin);
            console.log("Allowed origins:", allowedOrigins);

            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);

            return callback(new Error(`Not allowed by CORS: ${origin}`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use("/uploads", express.static("uploads"));
app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        proxy: true,
        cookie: {
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            httpOnly: true,
            maxAge: 60000 * 60,
        },
    })
);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

await db.sync();
console.log("All models synced correctly..");

app.use("/api/auth", router);
app.use("/api/business", businessRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoute);
app.use("/api/sales", salesRoute);
app.use("/api/products", productRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/purchase-orders", purchaseOrderRoute);
app.use("/api/profile", ProfileRouter);
app.use("/api/settings", settingRoute);

app.get("/", (req, res) => {
    res.send("Welcome to the Inventory and Sales Tracker API!");
});

app.use((err, req, res, next) => {
    if (err.message && err.message.includes("CORS")) {
        return res.status(403).json({
            message: err.message,
            origin: req.headers.origin || null,
        });
    }
    next(err);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
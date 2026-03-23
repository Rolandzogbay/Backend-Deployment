import express from 'express';
import cors from 'cors';
import helmet, { crossOriginResourcePolicy } from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
// association file imports
import './models/association.js'
import router from './route/auth.routes.js';
import businessRoutes from './route/business.routes.js';
import userRoutes from './route/user.routes.js';
import salesRoute from './route/sales.route.js';
import productRoute from './route/products.routes.js';
import customerRoute from './route/customer.routes.js'
import notificationRoute from './route/notification.routes.js';
import purchaseOrderRoute from './route/purchaseOrder.routes.js';
import ProfileRouter from './route/profile.routes.js';
import settingRoute from './route/settings.routes.js';

import db from './config/connect.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:5173",
    credentials: true,
}));

app.use("/uploads", express.static("uploads"));

app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, maxAge: 60000 * 60 },
    }),
);

// Database Sync
await db.sync();
console.log("All models synced correctly..")
// auth Routes and all other routes
app.use('/api/auth', router);
app.use('/api/business', businessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoute);
app.use('/api/sales', salesRoute);
app.use('/api/products', productRoute)
app.use('/api/notifications', notificationRoute)
app.use('/api/purchase-orders', purchaseOrderRoute)
app.use('/api/profile', ProfileRouter)
app.use('/api/settings', settingRoute)
// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Inventory and Sales Tracker API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

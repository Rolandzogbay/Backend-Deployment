// routes/profile.routes.js
import express from "express";
import upload from "../utils/uploads/imageUploads.middleware.js";
import { authMiddleware } from "../utils/middlewares/authMiddleware.js";
import { roleMiddleware } from "../utils/middlewares/roleMiddleware.js";
import {
    getMyProfile,
    updateMyProfile,
    updateBusinessProfile,
} from "../controllers/profile.controllers.js";

const ProfileRouter = express.Router();

ProfileRouter.use(authMiddleware);
ProfileRouter.use(roleMiddleware("business_admin", "system_admin"))

ProfileRouter.get("/me", getMyProfile);
ProfileRouter.put("/me", upload.single("avatar"), updateMyProfile);
ProfileRouter.put("/business", upload.single("logo"), updateBusinessProfile);

export default ProfileRouter;
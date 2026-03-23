import { Router } from "express";
import upload from "../utils/uploads/imageUploads.middleware.js";
import {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    verifyEmailRedirect,
    forgotPassword,
    resetPassword,
    resendVerificationEmail
} from "../controllers/auth.controllers.js";

const router = Router();

router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "businessLogo", maxCount: 1 },
    ]),
    registerUser
);

router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);

// ✅ email verification
router.get("/verify-email", verifyEmailRedirect);
router.post("/resend-verification", resendVerificationEmail);

// ✅ forgot/reset password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
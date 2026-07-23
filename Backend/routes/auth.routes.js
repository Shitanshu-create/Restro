import express from "express";
import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", authController.createUserController);
authRouter.post("/login", authController.loginUserController);
authRouter.post("/logout", authController.logoutUserController);
authRouter.get("/getMe", authMiddleware.authUser, authController.getMeController);

authRouter.get("/staff", authMiddleware.verifyAdmin, authController.getAllStaffController);
authRouter.patch("/staff/:staffId/approve", authMiddleware.verifyAdmin, authController.toggleStaffApprovalController);
authRouter.delete("/staff/:staffId", authMiddleware.verifyAdmin, authController.removeStaffController);

export default authRouter;

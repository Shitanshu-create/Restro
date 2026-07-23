import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import kitchenController from "../controllers/kitchen.controller.js";

const kitchenRouter = express.Router();

kitchenRouter.get("/getPendingOrders", authMiddleware.authUser, kitchenController.getPendingOrdersController);
kitchenRouter.patch("/updateOrderStatus/:orderId", authMiddleware.verifyStaff, kitchenController.updateOrderStatusController);
kitchenRouter.get("/getReadyOrders", authMiddleware.authUser, kitchenController.getReadyOrdersController);

export default kitchenRouter;

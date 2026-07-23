import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import kitchenController from "../controllers/kitchen.controller.js"



const kitchenRouter = express.Router();



/**
 * @description Route to fetch all pending orders for kitchen
 * @route GET /api/kitchen/getPendingOrders
 * @access Private
 */
kitchenRouter.get("/getPendingOrders", authMiddleware.authUser, kitchenController.getPendingOrdersController);



/**
 * @description Route to mark an order Ready
 * @route PATCH /api/kitchen/updateOrderStatus/:orderId
 * @access Private
 */
kitchenRouter.patch("/updateOrderStatus/:orderId", authMiddleware.verifyStaff, kitchenController.updateOrderStatusController);



/**
 * @description Route to fetch all Ready orders for waiter
 * @route GET /api/waiter/getReadyOrders
 * @access Private
 */
kitchenRouter.get("/getReadyOrders", authMiddleware.authUser, kitchenController.getReadyOrdersController);


export default kitchenRouter;
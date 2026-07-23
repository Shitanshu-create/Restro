import express from "express";
import menuController from "../controllers/menu.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const menuRouter = express.Router();

menuRouter.get("/getAll", menuController.getAllMenuController);
menuRouter.post("/addItem", authMiddleware.verifyAdmin, menuController.addMenuItemController);
menuRouter.patch("/updateItem/:itemId", authMiddleware.verifyAdmin, menuController.updateMenuItemController);
menuRouter.delete("/deleteItem/:itemId", authMiddleware.verifyAdmin, menuController.deleteMenuItemController);
menuRouter.get("/topSelling", authMiddleware.verifyAdmin, menuController.getTopSellingController);

export default menuRouter;

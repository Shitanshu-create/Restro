import express from "express";
import tableController from "../controllers/table.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";



const tableRouter = express.Router();



/**
 * @description Route to create a Table
 * @route POST /api/admin/createTable
 * @access Private (Admin)
 */
tableRouter.post("/createTable", authMiddleware.verifyAdmin, tableController.createTableController);




/**
 * @description Route to fetch all Tables
 * @route GET /api/admin/getAllTables
 * @access Private (Staff)
 */
tableRouter.get("/getAllTables", authMiddleware.authUser, tableController.getAllTablesController);



/**
 * @description Route to remove a Table
 * @route DELETE /api/admin/removeTable
 * @access Private (Admin)
 */
tableRouter.delete("/removeTable", authMiddleware.verifyAdmin, tableController.removeTableController);



/**
 * @description Route to fetch all orders for Admin oversight
 * @route GET /api/admin/getAllOrders
 * @access Private (Admin)
 */
tableRouter.get("/getAllOrders", authMiddleware.verifyAdmin, tableController.getAllOrdersController);

export default tableRouter;
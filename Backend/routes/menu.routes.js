import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import menuController from "../controllers/menu.controller.js";



const menuRouter = express.Router();



/**
 * @description Public Route to fetch full menu for customers
 * @route GET /api/menu/getMenu
 * @access Public
 */
menuRouter.get("/getMenu", menuController.getMenuController);




/**
 * @description Route to create a Category
 * @route POST /api/admin/createCategory
 * @access Private (Admin)
 */
menuRouter.post("/createCategory", authMiddleware.verifyAdmin, menuController.createCategoryController);




/**
 * @description Route to create a new Item
 * @route POST /api/admin/createItem
 * @access Private (Admin)
 */
menuRouter.post("/createItem", authMiddleware.verifyAdmin, menuController.createItemController);




/**
 * @description Route to add item to the specific Category
 * @route POST /api/admin/addItemToCategory
 * @access Private (Admin)
 */
menuRouter.post("/addItemToCategory", authMiddleware.verifyAdmin, menuController.addItemToCategoryController);




/**
 * @description Remove a Category
 * @route DELETE /api/admin/removeCategory
 * @access Private (Admin)
 */
menuRouter.delete("/removeCategory", authMiddleware.verifyAdmin, menuController.removeCategoryController);



/**
 * @description Remove a Food Item
 * @route DELETE /api/admin/removeItem
 * @access Private (Admin)
 */
menuRouter.delete("/removeItem", authMiddleware.verifyAdmin, menuController.removeItemController);



/**
 * @description remove an item from a specific category
 * @route POST /api/admin/removeItemFromCategory
 * @access Private (Admin)
 */
menuRouter.post("/removeItemFromCategory", authMiddleware.verifyAdmin, menuController.removeItemFromCategoryController);



/**
 * @description Fetch All Categories
 * @route GET /api/admin/fetchAllCategories
 * @access Private (Staff)
 */
menuRouter.get("/fetchAllCategories", authMiddleware.authUser, menuController.fetchAllCategoriesController);



/**
 * @description Fetch All Food Items
 * @route GET /api/admin/fetchAllItems
 * @access Private (Staff)
 */
menuRouter.get("/fetchAllItems", authMiddleware.authUser, menuController.fetchAllItemsController);



/**
 * @description Route to toggle item availability
 * @route PATCH /api/admin/toggleItemAvailability
 * @access Private (Admin)
 */
menuRouter.patch("/toggleItemAvailability", authMiddleware.verifyAdmin, menuController.toggleItemAvailabilityController);

/**
 * @description Route to update item image
 * @route PATCH /api/admin/updateItemImage
 * @access Private (Admin)
 */
menuRouter.patch("/updateItemImage", authMiddleware.verifyAdmin, menuController.updateItemImageController);

/**
 * @description Route to update full menu item details
 * @route PATCH /api/admin/updateMenuItem
 * @access Private (Admin)
 */
menuRouter.patch("/updateMenuItem", authMiddleware.verifyAdmin, menuController.updateMenuItemController);

/**
 * @description Route to update category name
 * @route PATCH /api/admin/updateCategory
 * @access Private (Admin)
 */
menuRouter.patch("/updateCategory", authMiddleware.verifyAdmin, menuController.updateCategoryController);

/**
 * @description Route to reorder categories
 * @route POST /api/admin/reorderCategories
 * @access Private (Admin)
 */
menuRouter.post("/reorderCategories", authMiddleware.verifyAdmin, menuController.reorderCategoriesController);

/**
 * @description Route for bulk operations on menu items
 * @route POST /api/admin/bulkOperations
 * @access Private (Admin)
 */
menuRouter.post("/bulkOperations", authMiddleware.verifyAdmin, menuController.bulkOperationsController);

export default menuRouter;
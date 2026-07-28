import mongoose from "mongoose";
import { MenuItemModel, CategoryModel } from "../models/menu.model.js";





/** 
 * @desc    Create Category
 * @route   POST /api/admin/createCategory
 * @access  Private
 */
async function createCategoryController(req, res, next) {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Please Provide a Category Name" })
        }
        const existingCategory = await CategoryModel.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: "Category Already Exists" });
        }
        const newCategory = new CategoryModel({ name, items: [] });
        await newCategory.save();
        res.status(200).json({ success: true, message: "Category Created Successfully", category: { id: newCategory._id, name: newCategory.name, items: newCategory.items } });
    } catch (error) {
        next(error);
    }
}





/**
 * @description Create Food Item
 * @route POST /api/admin/createItem
 * @access Private
 */
async function createItemController(req, res, next) {
    try {
        const { id, name, price, isAvailable, isVeg, image } = req.body;
        if (!id || !name || !price) {
            return res.status(401).json({ message: "Please Provide All Fields" });
        }
        const existingItem = await MenuItemModel.findOne({ $or: [{ id }, { name }] });
        if (existingItem) {
            return res.status(400).json({ message: "Item already Exists" });
        }
        const newItem = new MenuItemModel({
            id,
            name,
            price,
            isAvailable,
            isVeg,
            image
        });
        await newItem.save();
        return res.status(200).json({
            success: true,
            message: "Item listed successfully",
            item: {
                id: newItem.id,
                name: newItem.name,
                price: newItem.price,
                isAvailable: newItem.isAvailable,
                isVeg: newItem.isVeg,
                image: newItem.image,
            }
        });
    } catch (error) {
        next(error);
    }
}





/**
 * @description add an item to specific category
 * @route POST /api/admin/addItemToCategory
 * @access Private
 */
async function addItemToCategoryController(req, res, next) {
    try {
        const { itemId, itemName, categoryName } = req.body;
        if (!itemId || !itemName || !categoryName) {
            return res.status(401).json({ message: "Please Provide All Fields" });
        }
        const findCategory = await CategoryModel.findOne({ name: categoryName });
        const findItem = await MenuItemModel.findOne({ id: itemId, name: itemName });
        if (!findCategory) {
            return res.status(400).json({ message: "Please Provide valid Category Name" });
        }
        if (!findItem) {
            return res.status(400).json({ message: "Please Provide valid Id & Name Of the Item" });
        }
        const itemAlreadyInCategory = findCategory.items.some(
            (item) => item.id === findItem.id && item.name === findItem.name
        );
        if (itemAlreadyInCategory) {
            return res.status(400).json({ message: "Item Already Exists in this Category" });
        }
        const updatedCategoryItem = await CategoryModel.findOneAndUpdate(
            { name: categoryName },
            { $addToSet: { items: findItem } },
            { new: true }
        );
        if (!updatedCategoryItem) {
            return res.status(404).json({ success: false, message: "Category not Updated due to error." });
        }
        return res.status(200).json({
            success: true,
            message: "Food Item added successfully to the Category",
            data: updatedCategoryItem
        });
    } catch (error) {
        next(error);
    }
}





/**
 * @description Remove a Category
 * @route DELETE /api/admin/removeCategory
 * @access Private
 */
async function removeCategoryController(req, res, next) {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Please Provide a Category Name" });
        }
        const existingCategory = await CategoryModel.findOne({ name });
        if (!existingCategory) {
            return res.status(400).json({ message: "Category Does not Exist" });
        }
        await CategoryModel.findOneAndDelete({ name });
        return res.status(200).json({
            success: true,
            message: "Category Removed Successfully"
        });
    } catch (error) {
        next(error);
    }
}





/**
 * @description Remove a Food Item
 * @route DELETE /api/admin/removeItem
 * @access Private
 */
async function removeItemController(req, res, next) {
    try {
        const { id, name } = req.body;
        if (!id || !name) {
            return res.status(401).json({ message: "Please Provide All Fields" });
        }
        const existingItem = await MenuItemModel.findOne({ id, name });
        if (!existingItem) {
            return res.status(400).json({ message: "Item Does not Exist" });
        }
        await MenuItemModel.findOneAndDelete({ id, name });
        await CategoryModel.updateMany(
            { "items.id": id, "items.name": name },
            { $pull: { items: { id, name } } }
        );
        return res.status(200).json({
            success: true,
            message: "Item Removed Successfully from Item List and all Categories"
        });
    } catch (error) {
        next(error);
    }
}





/**
 * @description remove an item from a specific category
 * @route POST /api/admin/removeItemFromCategory
 * @access Private
 */
async function removeItemFromCategoryController(req, res, next) {
    try {
        const { itemId, itemName, categoryName } = req.body;
        if (!itemId || !itemName || !categoryName) {
            return res.status(401).json({ message: "Please Provide All Fields" });
        }
        const findCategory = await CategoryModel.findOne({ name: categoryName });
        if (!findCategory) {
            return res.status(400).json({ message: "Please Provide valid Category Name" });
        }
        const itemExistsInCategory = findCategory.items.some(
            (item) => item.id === Number(itemId) && item.name === itemName
        );
        if (!itemExistsInCategory) {
            return res.status(400).json({ message: "Please Provide valid Id & Name Of the Item" });
        }
        const updatedCategoryItem = await CategoryModel.findOneAndUpdate(
            { name: categoryName },
            { $pull: { items: { id: Number(itemId), name: itemName } } },
            { new: true }
        );
        if (!updatedCategoryItem) {
            return res.status(404).json({ success: false, message: "Category not Updated due to error." });
        }
        return res.status(200).json({
            success: true,
            message: "Food Item removed successfully from the Category",
            data: updatedCategoryItem
        });
    } catch (error) {
        next(error);
    }
}





/**
 * @description Fetch All Categories
 * @route GET /api/admin/fetchAllCategories
 * @access Private
 */
async function fetchAllCategoriesController(req, res, next) {
    try {
        const categories = await CategoryModel.find({});
        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: "No Categories Found" });
        }
        return res.status(200).json({
            success: true,
            message: "Categories Fetched Successfully",
            categories
        });
    } catch (error) {
        next(error);
    }
}




/**
 * @description Fetch All Food Items
 * @route GET /api/admin/fetchAllItems
 * @access Private
 */
async function fetchAllItemsController(req, res, next) {
    try {
        const items = await MenuItemModel.find({});
        if (!items || items.length === 0) {
            return res.status(404).json({ message: "No Items Found" });
        }
        return res.status(200).json({
            success: true,
            message: "Items Fetched Successfully",
            items
        });
    } catch (error) {
        next(error);
    }
}




/**
 * @desc    Toggle Item Availability
 * @route   PATCH /api/admin/toggleItemAvailability
 * @access  Private
 */
async function toggleItemAvailabilityController(req, res, next) {
    try {
        const { id, name } = req.body;
        if (!id || !name) {
            return res.status(400).json({ message: "Please Provide All Fields" });
        }
        const existingItem = await MenuItemModel.findOne({ id, name });
        if (!existingItem) {
            return res.status(400).json({ message: "Item Does not Exist" });
        }
        existingItem.isAvailable = !existingItem.isAvailable;
        await existingItem.save();
        await CategoryModel.updateMany(
            { "items.id": id, "items.name": name },
            { $set: { "items.$.isAvailable": existingItem.isAvailable } }
        );
        return res.status(200).json({
            success: true,
            message: `Item marked as ${existingItem.isAvailable ? "Available" : "Unavailable"}`,
            item: {
                id: existingItem.id,
                name: existingItem.name,
                isAvailable: existingItem.isAvailable
            }
        });
    } catch (error) {
        next(error);
    }
}




/**
 * @desc    Get public full menu for customers
 * @route   GET /api/menu/getMenu
 * @access  Public
 */
async function getMenuController(req, res, next) {
    try {
        const { CategoryModel, MenuItemModel } = await import("../models/menu.model.js");
        let categories = await CategoryModel.find({}).lean();
        const allItems = await MenuItemModel.find({}).lean();
        if ((!categories || categories.length === 0) && allItems && allItems.length > 0) {
            categories = [{
                _id: "uncategorized",
                name: "All Dishes",
                items: allItems
            }];
        } else if (categories && categories.length > 0 && allItems && allItems.length > 0) {
            // Find items in MenuItemModel that are not embedded in any category's items array
            const categoryItemIds = new Set(
                categories.flatMap(c => (c.items || []).map(i => i.id))
            );
            const unassignedItems = allItems.filter(i => !categoryItemIds.has(i.id));
            if (unassignedItems.length > 0) {
                let defaultCategory = categories.find(c => c.name.toLowerCase() === "other" || c.name.toLowerCase() === "dishes");
                if (!defaultCategory) {
                    defaultCategory = { _id: "default_cat", name: "Dishes", items: [] };
                    categories.push(defaultCategory);
                }
                defaultCategory.items.push(...unassignedItems);
            }
        }
        res.status(200).json({
            success: true,
            message: "Menu fetched successfully",
            categories: categories || []
        });
    } catch (error) {
        next(error);
    }
}



async function updateItemImageController(req, res, next) {
    try {
        const { id, name, image } = req.body;
        if (!id || !name) {
            return res.status(400).json({ message: "Please Provide Item ID and Name" });
        }
        const updatedItem = await MenuItemModel.findOneAndUpdate(
            { id: Number(id), name },
            { image },
            { new: true }
        );
        if (!updatedItem) {
            return res.status(404).json({ message: "Item Not Found" });
        }
        await CategoryModel.updateMany(
            { "items.id": Number(id) },
            { $set: { "items.$.image": image } }
        );
        return res.status(200).json({
            success: true,
            message: "Item image updated successfully",
            item: updatedItem
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @desc Update full menu item details
 * @route PATCH /api/admin/updateMenuItem
 * @access Private (Admin)
 */
async function updateMenuItemController(req, res, next) {
    try {
        const { id, name, description, price, discountPrice, preparationTime, isVeg, isAvailable, isBestseller, isRecommended, image, upsellItems, variants, addOns, categoryName } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Item ID is required" });
        }
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = Number(price);
        if (discountPrice !== undefined) updateData.discountPrice = Number(discountPrice);
        if (preparationTime !== undefined) updateData.preparationTime = Number(preparationTime);
        if (isVeg !== undefined) updateData.isVeg = Boolean(isVeg);
        if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
        if (isBestseller !== undefined) updateData.isBestseller = Boolean(isBestseller);
        if (isRecommended !== undefined) updateData.isRecommended = Boolean(isRecommended);
        if (image !== undefined) updateData.image = image;
        if (upsellItems !== undefined) updateData.upsellItems = upsellItems;
        if (variants !== undefined) updateData.variants = variants;
        if (addOns !== undefined) updateData.addOns = addOns;

        const updatedItem = await MenuItemModel.findOneAndUpdate(
            { id: Number(id) },
            { $set: updateData },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Also sync item within categories
        await CategoryModel.updateMany(
            { "items.id": Number(id) },
            {
                $set: {
                    "items.$.name": updatedItem.name,
                    "items.$.description": updatedItem.description,
                    "items.$.price": updatedItem.price,
                    "items.$.discountPrice": updatedItem.discountPrice,
                    "items.$.preparationTime": updatedItem.preparationTime,
                    "items.$.isVeg": updatedItem.isVeg,
                    "items.$.isAvailable": updatedItem.isAvailable,
                    "items.$.isBestseller": updatedItem.isBestseller,
                    "items.$.isRecommended": updatedItem.isRecommended,
                    "items.$.image": updatedItem.image,
                    "items.$.upsellItems": updatedItem.upsellItems,
                    "items.$.variants": updatedItem.variants,
                    "items.$.addOns": updatedItem.addOns
                }
            }
        );

        // If categoryName was specified, assign item to category if not present
        if (categoryName) {
            // Remove from other categories first if requested or needed
            await CategoryModel.updateMany(
                { name: { $ne: categoryName } },
                { $pull: { items: { id: Number(id) } } }
            );
            await CategoryModel.findOneAndUpdate(
                { name: categoryName },
                { $addToSet: { items: updatedItem } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            item: updatedItem
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @desc Rename category
 * @route PATCH /api/admin/updateCategory
 * @access Private (Admin)
 */
async function updateCategoryController(req, res, next) {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName) {
            return res.status(400).json({ message: "Please provide old and new category names" });
        }
        const updatedCat = await CategoryModel.findOneAndUpdate(
            { name: oldName },
            { name: newName },
            { new: true }
        );
        if (!updatedCat) {
            return res.status(404).json({ message: "Category not found" });
        }
        return res.status(200).json({
            success: true,
            message: "Category renamed successfully",
            category: updatedCat
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @desc Reorder categories
 * @route POST /api/admin/reorderCategories
 * @access Private (Admin)
 */
async function reorderCategoriesController(req, res, next) {
    try {
        const { orderedCategoryNames } = req.body; // array of names in order
        if (!Array.isArray(orderedCategoryNames)) {
            return res.status(400).json({ message: "Please provide ordered category names array" });
        }
        for (let i = 0; i < orderedCategoryNames.length; i++) {
            await CategoryModel.updateOne(
                { name: orderedCategoryNames[i] },
                { order: i }
            );
        }
        return res.status(200).json({
            success: true,
            message: "Categories reordered successfully"
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @desc Bulk operations on items
 * @route POST /api/admin/bulkOperations
 * @access Private (Admin)
 */
async function bulkOperationsController(req, res, next) {
    try {
        const { action, itemIds, targetCategory, percentage } = req.body;
        if (!action || !Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({ message: "Please provide action and target item IDs" });
        }

        const ids = itemIds.map(Number);

        if (action === "markAvailable") {
            await MenuItemModel.updateMany({ id: { $in: ids } }, { isAvailable: true });
            await CategoryModel.updateMany(
                { "items.id": { $in: ids } },
                { $set: { "items.$[elem].isAvailable": true } },
                { arrayFilters: [{ "elem.id": { $in: ids } }] }
            );
        } else if (action === "markUnavailable") {
            await MenuItemModel.updateMany({ id: { $in: ids } }, { isAvailable: false });
            await CategoryModel.updateMany(
                { "items.id": { $in: ids } },
                { $set: { "items.$[elem].isAvailable": false } },
                { arrayFilters: [{ "elem.id": { $in: ids } }] }
            );
        } else if (action === "changeCategory") {
            if (!targetCategory) {
                return res.status(400).json({ message: "Target category is required" });
            }
            const targetCatDoc = await CategoryModel.findOne({ name: targetCategory });
            if (!targetCatDoc) {
                return res.status(400).json({ message: "Target category not found" });
            }
            const itemsToMove = await MenuItemModel.find({ id: { $in: ids } });
            // Pull items from all categories
            await CategoryModel.updateMany(
                {},
                { $pull: { items: { id: { $in: ids } } } }
            );
            // Add items to target category
            await CategoryModel.findOneAndUpdate(
                { name: targetCategory },
                { $addToSet: { items: { $each: itemsToMove } } }
            );
        } else if (action === "adjustPrice") {
            const pct = Number(percentage || 0);
            if (pct === 0) {
                return res.status(400).json({ message: "Valid percentage is required" });
            }
            const itemsToUpdate = await MenuItemModel.find({ id: { $in: ids } });
            for (const item of itemsToUpdate) {
                const newPrice = Math.max(0, Number((item.price * (1 + pct / 100)).toFixed(2)));
                item.price = newPrice;
                await item.save();
                await CategoryModel.updateMany(
                    { "items.id": item.id },
                    { $set: { "items.$.price": newPrice } }
                );
            }
        } else if (action === "delete") {
            await MenuItemModel.deleteMany({ id: { $in: ids } });
            await CategoryModel.updateMany(
                {},
                { $pull: { items: { id: { $in: ids } } } }
            );
        } else if (action === "duplicate") {
            const itemsToDup = await MenuItemModel.find({ id: { $in: ids } });
            const allItems = await MenuItemModel.find({});
            let maxId = allItems.reduce((max, i) => Math.max(max, i.id), 100);

            for (const item of itemsToDup) {
                maxId += 1;
                const newItem = new MenuItemModel({
                    id: maxId,
                    name: `${item.name} (Copy)`,
                    description: item.description,
                    price: item.price,
                    discountPrice: item.discountPrice,
                    preparationTime: item.preparationTime,
                    isVeg: item.isVeg,
                    isAvailable: item.isAvailable,
                    isBestseller: item.isBestseller,
                    isRecommended: item.isRecommended,
                    image: item.image,
                    upsellItems: item.upsellItems,
                    variants: item.variants,
                    addOns: item.addOns
                });
                await newItem.save();
            }
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        return res.status(200).json({
            success: true,
            message: `Bulk action '${action}' completed successfully`
        });
    } catch (error) {
        next(error);
    }
}


export default {
    createCategoryController,
    createItemController,
    addItemToCategoryController,
    removeCategoryController,
    removeItemController,
    removeItemFromCategoryController,
    fetchAllCategoriesController,
    fetchAllItemsController,
    toggleItemAvailabilityController,
    updateItemImageController,
    updateMenuItemController,
    updateCategoryController,
    reorderCategoriesController,
    bulkOperationsController,
    getMenuController
};
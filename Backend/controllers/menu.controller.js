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
    getMenuController
};
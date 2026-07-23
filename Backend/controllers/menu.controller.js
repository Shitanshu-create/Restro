import { CategoryModel, MenuItemModel } from "../models/menu.model.js";

async function getAllMenuController(req, res, next) {
    try {
        const categories = await CategoryModel.find({});
        res.status(200).json({ success: true, menu: categories });
    } catch (error) {
        next(error);
    }
}

async function addMenuItemController(req, res, next) {
    try {
        const { categoryName, name, price, isVeg, image } = req.body;

        if (!categoryName || !name || !price) {
            return res.status(400).json({ message: "Please provide categoryName, name, and price" });
        }

        let category = await CategoryModel.findOne({ name: categoryName });
        if (!category) {
            category = new CategoryModel({ name: categoryName, items: [] });
        }

        const maxId = await getMaxItemId();
        const newItem = {
            id: maxId + 1,
            name,
            price: Number(price),
            isVeg: isVeg !== undefined ? isVeg : true,
            isAvailable: true,
            image: image || ""
        };

        category.items.push(newItem);
        await category.save();

        res.status(201).json({ success: true, message: "Menu item added successfully", item: newItem });
    } catch (error) {
        next(error);
    }
}

async function getMaxItemId() {
    const categories = await CategoryModel.find({});
    let maxId = 0;
    categories.forEach(cat => {
        cat.items.forEach(item => {
            if (item.id > maxId) maxId = item.id;
        });
    });
    return maxId;
}

async function updateMenuItemController(req, res, next) {
    try {
        const { itemId } = req.params;
        const { name, price, isVeg, isAvailable, image } = req.body;

        const category = await CategoryModel.findOne({ "items.id": Number(itemId) });
        if (!category) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        const item = category.items.find(i => i.id === Number(itemId));
        if (name !== undefined) item.name = name;
        if (price !== undefined) item.price = Number(price);
        if (isVeg !== undefined) item.isVeg = isVeg;
        if (isAvailable !== undefined) item.isAvailable = isAvailable;
        if (image !== undefined) item.image = image;

        await category.save();

        res.status(200).json({ success: true, message: "Menu item updated successfully", item });
    } catch (error) {
        next(error);
    }
}

async function deleteMenuItemController(req, res, next) {
    try {
        const { itemId } = req.params;

        const category = await CategoryModel.findOne({ "items.id": Number(itemId) });
        if (!category) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        category.items = category.items.filter(i => i.id !== Number(itemId));
        await category.save();

        res.status(200).json({ success: true, message: "Menu item deleted successfully" });
    } catch (error) {
        next(error);
    }
}

async function getTopSellingController(req, res, next) {
    try {
        const { OrderModel } = await import("../models/order.model.js");
        const orders = await OrderModel.find({ paymentStatus: "Paid" });

        const itemMap = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!itemMap[item.name]) {
                    itemMap[item.name] = { name: item.name, count: 0, revenue: 0 };
                }
                itemMap[item.name].count += item.count || 1;
                itemMap[item.name].revenue += item.price * (item.count || 1);
            });
        });

        const sorted = Object.values(itemMap).sort((a, b) => b.count - a.count).slice(0, 5);
        res.status(200).json({ success: true, topSelling: sorted });
    } catch (error) {
        next(error);
    }
}

export default {
    getAllMenuController,
    addMenuItemController,
    updateMenuItemController,
    deleteMenuItemController,
    getTopSellingController
};

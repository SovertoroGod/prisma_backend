const productItemService = require("../services/productItem.service");

const create = async (req, res) => {
  try {
    const result = await productItemService.create(req.validated);
    res.status(201).json({ success: true, message: "Product item created successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in create product item", error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const result = await productItemService.getAll(req.validated);
    res.status(200).json({ success: true, message: "Product items retrieved successfully", _metadata: result.metadata, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get all product items", error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await productItemService.getById(req.validated.id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get product item by id", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id, ...updateData } = req.validated;
    const result = await productItemService.update(id, updateData);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in update product item", error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const result = await productItemService.delete(req.validated.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in delete product item", error: error.message });
  }
};

module.exports = { create, getAll, getById, update, deleteItem };

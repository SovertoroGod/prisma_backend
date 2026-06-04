const productListService = require("../services/productList.service");

const create = async (req, res) => {
  try {
    const result = await productListService.create(req.validated);
    res.status(201).json({ success: true, message: "Product list created successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in create product list", error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const result = await productListService.getAll(req.validated);
    res.status(200).json({ success: true, message: "Product lists retrieved successfully", _metadata: result.metadata, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get all product lists", error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await productListService.getById(req.validated.id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get product list by id", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id, ...updateData } = req.validated;
    const result = await productListService.update(id, updateData);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in update product list", error: error.message });
  }
};

const deleteList = async (req, res) => {
  try {
    const result = await productListService.delete(req.validated.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in delete product list", error: error.message });
  }
};

module.exports = { create, getAll, getById, update, deleteList };

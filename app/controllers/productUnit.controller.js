const productUnitService = require("../services/productUnit.service");

const create = async (req, res) => {
  try {
    const result = await productUnitService.create(req.validated, req.user?.id);
    res.status(201).json({ success: true, message: "Product unit created successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in create product unit", error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const result = await productUnitService.getAll(req.validated);
    res.status(200).json({ success: true, message: "Product units retrieved successfully", _metadata: result.metadata, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get all product units", error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await productUnitService.getById(req.validated.id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get product unit by id", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id, ...updateData } = req.validated;
    const result = await productUnitService.update(id, updateData, req.user?.id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in update product unit", error: error.message });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const result = await productUnitService.delete(req.validated.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in delete product unit", error: error.message });
  }
};

module.exports = { create, getAll, getById, update, deleteUnit };

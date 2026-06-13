const issueItemService = require("../services/issueItem.service");

const create = async (req, res) => {
  try {
    const result = await issueItemService.create(req.validated, req.user);
    res.status(201).json({ success: true, message: "Item issued to Head Office successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in issue item", error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const result = await issueItemService.getAll(req.validated);
    res.status(200).json({ success: true, message: "Issue items retrieved successfully", _metadata: result.metadata, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get issue items", error: error.message });
  }
};

const getAllForManager = async (req, res) => {
  try {
    req.validated.from_branch_id = req.user.branch_id;
    const result = await issueItemService.getAll(req.validated);
    res.status(200).json({ success: true, message: "Issue items retrieved successfully", _metadata: result.metadata, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get issue items", error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await issueItemService.getById(req.validated.id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get issue item by id", error: error.message });
  }
};

const getByIdForManager = async (req, res) => {
  try {
    const result = await issueItemService.getById(req.validated.id);
    if (result.data.from_branch_id !== req.user.branch_id) {
      return res.status(403).json({ success: false, message: "Access denied. Issue item does not belong to your branch." });
    }
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get issue item by id", error: error.message });
  }
};

module.exports = { create, getAll, getAllForManager, getById, getByIdForManager };

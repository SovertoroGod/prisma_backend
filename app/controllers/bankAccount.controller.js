const bankAccountService = require("../services/bankAccount.service");

const create = async (req, res) => {
  try {
    const result = await bankAccountService.create(req.validated);
    res.status(201).json({ success: true, message: "Bank account created successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in create bank account", error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const result = await bankAccountService.getAll(req.validated);
    res.status(200).json({ success: true, message: "Bank accounts retrieved successfully", _metadata: result.metadata, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get bank accounts", error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await bankAccountService.getById(req.validated.id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get bank account by id", error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id, ...updateData } = req.validated;
    const result = await bankAccountService.update(id, updateData);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in update bank account", error: error.message });
  }
};

const listActive = async (req, res) => {
  try {
    const result = await bankAccountService.listActive();
    res.status(200).json({ success: true, message: "Active bank accounts retrieved successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in list bank accounts", error: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const { id, ...filters } = req.validated;
    const result = await bankAccountService.getHistory(id, filters);
    res.status(200).json({
      success: true,
      message: "Bank account history retrieved successfully",
      data: result.data,
      account: result.account,
      aggregates: result.aggregates,
      _metadata: result.metadata,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get bank account history", error: error.message });
  }
};

const getHistoryForManager = async (req, res) => {
  try {
    const { id, ...filters } = req.validated;
    filters.branch_id = req.user.branch_id;
    const result = await bankAccountService.getHistory(id, filters);
    res.status(200).json({
      success: true,
      message: "Bank account history retrieved successfully",
      data: result.data,
      account: result.account,
      aggregates: result.aggregates,
      _metadata: result.metadata,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get bank account history", error: error.message });
  }
};

module.exports = { create, getAll, getById, update, listActive, getHistory, getHistoryForManager };

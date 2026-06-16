const debtService = require("../services/debt.service");

const getAll = async (req, res) => {
  try {
    const result = await debtService.getAll(req.validated, req.user.branch_id);
    res.status(200).json({
      success: true,
      message: "Debts retrieved successfully",
      _metadata: result.metadata,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get debts", error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await debtService.getById(req.validated.id, req.user.branch_id);
    res.status(200).json({ success: true, message: "Debt retrieved successfully", data: result.data });
  } catch (error) {
    if (error.message === "Debt not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Internal Server Error in get debt by id", error: error.message });
  }
};

const repay = async (req, res) => {
  try {
    const result = await debtService.repay(req.validated.id, req.validated, req.user.id, req.user.branch_id);
    res.status(201).json({ success: true, message: "Repayment recorded successfully", data: result });
  } catch (error) {
    if (error.message.includes("not found") || error.message.includes("already")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Internal Server Error in repay debt", error: error.message });
  }
};

module.exports = { getAll, getById, repay };

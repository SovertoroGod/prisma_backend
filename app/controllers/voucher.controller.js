const voucherService = require("../services/voucher.service");

const create = async (req, res) => {
  try {
    const result = await voucherService.create(req.validated, req.user.id, req.user.branch_id);
    res.status(201).json({ success: true, message: "Voucher created successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in create voucher", error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const result = await voucherService.getAll(req.validated, req.user.branch_id);
    res.status(200).json({ success: true, message: "Vouchers retrieved successfully", _metadata: result.metadata, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get vouchers", error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await voucherService.getById(req.validated.id, req.user.branch_id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get voucher by id", error: error.message });
  }
};

module.exports = { create, getAll, getById };

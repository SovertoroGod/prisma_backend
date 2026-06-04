const productUnitLogService = require("../services/productUnitLog.service");

const getAll = async (req, res) => {
  try {
    const result = await productUnitLogService.getAll(req.validated);
    res.status(200).json({ success: true, message: "Product unit logs retrieved successfully", _metadata: result.metadata, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get all product unit logs", error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await productUnitLogService.getById(req.validated.id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get product unit log by id", error: error.message });
  }
};

const transfer = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await productUnitLogService.transferStock(req.validated, userId);
    res.status(200).json({ success: true, message: "Stock transferred successfully", reference_id: result.reference_id, logs: result.logs, from_unit: result.from_unit, to_unit: result.to_unit });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in transfer stock", error: error.message });
  }
};

module.exports = { getAll, getById, transfer };

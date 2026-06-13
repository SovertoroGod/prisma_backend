const stockTransferService = require("../services/stockTransfer.service");

const initiate = async (req, res) => {
  try {
    const result = await stockTransferService.initiate(req.validated, req.user);
    res.status(201).json({ success: true, message: "Stock transfer initiated successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in initiate stock transfer", error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const result = await stockTransferService.getAll(req.validated);
    res.status(200).json({ success: true, message: "Stock transfers retrieved successfully", _metadata: result.metadata, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get all stock transfers", error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await stockTransferService.getById(req.validated.id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get stock transfer by id", error: error.message });
  }
};

const receive = async (req, res) => {
  try {
    const result = await stockTransferService.receive(req.validated.id, req.user);
    res.status(200).json({ success: true, message: "Stock transfer received successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in receive stock transfer", error: error.message });
  }
};

const cancelTransfer = async (req, res) => {
  try {
    const result = await stockTransferService.cancel(req.validated.id, req.user);
    res.status(200).json({ success: true, message: "Stock transfer cancelled successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in cancel stock transfer", error: error.message });
  }
};

module.exports = { initiate, getAll, getById, receive, cancelTransfer };

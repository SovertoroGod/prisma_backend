const customerService = require("../services/customer.service");

const create = async (req, res) => {
  try {
    const result = await customerService.create(req.validated);
    res.status(201).json({ success: true, message: "Customer created successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in create customer", error: error.message });
  }
};

const findByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    if (phone) {
      const result = await customerService.findByPhone(phone);
      return res.status(200).json({ success: true, data: result });
    }
    const result = await customerService.getAll(req.validated);
    res.status(200).json({ success: true, message: "Customers retrieved successfully", _metadata: result.metadata, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get customers", error: error.message });
  }
};

const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Search query is required" });
    const result = await customerService.search(q);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in search customers", error: error.message });
  }
};

module.exports = { create, findByPhone, search };

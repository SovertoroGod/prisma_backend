const branchService = require("../services/branch.service");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createBranch = async (req, res) => {
  try {
    const { branch_name, branch_code, address, phone_number } = req.validated;
    const branchData = {
      branch_name,
      branch_code,
      address,
      phone_number,
    };
    const branch = await branchService.createBranch(branchData);
    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error in create branch controller",
      error: error.message,
    });
  }
};

const getAllBranches = async (req, res) => {
  try {
    const filters = req.validated;
    const result = await branchService.getAllBranches(filters);
    res.status(200).json({
      success: true,
      message: "Branches retrieved successfully",
      _metadata: result.metadata,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error in get all branches controller",
      error: error.message,
    });
  }
};

const getAllBranchesForUser = async (req, res) => {
  try {
    const filters = req.validated;
    const result = await branchService.getAllBranchesForUser(filters);
    res.status(200).json({
      success: true,
      message: "Branches for user retrieved successfully",
      _metadata: result.metadata,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error in get all branches controller",
      error: error.message,
    });
  }
};

const getBranchById = async (req, res) => {
  try {
    const { id } = req.validated;
    const result = await branchService.getBranchById(id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error in get all branches controller",
      error: error.message,
    });
  }
};

const updateBranch = async (req, res) => {
  try {
    const { id, branch_name, branch_code, address, phone_number, is_active } =
      req.validated;
    const branchData = {
      branch_name,
      branch_code,
      address,
      phone_number,
      is_active,
    };
    const result = await branchService.updateBranch(id, branchData);
    const updatedBranch = await prisma.branch.findUnique({
      where: {
        id: result.updatedId,
      },
    });
    res.status(200).json({
      success: true,
      message: result.message,
      data: updatedBranch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error in update branch controller",
      error: error.message,
    });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const { id } = req.validated;
    const result = await branchService.deleteBranch(id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error in update branch controller",
      error: error.message,
    });
  }
};

const branchControllers = {
  createBranch,
  getAllBranches,
  getAllBranchesForUser,
  getBranchById,
  updateBranch,
  deleteBranch,
};

module.exports = branchControllers;

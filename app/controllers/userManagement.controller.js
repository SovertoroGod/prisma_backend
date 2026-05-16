const userManagementService = require("../services/userManagement.service");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
    try {
        const userData = req.validated;
        const result = await userManagementService.getAllUsers(userData);
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            _metadata: result.metadata,
            data: result.data,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error in get all users",
            error: error.message
        })
    }
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.validated;
        const result = await userManagementService.getUserById(id);
        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error in get user by id",
            error: error.message
        })
    }
}

const updateUser = async (req, res) => {
    try {
        const userData = req.validated;
        const { id, ...userUpdateData } = userData;
        const result = await userManagementService.updateUser(id, userUpdateData);
        const updatedUser = await prisma.user.findUnique({
            where: {id: result.updatedId}
        })
        res.status(200).json({
            success: true,
            message: result.message,
            data: updatedUser
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error in update user",
            error: error.message
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.validated;
        const result = await userManagementService.deleteUser(id);
        res.status(200).json({
            success: true,
            message: result.message
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error in delete user",
            error: error.message
        })
    }
}

const userManagementControllers = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};

module.exports = userManagementControllers;
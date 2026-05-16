const categoryService = require("../services/category.service");

const createCategory = async (req, res) => {
    try {
        const categoryData = req.validated;
        const result = await categoryService.createCategory(categoryData);
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: result
        })
    } catch(error){
        res.status(500).json({
            success: false,
            message: "Internal Server Error in Create Category",
            error: error.message
        })
    }
}

const getAllCategories = async (req, res) => {
    try {
        const filters = req.validated;
        const result = await categoryService.getAllCategories(filters);
        res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            _metadata: result.metadata,
            data: result.data
        })
    } catch(error){
        res.status(500).json({
            success: false,
            message: "Internal Server Error in get all categories",
            error: error.message
        })
    }
}

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.validated;
        const result = await categoryService.getCategoryById(id);
        res.status(200).json({
            success: true,
            message: result.message,
            data: result.categoryData
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error in get category by id",
            error: error.message
        })
    }
}

const updateCategory = async (req, res) => {
    try {
        const { id } = req.validated;
        const categoryData = req.validated;
        const result = await categoryService.updateCategory(id, categoryData);
        res.status(200).json({
            success: true,
            message: result.message,
            data: result.categoryData
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error in update category",
            error: error.message
        })
    }
}

const categoryControllers = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory
}

module.exports = categoryControllers;

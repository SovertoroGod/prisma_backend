const authService = require("../services/auth.service");

const register = async (req, res) => {
    try {
        const { full_name, username, email, password, role, branch_id } = req.validated;
        const userData = {
            full_name,
            username,
            email,
            password,
            role,
            branch_id
        };
        const result = await authService.registerUser(userData);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error in auth register controller",
            error: error.message
        })
    }
};

const login = async (req, res) => {
    try {
       const {email, password}  = req.validated;
        const result = await authService.loginUser(email, password);
        res.status(200).json({
            success: true,
            message: "User login Successfully",
            data: result
        })
    }catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error in auth login controller",
            error: error.message
        })
    }
};

const authControllers = {
    register,
    login
}

module.exports = authControllers;
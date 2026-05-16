const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin } = require("../middlewares/authorize");
const validateError = require("../middlewares/validationErrorHandler");
const authValidators = require("../validations/auth.validation");
const authControllers = require("../controllers/auth.controller");
const router = express.Router();

router.post("/auth/register",
    verifyToken,
    isAdmin,
    validateError(authValidators.validateRegister),
    authControllers.register
);

router.post("/auth/login",
    validateError(authValidators.validateLogin),
    authControllers.login
);

module.exports = router;
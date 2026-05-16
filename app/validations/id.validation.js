const { check } = require("express-validator");

const validateID = [
    check("id")
        .trim()
        .notEmpty()
        .withMessage("Id must not be empty")
        .isInt()
        .withMessage("id must be integer")
];

module.exports = validateID;
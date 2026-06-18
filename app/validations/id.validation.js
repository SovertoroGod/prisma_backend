const { param } = require("express-validator");

const validateID = [
    param("id")
        .trim()
        .notEmpty()
        .withMessage("Id must not be empty")
        .isInt()
        .withMessage("id must be integer")
        .toInt()
];

module.exports = validateID;
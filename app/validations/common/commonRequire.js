const { body, param, query, check } = require("express-validator");

const requiredInt = (field, label = field) =>
    check(field)
        .notEmpty()
        .withMessage(`${label} must not be empty`)
        .trim()
        .isInt({ min: 1 })
        .withMessage(`${label} must be positive integer`)
        .toInt();

const requiredNumber = (field, label = field, min = 0) =>
    check(field)
        .notEmpty()
        .withMessage(`${label} is required`)
        .trim()
        .isFloat({ min })
        .withMessage(`${label} must be a number${min !== undefined ? ` (min: ${min})` : ''}`)
        .toFloat();

const requiredISODate = (field, label = field) =>
    check(field)
        .notEmpty()
        .withMessage(`${label} is required`)
        .trim()
        .isISO8601()
        .withMessage(`${label} must be YYYY-MM-DD format`);

const requiredEndDate = (
    field = "endDate",
    startField = "startDate",
    label = "End date",
) =>
    check(field)
        .notEmpty()
        .withMessage(`${label} is required`)
        .trim()
        .isISO8601()
        .withMessage(`${label} must be YYYY-MM-DD format`)
        .custom((value, { req }) => {
            const startDate = req.query[startField];

            if (startDate && !value) {
                throw new Error(`${label} is required`);
            }

            return true;
        });

const requiredString = (field, label = field, minLength = 1) =>
    check(field)
        .notEmpty()
        .withMessage(`${label} is required`)
        .trim()
        .isString()
        .isLength({ min: minLength })
        .withMessage(`${label} must be string`);

const requiredEmail = (field, label = field) =>
    check(field)
        .trim()
        .notEmpty()
        .withMessage(`${label} must not be empty`)
        .isEmail()
        .withMessage(`${label} must be email format`)

const requiredBoolean = (field, label = field) =>
    check(field)
        .notEmpty()
        .withMessage(`${label} is required`)
        .toBoolean()
        .isBoolean()
        .withMessage(`${label} must be true or false`);

const requiredEnum = (
    field,
    values,
    label = field
) =>
    check(field)
        .notEmpty()
        .withMessage(`${label} must not be empty`)
        .trim()
        .isString()
        .withMessage(`${label} must be a string`)
        .isIn(values)
        .withMessage(
            `${label} must be either ${values
                .map(v => `'${v}'`)
                .join(" or ")}`
        );


module.exports = {
    requiredInt,
    requiredNumber,
    requiredISODate,
    requiredEndDate,
    requiredString,
    requiredEmail,
    requiredBoolean,
    requiredEnum,
};

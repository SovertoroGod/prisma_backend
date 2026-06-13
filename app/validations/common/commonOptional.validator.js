const { body, param, query, check } = require("express-validator");

const optionalInt = (field, label = field) =>
    check(field)
        .optional({ values: "falsy" })
        .trim()
        .isInt({ min: 1 })
        .withMessage(`${label} must be positive integer`)
        .toInt();

const optionalNumber = (field, label = field, min = 0) =>
    check(field)
        .optional({ values: "falsy" })
        .trim()
        .isFloat({ min })
        .withMessage(`${label} must be a number${min !== undefined ? ` (min: ${min})` : ''}`)
        .toFloat();

const optionalISODate = (field, label = field) =>
    check(field)
        .optional({ values: "falsy" })
        .trim()
        .isISO8601()
        .withMessage(`${label} must be YYYY-MM-DD format`);

const optionalEndDate = (
    field = "endDate",
    startField = "startDate",
    label = "End date",
) =>
    check(field)
        .optional({ values: "falsy" })
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

const optionalString = (field, label = field) =>
    check(field)
        .optional({ values: "falsy" })
        .trim()
        .isString()
        .withMessage(`${label} must be string`);

const optionalBoolean = (field, label = field) =>
    check(field)
        .optional({ values: "falsy" })
        .toBoolean()
        .isBoolean()
        .withMessage(`${label} must be true or false`);

const optionalEnum = (
    field,
    values,
    label = field
) =>
    check(field)
        .optional({ values: "falsy" })
        .trim()
        .isString()
        .withMessage(`${label} must be a string`)
        .isIn(values)
        .withMessage(
            `${label} must be either ${values
                .map(v => `'${v}'`)
                .join(" or ")}`
    );
        
const optionalEmail = (
    field,
    label = field
) => check(field)
    .optional()
    .trim()
    .isEmail()
    .withMessage(`${label} must be email format`);


module.exports = {
    optionalInt,
    optionalNumber,
    optionalISODate,
    optionalEndDate,
    optionalString,
    optionalBoolean,
    optionalEnum,
    optionalEmail
};

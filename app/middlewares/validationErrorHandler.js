const { validationResult, matchedData } = require("express-validator");

const validateError = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const firstError = errors.array({ onlyFirstError: true })[0];

      return res.status(400).json({
        success: false,
        message: firstError.msg,
        field: firstError.path,
      });
    }

    req.validated = matchedData(req, {
      locations: ["body", "query", "params"],
    });

    next();
  };
};

module.exports = validateError;
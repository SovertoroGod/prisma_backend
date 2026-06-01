const { validationResult, matchedData } = require("express-validator");

const validateError = (validators) => {
  return async (req, res, next) => {
    // run all validators
    for (const validator of validators) {
      await validator.run(req);
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formatted = errors.array().reduce((acc, err) => {
        const field = err.path;

        if (!acc[field]) {
          acc[field] = {
            location: err.location,
            messages: [],
          };
        }

        acc[field].messages.push(err.msg);

        return acc;
      }, {});

      return res.status(400).json({
        success: false,
        errors: formatted,
      });
    }

    req.validated = matchedData(req, {
      locations: ["body", "query", "params"],
    });

    return next();
  };
};

module.exports = validateError;

const mongoose = require("mongoose");

/** Express middleware: validate req.params[paramName] is a valid ObjectId */
function validateMongoId(paramName = "id") {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id." });
    }
    next();
  };
}

module.exports = { validateMongoId };

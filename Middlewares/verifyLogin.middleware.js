// External Module
const jwt = require("jsonwebtoken");

// Middleware
const verifyLoginMiddleware = async (req, res, next) => {
  try {
    const headersToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(headersToken, process.env.JWT_TOKEN);
    req.email = decoded.email;
    req.name = decoded.name;
    req.userID = decoded.userID;
    next();
  } catch (err) {
    res.status(401).send("Failed To Verify Login");
  }
};

// Export
module.exports = verifyLoginMiddleware;

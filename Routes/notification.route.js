// External Module
const express = require("express");
const verifyLoginMiddleware = require("../Middlewares/verifyLogin.middleware.js");
// Internal Module
const {
  sendAlert,
  CheckAPI,
} = require("../Controllers/notification.controller.js");

// Router Init
const notificationRoute = express.Router();

// User Register
notificationRoute.post("/send-alert", verifyLoginMiddleware, sendAlert());
notificationRoute.get("/check-api", CheckAPI());

module.exports = notificationRoute;

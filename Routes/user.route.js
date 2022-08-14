// External Module
const express = require("express");
// Internal Module
const {
  userRegister,
  userLogin,
  updateUserLocation,
  updateSpecificUserLocation,
  updateUserWorkLocation,
  getWorkLocation,
  subscribeForNotifications,
  getSubscription,
  updateAllDocuments,
  nearbyRiverByLocation,
  subscribeForWorkplaceNotifications,
  getWorkSubscription,
} = require("../Controllers/user.controller.js");
const verifyLoginMiddleware = require("../Middlewares/verifyLogin.middleware.js");

// Router Init
const userRoute = express.Router();

// User Register
userRoute.post("/register", userRegister("customer"));

// User Login
userRoute.post("/login", userLogin("customer"));

// updateUserLocation
userRoute.post("/update-location", verifyLoginMiddleware, updateUserLocation());

// Update Work Location
userRoute.post(
  "/update-work-location",
  verifyLoginMiddleware,
  updateUserWorkLocation()
);

// Get Work Location
userRoute.get("/work-location", verifyLoginMiddleware, getWorkLocation());

// GetSubscription
userRoute.get("/get-subscription", verifyLoginMiddleware, getSubscription());
userRoute.get(
  "/get-work-subscription",
  verifyLoginMiddleware,
  getWorkSubscription()
);

// subscribeForNotifications
userRoute.post(
  "/subscribe-for-notifications",
  verifyLoginMiddleware,
  subscribeForNotifications()
);

// Subscribe for Work Place notifications
userRoute.post(
  "/subscribe-for-work-notifications",
  verifyLoginMiddleware,
  subscribeForWorkplaceNotifications()
);

// update specific user location
userRoute.post("/update-specific-user-location", updateSpecificUserLocation());

// Update All Documents for subscription
userRoute.get("/update-all-documents", updateAllDocuments());

userRoute.get(
  "/nearby-location",
  verifyLoginMiddleware,
  nearbyRiverByLocation()
);

module.exports = userRoute;

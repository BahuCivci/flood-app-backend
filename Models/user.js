// External Import
const mongoose = require("mongoose");

// Init Schema
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    dropDups: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  workLocation: {
    type: String,
    required: false,
  },
  // Alert Details - Alerts are stored in the object below
  alerts: {
    stationID: {
      type: String,
      required: false,
    },
    riverName: {
      type: String,
      required: false,
    },
    timestamp: {
      type: Date,
      required: false,
    },
  },
  workAlert: {
    stationID: {
      type: String,
      required: false,
    },
    riverName: {
      type: String,
      required: false,
    },
    timestamp: {
      type: Date,
      required: false,
    },
  },
  subscription: {
    type: Boolean,
    default: false,
    required: false,
  },
  workSubscription: {
    type: Boolean,
    default: false,
    required: false,
  },
  // Latitude and Longitude of the user location (optional)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  },
});

// Model Init
const userModel = new mongoose.model("userModel", userSchema);
userModel.createIndexes();

module.exports = userModel;

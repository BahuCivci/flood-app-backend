// External Import
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const userModel = require("../Models/user.js");
const geolib = require("geolib");

const { stringify, parse } = require("flatted");

// Internal Import
const sendNotification = require("../Utils/sendNotification.js");
const sendMail = require("../Utils/sendNotification.js");

const sendAlert = (userType) => {
  return async (req, res) => {
    console.log("Request Received", req.body);
    const email = req.email;
    try {
      if (email) {
        sendNotification(req.name, req.email, req.body, "alert");
        res.status(200).json({
          email: req.email,
          msg: "Alert Sent",
          content: req.body.content,
        });
      } else {
        res.status(409).json({
          msg: "Email Not Found",
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        msg: "Server Error",
        err: err,
      });
    }
  };
};

const KMtoM = (km) => {
  return km * 1000;
};
const CheckAPI = () => {
  return async (req, res) => {
    res.status(200).json({
      msg: "API Checked",
    });
  };
};

module.exports = {
  sendAlert,
  CheckAPI,
};

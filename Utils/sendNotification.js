const google = require("googleapis").google;
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const notificationEmailFormal = require("./notificationEmailFormat.js");
const verifyLoginMiddleware = require("../Middlewares/verifyLogin.middleware.js");
const customMail = require("./customMail.js");
const workAlertMail = require("./workAlertMail.js");
const noRisk = require("./noRisk.js");

dotenv.config();
// These id's and secrets should come from .env file.
const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendMail = async (name, email, content, alert) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    var transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        type: "OAuth2",
        user: ADMIN_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    let htmlMail = "";
    let title = "";

    if (alert == "alert") {
      title = "Red Alert! Flood Warning";
      htmlMail = notificationEmailFormal(
        name,
        title,
        content,
        "https://www.google.com/"
      );
    }
    if (alert == "continue") {
      title = "Flood Warning for Live Location";
      htmlMail = customMail(name, title, content, "https://www.google.com/");
    }

    if (alert == "noRisk") {
      title = "Flood Alert Updates";
      htmlMail = noRisk(name, title, content, "https://www.google.com/");
    }

    if (alert == "workplace") {
      title = "Flood Warning for Workplace Location";
      htmlMail = workAlertMail(name, title, content, "https://www.google.com/");
    }

    var mailOptions = {
      from: "Flood App ",
      to: email,
      subject: title,
      html: htmlMail,
    };

    transport.sendMail(mailOptions, function (err, resp) {
      if (err) {
        console.log(err);
      } else {
        console.log("Message Sent", resp);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendMail;

const google = require("googleapis").google;
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const emailFormat = require("./emailFormat.js");

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

const sendMail = async (name, email, verifyFor) => {
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

    if (verifyFor == "signup") {
      title = "Welcome To The Family";
      htmlMail = emailFormat(name, title, "https://www.google.com/");
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

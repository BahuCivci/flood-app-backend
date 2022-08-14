const schedule = require("node-schedule");
const axios = require("axios");
const geolib = require("geolib");
const userModel = require("../Models/user");
const sendMail = require("./sendNotification");

// const BASE_URL = "https://environment.data.gov.uk/flood-monitoring/id/";

// KM to meters
const KMtoM = (km) => {
  return km * 1000;
};

const checkUpdateForLiveLocation = () => {
  return async () => {
    try {
      const users = await userModel.find({
        location: {
          $exists: true,
        },
      });

      const URL1 =
        "https://check-for-flooding.service.gov.uk/api/stations.geojson";
      const data = await axios.get(URL1);

      const atRisk = data.data.features.filter(
        (feature) => feature.properties.atrisk === true
      );

      users.map(async (user) => {
        if (user.location.coordinates && user.location.coordinates.length > 0) {
          const userLat = user.location.coordinates[0];
          const userLong = user.location.coordinates[1];
          const dist = 3;
          const atRiskNearby = atRisk.filter((feature) => {
            const checkNearby = geolib.isPointWithinRadius(
              { latitude: userLat, longitude: userLong },
              {
                latitude: feature.geometry.coordinates[1],
                longitude: feature.geometry.coordinates[0],
              },
              KMtoM(dist)
            );
            return checkNearby;
          });
          let previousAlertSent = "nostamp";

          // Hours to milliseconds
          const hoursToMilliseconds = (hours) => {
            return hours * 60 * 60 * 1000;
          };
          const hoursToCheck = hoursToMilliseconds(3);

          if (user.alerts && user.alerts.timestamp) {
            console.log("timestamp", user.alerts.timestamp);
            previousAlertSent = user.alerts.timestamp;
            if (previousAlertSent > Date.now() - hoursToCheck) {
              console.log("Workplace Already alerted");
              console.log(user.name);
              return;
            }
          }

          if (atRiskNearby.length > 0 && user.subscription) {
            console.log(
              "Nearby River: ",
              atRiskNearby[0].properties.river_name
            );
            console.log("Station Name", atRiskNearby[0].properties.name);
            console.log("Nearby User: ", user.email);
            sendMail(
              user.name,
              user.email,
              {
                label: atRiskNearby[0].properties.river_name,
                stationName: atRiskNearby[0].properties.name,
              },
              "continue"
            );
            // Insert Alert info into the user object (alerts)
            await userModel.findOneAndUpdate(
              { email: user.email },
              {
                alerts: {
                  stationID: atRiskNearby[0].id,
                  riverName: atRiskNearby[0].properties.river_name,
                  timestamp: Date.now(),
                },
              },
              { new: true }
            );
          } else {
            console.log("No user nearby at risk river");
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  };
};

const checkUpdateForWorkLocation = () => {
  return async () => {
    try {
      const users = await userModel.find({
        workLocation: { $exists: true },
      });

      const URL1 =
        "https://check-for-flooding.service.gov.uk/api/stations.geojson";
      const data = await axios.get(URL1);

      const atRisk = data.data.features.filter(
        (feature) => feature.properties.atrisk === true
      );

      users.map(async (user) => {
        if (!user.workSubscription) {
          return console.log(
            user.name,
            " User has not subscribed for work location"
          );
        }
        if (user.workLocation) {
          const atRiskNearby = atRisk.filter((feature) => {
            const checkNearby =
              feature.properties.river_name === user.workLocation;
            return checkNearby;
          });

          let previousAlertSent = "nostamp";
          // Hours to milliseconds
          const hoursToMilliseconds = (hours) => {
            return hours * 60 * 60 * 1000;
          };
          const hoursToCheck = hoursToMilliseconds(3);
          if (user.workAlert && user.workAlert.timestamp) {
            previousAlertSent = user.workAlert.timestamp;
            if (previousAlertSent > Date.now() - hoursToCheck) {
              console.log("Workplace Already alerted");
              console.log(user.name);
              return;
            }
          }

          if (atRiskNearby.length > 0 && user.subscription) {
            console.log(
              "Nearby River: ",
              atRiskNearby[0].properties.river_name
            );
            console.log("Station Name", atRiskNearby[0].properties.name);
            console.log("Nearby User: ", user.email);
            sendMail(
              user.name,
              user.email,
              {
                label: atRiskNearby[0].properties.river_name,
                stationName: atRiskNearby[0].properties.name,
              },
              "workplace"
            );
            // Insert Alert info into the user object (alerts)
            await userModel.findOneAndUpdate(
              { email: user.email },
              {
                workAlert: {
                  stationID: atRiskNearby[0].id,
                  riverName: atRiskNearby[0].properties.river_name,
                  timestamp: Date.now(),
                },
              },
              { new: true }
            );
          } else {
            console.log("No user nearby at risk river");
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  };
};

const checkAlertsAndNotifyIfBecomesLow = () => {
  return async () => {
    try {
      const users = await userModel.find({
        alerts: {
          $exists: true,
        },
      });
      const URL1 =
        "https://check-for-flooding.service.gov.uk/api/stations.geojson";
      const data = await axios.get(URL1);
      users.map(async (user) => {
        if (user.alerts.stationID && user.alerts.riverName) {
          const previousAlertedRiver = data.data.features.find(
            (feature) => feature.id === user.alerts.stationID
          );
          if (previousAlertedRiver.properties.atrisk) {
            console.log(
              "User ",
              user.email,
              " is still at risk of flooding at ",
              previousAlertedRiver.properties.river_name
            );
          } else {
            sendMail(
              user.name,
              user.email,
              {
                label: previousAlertedRiver.properties.river_name,
                stationName: previousAlertedRiver.properties.name,
              },
              "noRisk"
            );
            await userModel.findByIdAndUpdate(
              user._id,
              {
                alerts: {
                  stationID: "",
                  riverName: "",
                  timestamp: "",
                },
              },
              { new: true }
            );
            console.log("No longer at risk");
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  };
};

const checkWorkAlertsAndNotifyIfBecomesLow = () => {
  return async () => {
    try {
      const users = await userModel.find({
        workAlert: {
          $exists: true,
        },
      });
      const URL1 =
        "https://check-for-flooding.service.gov.uk/api/stations.geojson";
      const data = await axios.get(URL1);
      users.map(async (user) => {
        if (user.workAlert.stationID && user.workAlert.riverName) {
          const previousAlertedRiver = data.data.features.find(
            (feature) => feature.id === user.workAlert.stationID
          );
          if (previousAlertedRiver.properties.atrisk) {
            console.log(
              "User ",
              user.email,
              " is still at risk of flooding at ",
              previousAlertedRiver.properties.river_name
            );
          } else {
            sendMail(
              user.name,
              user.email,
              {
                label: previousAlertedRiver.properties.river_name,
                stationName: previousAlertedRiver.properties.name,
              },
              "noRisk"
            );
            await userModel.findByIdAndUpdate(
              user._id,
              {
                workAlert: {
                  stationID: "",
                  riverName: "",
                  timestamp: "",
                },
              },
              { new: true }
            );
            console.log("No longer at risk");
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  };
};

// Every minute * * * * *
// Every hour 0 * * * *
// Every 3 hours 0 */3 * * *
// Every 2 hours 0 */2 * * *

// Checking live Location for alerts
schedule.scheduleJob("* * * * *", checkUpdateForLiveLocation());

// // Checking work location for alerts
schedule.scheduleJob("* * * * *", checkUpdateForWorkLocation());

// // Checking Live location sent alerts for becoming low
schedule.scheduleJob("* * * * *", checkAlertsAndNotifyIfBecomesLow());

// // Checking Work location sent alerts for becoming low
schedule.scheduleJob("* * * * *", checkWorkAlertsAndNotifyIfBecomesLow());

const http = require("http");
const https = require("https");
const express = require("express");
const app = express();
const cors = require("cors");
const { mail } = require("./Mail/SendMail");
const Mail = new mail();
const { MongoClient } = require("mongodb");
var url = "mongodb://localhost:27017/";

const websitesArray = require("./website.model");
const websiteLog = require("./websiteLog.model");

var date_time = new Date();
const mongoServices = require("./mongoServices");
app.use(express.json());
app.use(cors());

// const websites = ["https://akinolabs.com", "https://akinolabs.io", "https://aloissolutions.com", "https://aloissolutions.com.au", "https://adrivaservices.com", "https://aloiscomposites.com", "https://aloishealthcare.com", "https://careers.aloissolutions.com", "https://aloisexports.com", "https://solohpartners.com", "https://aloistechnologies.com/"]

app.get("/", async (req, res) => {
  res.send("status.akinolabs.com");
});

// app.post("/data", async (req, res) => {
//   console.log(req.body.website);
//   const x = [];
//   Tiny("website.tiny", function (err, db) {
//     db.all(`${req.body.website}`, function (err, data) {
//       console.log(data);
//       x.push(data);
//     });
//   });
//   res.send(x);
// });

app.post("/", async (req, res) => {
  const websites = await mongoServices.readDocument("websitesArray");

  const checkPromises = websites.map((url) => checkWebsiteStatus(url.url));
  Promise.all(checkPromises)
    .then((results) => {
      console.log(results);
      res.send(results);
    })
    .then(() => {
      console.log("Data sent to the API successfully.");
    })
    .catch((error) => {
      console.error("Error sending data to the API:", error.message);
    });
});

app.post("/upload", async (req, res) => {
  const website = req.body;
  try {
    await mongoServices.createDocument("websitesArray", req.body);
    res.send("uploaded");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.listen(process.env.PORT, (req, res) => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
function checkWebsiteStatus(url, status) {
  const protocol = url.startsWith("https://") ? https : http;
  return new Promise((resolve, reject) => {
    protocol
      .get(url, (res) => {
        if (
          res.statusCode === 200 ||
          res.statusCode === 403 ||
          res.statusCode === 301
        ) {
          console.log(`${url} is live`);
          if (status === "down") {
            mongoServices.updateDocument(
              "websitesArray",
              { url: `${url}` },
              { status: "live" }
            );
            resolve({
              url,
              status: "live",
              errorCode: "-",
              error: "-",
            });
          } else {
            resolve(null);
          }
        } else {
          console.log(`${url} is down`);
          if (status === "live") {
            mongoServices.updateDocument(
              "websitesArray",
              { url: `${url}` },
              { status: "down" }
            );
            mongoServices.createDocument("Error Logs", {
              url: url,
              status: "down",
              statusMessage: res.statusMessage,
              statusCode: res.statusCode,
              time: date_time,
            });
            resolve({
              url,
              status: "down",
              errorCode: res.statusCode,
              error: res.statusMessage,
            });
          } else {
            resolve(null);
          }
        }
      })
      .on("error", (err) => {
        console.log(`${url} is down`);
        if (status === "down") {
          mongoServices.updateDocument(
            "websitesArray",
            { url: `${url}` },
            { status: "live" }
          );
          mongoServices.createDocument("Error Logs", {
            url: url,
            status: "down",
            statusMessage: err.message,
            time: date_time,
          });
          resolve({ url, status: "down", errorCode: "-", error: err.message });
        } else {
          resolve(null);
        }
      });
  });
}

const receivers = [{ email: "akash.kurup@aloissolutions.com" }];
// const receivers = [{ email: "karanmegha99@gmail.com" }];

async function abc() {
  console.log(
    "----------------------------start------------------------------"
  );
  const websites = await mongoServices.readDocument("websitesArray");
  var result = [];
  for (let i = 0; i < websites.length; i++) {
    const status = await checkWebsiteStatus(
      websites[i].url,
      websites[i].status
    );
    if (status != null) {
      result.push(status);
    }
  }
  console.log(date_time);
  if (result.length > 0) {
    console.log(result);
    const html = `
      <table border="1">
      <thead>
        <tr>
          <th>URL</th>
          <th>Status</th>
          <th>Status Code</th>
          <th>Error</th>
        </tr>
        </thead>
        ${result
          .map(
            (i) =>
              `
            <tr>
              <td>${i.url}</td>
              <td>${i.status}</td>
              <td>${i.errorCode}</td>
              <td>${i.error}</td>
            </tr>
          `
          )
          .join("")}
      </table>
      `;
    await Mail.sendMail(
      receivers,
      "Website Status",
      "The status of the websites are shown below",
      html
    );
  }
  console.log(
    "-----------------------------end-------------------------------"
  );
}
abc();
const intervalId = setInterval(abc, 900000);

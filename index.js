const http = require('http');
const https = require('https');
const express = require('express')
const app = express()
const cors = require('cors');
const { mail } = require('./Mail/SendMail');
const Mail = new mail;
const port = 4000
app.use(express.json());
app.use(cors())

const websites = ["https://akinolabs.com", "https://app.akinolabs.com", "https://sso.akinolabs.com", "https://cicd.akinolabs.com"]

app.post('/', async(req, res) => {
  Promise.all(checkPromises)
  .then((results) => {
    console.log(results);
    res.send(results)
  })
  .then(() => {
    console.log('Data sent to the API successfully.');
  })
  .catch((error) => {
    console.error('Error sending data to the API:', error.message);
  });
})

app.post('/upload', (req,res) => {
  const website = req.body.website;
  websites.push(website)
  res.send("ok")
})

app.listen(port, (req,res) => {
  console.log(`Example app listening on port ${port}`)
})


function checkWebsiteStatus(url) {
  const protocol = url.startsWith('https://') ? https : http;

  return new Promise((resolve, reject) => {
    protocol.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve({ url, status: 'live' });
      } else {
        // Mail.sendMail()
        resolve({ url, status: 'down', statusCode: res.statusCode });
      }
    }).on('error', (err) => {
      resolve({ url, status: 'down', error: err.message });
    });
  });
}

const checkPromises = websites.map((url) => checkWebsiteStatus(url));
function abc(){
  websites.map((url) => checkWebsiteStatus(url))
}

const intervalId = setInterval(abc(), 5000);


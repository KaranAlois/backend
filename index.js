const http = require('http');
const https = require('https');
const express = require('express')
const app = express()
const cors = require('cors');
const { mail } = require('./Mail/SendMail');
const Mail = new mail;
app.use(express.json());
app.use(cors())

const websites = ["https://akinolabs.com", "https://akinolabs.io", "https://aloissolutions.com", "https://aloissolutions.com.au", "https://adrivaservices.com", "https://aloiscomposites.com", "https://aloishealthcare.com", "https://careers.aloissolutions.com", "https://https://aloisexports.com"]

app.get('/', (req,res)=>{
  console.log("abc");
  res.send("Status.akinolabs.com")
})


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

app.listen(process.env.PORT, (req,res) => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})

const receivers = [ { email:'akash.kurup@aloissolutions.com'}]


function checkWebsiteStatus(url) {
  const protocol = url.startsWith('https://') ? https : http;

  return new Promise((resolve, reject) => {
    protocol.get(url, (res) => {
      if (res.statusCode === 200 || res.statusCode===403 || res.statusCode===301) {
        console.log(`${url} is live`);
        resolve({ url, status: 'live' });
        // console.log("-------------------------------------");
      } else {
        console.log(`${url} is down`);
        Mail.sendMail(receivers,"Server is down", `${url} is down due to ${res.statusMessage} error`)
        resolve({ url, status: 'down', statusCode: res.statusCode });
        // console.log("-------------------------------------");
      }
    }).on('error', (err) => {
      console.log(`${url} is down`);
      resolve({ url, status: 'down', error: err.message });
      Mail.sendMail(receivers,"Server is down", `${url} is down to ${err.message} error`)
      console.log("-------------------------------------");
    });
  });
}

const checkPromises = websites.map((url) => checkWebsiteStatus(url));
function abc(){
  for(let i=0;i<websites.length;i++){
    checkWebsiteStatus(websites[i])
  }
  // websites.map((url) => checkWebsiteStatus(url))
}

const intervalId = setInterval(abc, 1800000);


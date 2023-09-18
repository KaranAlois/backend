const http = require('http');
const https = require('https');
const express = require('express')
const app = express()
const cors = require('cors');
const { mail } = require('./Mail/SendMail');
const Mail = new mail;
var Tiny = require('tiny')
app.use(express.json());
app.use(cors())

const websites = ["https://akinolabs.com", "https://akinolabs.io", "https://aloissolutions.com", "https://aloissolutions.com.au", "https://adrivaservices.com", "https://aloiscomposites.com", "https://aloishealthcare.com", "https://careers.aloissolutions.com", "https://aloisexports.com", "https://solohpartners.com", "https://aloistechnologies.com/"]


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

const receivers = [ { email:'karanmegha99@gmail.com'}]

var status = {url:"",status:""}
var web = []
function checkWebsiteStatus(url) {
  const protocol = url.startsWith('https://') ? https : http;

  return new Promise((resolve, reject) => {
    protocol.get(url, (res) => {
      if (res.statusCode === 200 || res.statusCode===403 || res.statusCode===301) {
        Tiny('website.tiny', function(err, db) {
          db.get(`${url}`, function(err, data) {
            try{
            if(data.status==="down")
            Mail.sendMail(receivers,"Server is live now", `${url} is live!`)
            }
            catch(error){
              db.set(`${url}`, {
                status: 'live',
                code: ''
              }, function(err) {
                console.log('set!');
              });
            }
          });
          db.update(`${url}`, {
            status: 'live',
          }, function(err) {
            console.log('set!');
          });
        });
        console.log(`${url} is live`);
        resolve({ url, status: 'live' });
        // console.log("-------------------------------------");
      } else {
        console.log(`${url} is down`);
        Tiny('website.tiny', function(err, db) {
          db.get(`${url}`, function(err, data) {
            if(data.status==="live")
              Mail.sendMail(receivers,"Server is down", `${url} is down due to ${res.statusMessage} error`)
          });
          db.update(`${url}`, {
            status: 'down',
            code: res.statusMessage
          }, function(err) {
            console.log('set!');
          });
        });
        resolve({ url, status: 'down', statusCode: res.statusCode });
        // console.log("-------------------------------------");
      }
    }).on('error', (err) => {
      console.log(`${url} is down`);
      Tiny('website.tiny', function(er, db) {
        db.get(`${url}`, function(er, data) {
          if(data.status==="live")
          Mail.sendMail(receivers,"Server is down", `${url} is down to ${err.message} error`)
        });
        db.set(`${url}`, {
          status: 'down',
          code: err.message,
        }, function(err) {
          console.log('set!');
        });
      });
      resolve({ url, status: 'down', error: err.message });
      // console.log("-------------------------------------");
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

const intervalId = setInterval(abc, 900000);



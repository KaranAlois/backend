const http = require('http');
const https = require('https');
const express = require('express')
const app = express()
const cors = require('cors');
const { mail } = require('./Mail/SendMail');
const Mail = new mail;
const { MongoClient } = require('mongodb');
var url = "mongodb://localhost:27017/";

const websitesArray = require('./website.model')
const websiteLog = require('./websiteLog.model')

var date_time = new Date();
var Tiny = require('tiny');
const mongoServices = require('./mongoServices');
app.use(express.json());
app.use(cors())

// const websites = ["https://akinolabs.com", "https://akinolabs.io", "https://aloissolutions.com", "https://aloissolutions.com.au", "https://adrivaservices.com", "https://aloiscomposites.com", "https://aloishealthcare.com", "https://careers.aloissolutions.com", "https://aloisexports.com", "https://solohpartners.com", "https://aloistechnologies.com/"]


app.get('/', async(req,res)=>{
  
  res.send("Status.akinolabs.com")
})

app.post('/data', async(req,res)=>{
  console.log(req.body.website);
  const x = []
  Tiny('website.tiny', function(err, db) {
    db.all(`${req.body.website}`, function(err, data) {
      console.log(data);
      x.push(data)
    });
  });
  res.send(x)
})


app.post('/', async(req, res) => {
  const websites = await mongoServices.readDocument("websitesArray")

  const checkPromises = websites.map((url) => checkWebsiteStatus(url.url));
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

app.post('/upload', async(req,res) => {
  const website = req.body;
  try{
  await mongoServices.createDocument("websitesArray",req.body)
  res.send("uploaded")
  }
  catch(err){
    console.log(err);
    res.send(err)
  }
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
          try{
          db.get(`${url}`, function(err, data) {
            if(data.status==="live")
              Mail.sendMail(receivers,"Server is down", `${url} is down due to ${res.statusMessage} error`)
          });
          }
          catch(error){
            db.set(`${url}`, {
              status: 'down',
              code: res.statusMessage
            }, function(err) {
              console.log('set!');
            });
          }
          db.update(`${url}`, {
            status: 'down',
            code: res.statusMessage
          }, function(err) {
            console.log('set!');
          });
        });
        mongoServices.createDocument("Error Logs", {"url":url, "status":"down","statusMessage":res.statusMessage, "statusCode":res.statusCode, "time": date_time})
        resolve({ url, status: 'down', statusCode: res.statusCode });
        // console.log("-------------------------------------");
      }
    }).on('error', (err) => {
      console.log(`${url} is down`);
      Tiny('website.tiny', function(er, db) {
        try{
        db.get(`${url}`, function(er, data) {
          if(data.status==="live")
          Mail.sendMail(receivers,"Server is down", `${url} is down to ${err.message} error`)
        });
        }
        catch(err){
          db.set(`${url}`, {
            status: 'down',
            code: err.message,
          }, function(err) {
            console.log('set!');
          });
        }
        db.set(`${url}`, {
          status: 'down',
          code: err.message,
        }, function(err) {
          console.log('set!');
        });
      });
      mongoServices.createDocument("Error Logs", {"url":url, "status":"down","statusMessage":err.message, "time":date_time})
      resolve({ url, status: 'down', error: err.message });
      // console.log("-------------------------------------");
    });
  });
}

async function abc(){
  const websites = await mongoServices.readDocument("websitesArray")
  for(let i=0;i<websites.length;i++){
    checkWebsiteStatus(websites[i].url)
  }
}
abc()
const intervalId = setInterval(abc, 900000);



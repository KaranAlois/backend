const nodemailer = require("nodemailer");
// var fs = require('fs')
// import nodemailer from 'nodemailer';
require('dotenv').config()

class mail{
    constructor(){
        console.log("Herer====.",process.env.SMTP_USERID);
        this.email = process.env.SMTP_USERID
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
              user: process.env.SMTP_USERID,
              pass: process.env.SMTP_PASSWORD
            },
          });
    }

    async sendMail(receiver,subject,text){
        try{
        for(let i=0;i<receiver.length;i++){
        const info = await this.transporter.sendMail({
            from: this.email,
            to:receiver[i].email,
            subject:subject,
            text:text
        })
        console.log("Message sent: %s", info.messageId);
    }
    }
    catch(err){
        console.log(err);
    }
    }

    async sendMailWithAttachment(receiver,subject,message,attachment){
         try{
            for(let i=0;i<receiver.length;i++){
            const info = await this.transporter.sendMail({
                from:this.email,
                to:receiver[i].email,
                subject:subject,
                text:message,
                attachments: attachment
            })
            console.log("Message sent: %s", info.messageId);
        }
        }
        catch(err){
            console.log(err);
        }
}
}

module.exports = {mail}
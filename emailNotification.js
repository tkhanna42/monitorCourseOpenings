"use strict";

// import env variables
require('dotenv').config();

const nodemailer = require("nodemailer");

const sendEmail = async (content) => {
    const gmailCredentials = {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PASS,
    };

    // create gmail transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: gmailCredentials,
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: gmailCredentials.user,
        to: gmailCredentials.user,
        subject: "Notification from monitorCourses",
        html: content ? content : "<p>Here's the default notification from monitorCourses</p>",
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions)

    console.log("Email sent, Id: %s", info.messageId);
}

module.exports = sendEmail;

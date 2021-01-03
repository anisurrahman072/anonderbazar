module.exports.email = {
    service: "SMTP",
    // hostname:"smtp.mailgun.org",
    auth: {
        user: "anonderbazar@bitspeck.com",
        pass: "$$RI42HR)SF]",
    },
    host: 'mail.bitspeck.com',
    port: 587,
    templateDir: "api/emailTemplates",
    from: "anonderbazar@bitspeck.com",
    testMode: false,
    secure: false,
    tls: {
        rejectUnauthorized: false
    }
}

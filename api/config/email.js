module.exports.email = {
    service: "Gmail",
    auth: {
        user: "info@anonderbazar.com",
        pass: "hKLv1m8c%dy0",
    },
    host: 'smtp.gmail.com',
    port: 465,
    templateDir: "api/emailTemplates",
    from: "info@anonderbazar.com",
    testMode: false,
    secure: true,
    tls: {
        rejectUnauthorized: false
    }
}

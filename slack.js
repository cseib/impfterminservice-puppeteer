const https = require('https');

function sendMessage (msg) {
    const data = JSON.stringify({
        text: msg
    })

    const options = {
        hostname: 'hooks.slack.com',
        port: 443,
        path: process.env.SLACK_WEBHOOK,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }

    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', d => {
            process.stdout.write(d);
        })
    })

    req.on('error', error => {
        console.error(error);
    })

    req.write(data);
    req.end();
}

module.exports = {
    sendMessage
}
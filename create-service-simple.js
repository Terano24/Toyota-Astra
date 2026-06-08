// Simple script to create Twilio Conversations service
const https = require('https');
const querystring = require('querystring');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const postData = querystring.stringify({
  'FriendlyName': 'Auto2000 Chat Service'
});

const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

const options = {
  hostname: 'conversations.twilio.com',
  port: 443,
  path: '/v1/Services',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Basic ${auth}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.sid) {
        console.log('✅ Service created successfully!');
        console.log(`Service SID: ${response.sid}`);
        console.log(`\nUpdate your .env file with:`);
        console.log(`TWILIO_CONVERSATIONS_SERVICE_SID=${response.sid}`);
      } else {
        console.log('❌ Error response:', data);
      }
    } catch (error) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

req.write(postData);
req.end();

// Test Twilio service connection directly
require('dotenv').config();
const Twilio = require('twilio');

async function testServiceConnection() {
  try {
    console.log('Testing Twilio service connection...');
    console.log('Service SID:', process.env.TWILIO_CONVERSATIONS_SERVICE_SID);
    
    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Test 1: Verify service exists
    const service = await client.conversations.v1.services(process.env.TWILIO_CONVERSATIONS_SERVICE_SID).fetch();
    console.log('✅ Service found:', service.friendlyName);
    console.log('Service status:', service.status);

    // Test 2: Generate a test token
    const AccessToken = Twilio.jwt.AccessToken;
    const ChatGrant = AccessToken.ChatGrant;

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      {
        identity: 'test_customer_123',
        ttl: 3600,
      }
    );

    const chatGrant = new ChatGrant({
      serviceSid: process.env.TWILIO_CONVERSATIONS_SERVICE_SID,
    });
    token.addGrant(chatGrant);

    const jwt = token.toJwt();
    console.log('✅ Token generated successfully');
    console.log('Token length:', jwt.length);
    
    // Decode token to check contents
    const tokenParts = jwt.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('Token payload:', JSON.stringify(payload, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
  }
}

testServiceConnection();

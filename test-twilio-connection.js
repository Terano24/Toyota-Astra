const dotenv = require('dotenv').config({ path: './functions/.env' });
const Twilio = require('twilio');

// Use the exact same credentials from your .env file
const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testTwilioConnection() {
  try {
    console.log('🔍 Testing Twilio API Key and Token Generation...');
    console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID);
    console.log('API Key SID:', process.env.TWILIO_API_KEY_SID);
    console.log('Service SID:', process.env.TWILIO_CONVERSATIONS_SERVICE_SID);
    
    // Test 1: Basic account access with Auth Token
    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('✅ Account Status:', account.status);
    console.log('✅ Account Type:', account.type);
    
    // Test 2: Service access
    const service = await client.conversations.v1.services(process.env.TWILIO_CONVERSATIONS_SERVICE_SID).fetch();
    console.log('✅ Service found:', service.friendlyName);
    
    // Test 3: Token generation with API Key
    const AccessToken = Twilio.jwt.AccessToken;
    const ChatGrant = AccessToken.ChatGrant;
    
    console.log('\n🎫 Testing JWT Token Generation...');
    
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
    console.log('✅ JWT Token generated successfully');
    console.log('Token length:', jwt.length);
    console.log('Token starts with:', jwt.substring(0, 50) + '...');
    
    // Test 4: Decode token to verify contents
    const tokenParts = jwt.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('\n🔍 Token payload:');
    console.log('- Issuer (iss):', payload.iss);
    console.log('- Subject (sub):', payload.sub);
    console.log('- Identity:', payload.identity);
    console.log('- Grants:', Object.keys(payload.grants || {}));
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    
    if (error.code === 20003) {
      console.log('\n💡 Authentication failed - check your API Key credentials');
    }
    if (error.code === 20404) {
      console.log('\n💡 Resource not found - check your Service SID');
    }
    
    return false;
  }
}

testTwilioConnection();

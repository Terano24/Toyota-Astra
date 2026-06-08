const twilio = require('twilio');

// Load environment variables
require('dotenv').config();

const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

console.log('🔍 Testing Twilio Token Generation...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
console.log('TWILIO_API_KEY_SID:', process.env.TWILIO_API_KEY_SID ? '✅ Set' : '❌ Missing');
console.log('TWILIO_API_KEY_SECRET:', process.env.TWILIO_API_KEY_SECRET ? '✅ Set' : '❌ Missing');
console.log('TWILIO_CONVERSATIONS_SERVICE_SID:', process.env.TWILIO_CONVERSATIONS_SERVICE_SID ? '✅ Set' : '❌ Missing');
console.log();

// Test token generation
try {
    console.log('🎫 Generating test token...');
    
    const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
        {
            identity: 'test_user_123',
            ttl: 3600
        }
    );

    const chatGrant = new ChatGrant({
        serviceSid: process.env.TWILIO_CONVERSATIONS_SERVICE_SID
    });
    
    token.addGrant(chatGrant);
    
    const jwt = token.toJwt();
    
    console.log('✅ Token generated successfully!');
    console.log('Token length:', jwt.length);
    console.log('Token preview:', jwt.substring(0, 50) + '...');
    console.log();
    
    // Test token validation by creating a client
    console.log('🔗 Testing token with Twilio client...');
    
    const { Client } = require('@twilio/conversations');
    
    const client = new Client(jwt);
    
    client.on('stateChanged', (state) => {
        console.log('Connection state:', state);
        if (state === 'initialized') {
            console.log('✅ Token validation successful!');
            process.exit(0);
        } else if (state === 'failed') {
            console.log('❌ Token validation failed!');
            process.exit(1);
        }
    });
    
    client.on('tokenExpired', () => {
        console.log('🔄 Token expired');
    });
    
    client.on('tokenAboutToExpire', () => {
        console.log('⚠️ Token about to expire');
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
        console.log('⏰ Test timeout - connection taking too long');
        process.exit(1);
    }, 10000);
    
} catch (error) {
    console.log('❌ Token generation failed:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
    process.exit(1);
}

const Twilio = require('twilio');
require('dotenv').config({ path: './functions/.env' });

async function createTwilioService() {
  try {
    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    console.log('Creating Twilio Conversations Service...');
    
    const service = await client.conversations.v1.services.create({
      friendlyName: 'Auto2000 Live Chat Service'
    });

    console.log('✅ Twilio Service Created Successfully!');
    console.log(`Service SID: ${service.sid}`);
    console.log(`\nUpdate your .env file with:`);
    console.log(`TWILIO_CONVERSATIONS_SERVICE_SID=${service.sid}`);
    
    return service.sid;
  } catch (error) {
    console.error('❌ Error creating Twilio service:', error.message);
    
    if (error.code === 20003) {
      console.log('\n🔑 Authentication failed. Please check your Twilio credentials:');
      console.log('- TWILIO_ACCOUNT_SID');
      console.log('- TWILIO_AUTH_TOKEN');
    }
  }
}

createTwilioService();

const Twilio = require('twilio');
require('dotenv').config({ path: './functions/.env' });

async function verifyTwilioService() {
  try {
    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const serviceSid = 'IS66634675e5f5481a8b3aca6415c6591f';
    
    console.log('🔍 Verifying Twilio Service...');
    console.log(`Account SID: ${process.env.TWILIO_ACCOUNT_SID}`);
    console.log(`Service SID: ${serviceSid}`);
    
    // Try to fetch the service details
    const service = await client.conversations.v1.services(serviceSid).fetch();
    
    console.log('✅ Service found successfully!');
    console.log(`Service Name: ${service.friendlyName}`);
    console.log(`Service SID: ${service.sid}`);
    console.log(`Date Created: ${service.dateCreated}`);
    
    // Try to list conversations in this service
    console.log('\n🔍 Testing conversation creation...');
    const conversations = await client.conversations.v1.services(serviceSid).conversations.list({ limit: 5 });
    console.log(`Found ${conversations.length} existing conversations`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verifying service:', error.message);
    console.error(`Error Code: ${error.code}`);
    console.error(`Status: ${error.status}`);
    
    if (error.code === 20404) {
      console.log('\n💡 Service not found. Possible issues:');
      console.log('1. Service SID is incorrect');
      console.log('2. Service was deleted');
      console.log('3. Service belongs to different account');
    }
    
    if (error.code === 20003) {
      console.log('\n🔑 Authentication failed. Check your credentials.');
    }
    
    return false;
  }
}

verifyTwilioService();

const Twilio = require('twilio');
require('dotenv').config({ path: './functions/.env' });

async function listTwilioServices() {
  try {
    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    console.log('🔍 Fetching your Twilio Conversations services...\n');
    
    const services = await client.conversations.v1.services.list();
    
    if (services.length === 0) {
      console.log('❌ No Conversations services found.');
      return;
    }

    console.log('✅ Found Conversations services:');
    console.log('=' .repeat(60));
    
    services.forEach((service, index) => {
      console.log(`${index + 1}. Service Name: ${service.friendlyName}`);
      console.log(`   Service SID: ${service.sid}`);
      console.log(`   Date Created: ${service.dateCreated}`);
      console.log('-'.repeat(40));
    });

    console.log('\n📝 Copy the Service SID and update your .env file:');
    console.log(`TWILIO_CONVERSATIONS_SERVICE_SID=${services[0].sid}`);
    
  } catch (error) {
    console.error('❌ Error fetching services:', error.message);
    
    if (error.code === 20003) {
      console.log('\n🔑 Authentication failed. Check your credentials in functions/.env');
    }
  }
}

listTwilioServices();

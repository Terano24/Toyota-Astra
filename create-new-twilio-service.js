const Twilio = require('twilio');

async function createNewService() {
  try {
    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    console.log('🔧 Creating new Twilio Conversations service...');
    
    const service = await client.conversations.v1.services.create({
      friendlyName: 'Auto2000 Live Chat Service'
    });

    console.log('✅ New service created successfully!');
    console.log(`Service SID: ${service.sid}`);
    console.log(`Service Name: ${service.friendlyName}`);
    console.log(`Date Created: ${service.dateCreated}`);
    
    console.log('\n📝 Update your environment files:');
    console.log(`TWILIO_CONVERSATIONS_SERVICE_SID=${service.sid}`);
    
    return service.sid;
  } catch (error) {
    console.error('❌ Error creating service:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.status);
    
    if (error.code === 20003) {
      console.log('\n🔑 Authentication failed. Please check your Twilio credentials.');
    }
  }
}

createNewService();

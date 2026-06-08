const Twilio = require('twilio');
require('dotenv').config({ path: './functions/.env' });

async function createConversationsService() {
  try {
    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    console.log('🔧 Creating new Twilio Conversations service...\n');
    
    // Create a new Conversations service
    const service = await client.conversations.v1.services.create({
      friendlyName: 'Auto2000 Way Halim Chat Service'
    });

    console.log('✅ Conversations service created successfully!');
    console.log('=' .repeat(60));
    console.log(`Service Name: ${service.friendlyName}`);
    console.log(`Service SID: ${service.sid}`);
    console.log(`Date Created: ${service.dateCreated}`);
    console.log('=' .repeat(60));

    console.log('\n📝 Update your .env file with this Service SID:');
    console.log(`TWILIO_CONVERSATIONS_SERVICE_SID=${service.sid}`);
    
    return service.sid;
    
  } catch (error) {
    console.error('❌ Error creating service:', error.message);
    
    if (error.code === 20003) {
      console.log('\n🔑 Authentication failed. Check your credentials in functions/.env');
    } else if (error.code === 20429) {
      console.log('\n⏰ Rate limit exceeded. Wait a moment and try again.');
    }
    
    throw error;
  }
}

createConversationsService()
  .then(serviceSid => {
    console.log(`\n🎉 Success! Your new service SID is: ${serviceSid}`);
  })
  .catch(error => {
    console.error('Failed to create service:', error.message);
  });

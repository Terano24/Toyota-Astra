# Twilio Chat Setup Guide

To enable the live chat functionality, you need to configure Twilio Conversations API credentials.

## Required Steps:

### 1. Create Twilio API Key
1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Account > API Keys & Tokens**
3. Click **Create API Key**
4. Give it a name like "Auto2000 Chat API Key"
5. Copy the **SID** and **Secret** (you won't be able to see the secret again)

### 2. Create Conversations Service
1. In Twilio Console, go to **Conversations > Services**
2. Click **Create new Service**
3. Give it a name like "Auto2000 Chat Service"
4. Copy the **Service SID**

### 3. Update Environment Variables
Edit the file `functions/.env.astra-c196c` and replace the placeholder values:

```bash
# Replace these with your actual Twilio credentials:
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret_here
TWILIO_CONVERSATIONS_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Deploy Functions
After updating the environment variables, deploy the functions:

```bash
firebase deploy --only functions
```

## Testing the Chat
1. Start your React app: `npm start`
2. Open the landing page
3. The chat widget should appear in the bottom-right corner
4. Try sending a message to test the functionality

## Troubleshooting
- Check the Firebase Functions logs: `firebase functions:log`
- Verify all environment variables are set correctly
- Make sure your Twilio account has sufficient credits
- Check that the Conversations API is enabled in your Twilio account

## Current Status
❌ **Chat functionality is currently disabled** because the Twilio Conversations API credentials are not configured.

Once you complete the setup above, the chat system will be fully functional with:
- Customer-to-salesperson chat assignment
- Real-time messaging
- Message history
- Integration with existing inquiry system

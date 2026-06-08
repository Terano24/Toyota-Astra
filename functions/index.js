const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Load environment variables
require("dotenv").config();

// Simple CORS function for chat endpoints
const handleCors = (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");
  
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true; // Indicates preflight was handled
  }
  return false; // Continue with normal processing
};
const Twilio = require("twilio");

// Set global options
setGlobalOptions({
  region: "us-central1",
});

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

  // This function triggers when a new inquiry is created in Firestore.
  exports.sendWhatsAppNotification = onDocumentCreated(
      "inquiries/{inquiryId}",
      async (event) => {
        logger.info(`[START] Processing inquiry: ${event.params.inquiryId}`);

        const snap = event.data;
        if (!snap) {
        logger.error("[ABORT] No data associated with the event.");
        return;
      }

      const inquiryData = snap.data();
      logger.info("[DEBUG] Inquiry data:", JSON.stringify(inquiryData, null, 2));
      const {assignedTo, name, model} = inquiryData;

      logger.info("[DEBUG] Extracted values:");
      logger.info(`[DEBUG] - name: '${name}'`);
      logger.info(`[DEBUG] - model: '${model}'`);
      logger.info(`[DEBUG] - assignedTo:`, JSON.stringify(assignedTo, null, 2));

      if (!assignedTo || !assignedTo.email) {
        logger.error(
            "[ABORT] Inquiry is missing 'assignedTo' field or email.",
        );
        logger.error("[DEBUG] assignedTo value:", JSON.stringify(assignedTo));
        return;
      }

      const assignedSalesperson = assignedTo.email;
      logger.info(`[DEBUG] Looking for salesperson: ${assignedSalesperson}`);

      try {
        // Get Twilio credentials from environment variables
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
        const contentSid = process.env.TWILIO_CONTENT_SID;

        logger.info("[DEBUG] Environment variables check:");
        logger.info(`[DEBUG] TWILIO_ACCOUNT_SID: ${accountSid ? "SET" : "NOT SET"}`);
        logger.info(`[DEBUG] TWILIO_AUTH_TOKEN: ${authToken ? "SET" : "NOT SET"}`);
        logger.info(`[DEBUG] TWILIO_PHONE_NUMBER: ${phoneNumber ? "SET" : "NOT SET"}`);
        logger.info(`[DEBUG] TWILIO_CONTENT_SID: ${contentSid ? "SET" : "NOT SET"}`);

        if (!accountSid || !authToken || !phoneNumber || !contentSid) {
          logger.error("[ABORT] Missing Twilio environment variables");
          return;
        }
        logger.info("[DEBUG] Twilio environment variables loaded successfully");

        // Fetch the salesperson's document to get their contact number
        const salesmenRef = db.collection("salesmen");
        logger.info(`[DEBUG] Searching for salesperson with email: ${assignedSalesperson}`);
        const snapshot = await salesmenRef
            .where("email", "==", assignedSalesperson)
            .limit(1)
            .get();

        if (snapshot.empty) {
          logger.error(
              `[ABORT] Salesperson not found for email: ${assignedSalesperson}`,
          );
          return;
        }

        const salespersonData = snapshot.docs[0].data();
        logger.info(`[DEBUG] Found salesperson:`, JSON.stringify(salespersonData));
        const {contactNumber} = salespersonData;

        if (!contactNumber) {
          logger.error(
              `[ABORT] Salesperson ${assignedSalesperson} ` +
              "is missing a contact number.",
          );
          return;
        }
        logger.info(`[DEBUG] Contact number: ${contactNumber}`);

        // Format phone numbers properly for WhatsApp
        // Ensure phone numbers are in E.164 format (starting with +)
        let formattedContactNumber = contactNumber;
        if (!contactNumber.startsWith("+")) {
          // If it starts with 0, replace with +62 (Indonesia)
          if (contactNumber.startsWith("0")) {
            formattedContactNumber = "+62" + contactNumber.substring(1);
          } else if (!contactNumber.startsWith("62")) {
            // If it doesn't start with country code, add +62
            formattedContactNumber = "+62" + contactNumber;
          } else {
            // If it starts with 62, add +
            formattedContactNumber = "+" + contactNumber;
          }
        }

        let formattedPhoneNumber = phoneNumber;
        if (!phoneNumber.startsWith("+")) {
          if (phoneNumber.startsWith("0")) {
            formattedPhoneNumber = "+62" + phoneNumber.substring(1);
          } else if (!phoneNumber.startsWith("62")) {
            formattedPhoneNumber = "+62" + phoneNumber;
          } else {
            formattedPhoneNumber = "+" + phoneNumber;
          }
        }

        // Construct WhatsApp message details
        const fromNumber = `whatsapp:${formattedPhoneNumber}`;
        const toNumber = `whatsapp:${formattedContactNumber}`;
        logger.info(`[DEBUG] Sending message from ${fromNumber} to ${toNumber}`);

        // Additional detailed logging
        logger.info(`[DEBUG] Raw contactNumber from inquiry: ${contactNumber}`);
        logger.info(
            `[DEBUG] Formatted contactNumber: ${formattedContactNumber}`,
        );
        logger.info(`[DEBUG] Final WhatsApp toNumber: ${toNumber}`);
        logger.info(
            `[DEBUG] Raw phoneNumber from environment variable: ${phoneNumber}`,
        );
        logger.info(`[DEBUG] Formatted phoneNumber: ${formattedPhoneNumber}`);
        logger.info(`[DEBUG] Final WhatsApp fromNumber: ${fromNumber}`);

        logger.info(
            `[DEBUG] Message content variables: name=${name}, model=${model}`,
        );
        logger.info(`[DEBUG] Content SID: ${contentSid}`);

        // Initialize Twilio client
        const client = new Twilio(accountSid, authToken);
        logger.info(`[DEBUG] Twilio client initialized`);

        // Use ONLY the approved Twilio Content SID template
        // NO manual messages - only approved templates for compliance
        const messageParams = {
          from: fromNumber,
          to: toNumber,
          contentSid: contentSid,
          contentVariables: {
            "1": name,
            "2": model,
          },
        };

        logger.info(`[DEBUG] Using Twilio Content SID template:`);
        logger.info(`[DEBUG] From: ${fromNumber}`);
        logger.info(`[DEBUG] To: ${toNumber}`);
        logger.info(`[DEBUG] Content SID: ${contentSid}`);
        logger.info(`[DEBUG] Template Variables:`, JSON.stringify({
          "1": name,
          "2": model,
        }));

        // Send the message using approved template ONLY
        const message = await client.messages.create(messageParams);

        logger.info(`[SUCCESS] Message sent successfully! SID: ${message.sid}`);
        logger.info(`[SUCCESS] Message status: ${message.status}`);

        // Auto-activate the salesman when message is successfully sent
        try {
          const salesmenRef = db.collection("salesmen");
          const salesmanQuery = await salesmenRef
              .where("email", "==", assignedSalesperson)
              .limit(1)
              .get();

          if (!salesmanQuery.empty) {
            const salesmanDoc = salesmanQuery.docs[0];
            await salesmanDoc.ref.update({
              isActive: true,
              lastMessageSent: new Date().toISOString(),
            });
            logger.info(`[SUCCESS] Auto-activated salesman: ${assignedSalesperson}`);
          }
        } catch (activationError) {
          logger.error("[WARNING] Failed to auto-activate salesman:", activationError.message);
          // Don't throw error here as the main message was sent successfully
        }
      } catch (error) {
        logger.error("[FATAL] Twilio error occurred:", {
          code: error.code,
          status: error.status,
          message: error.message,
          moreInfo: error.moreInfo
        });

        // Specific handling for error 20422
        if (error.code === 20422) {
          logger.error("[ERROR 20422] Invalid Parameter - Check: phone format, content template variables, content SID validity, WhatsApp Business Account config");
        }

        // Re-throw the error so it appears in Cloud Functions logs
        throw error;
      }
    });

// WhatsApp Opt-in Handler - Handles incoming messages for opt-in compliance
exports.handleWhatsAppOptIn = onRequest(
  {
    cors: true,
    invoker: "public"
  },
  async (req, res) => {
  try {
    logger.info("[START] Processing incoming WhatsApp message for opt-in");

    const {Body, From, To} = req.body;
    const incomingMessage = Body?.toLowerCase().trim();
    const senderNumber = From?.replace("whatsapp:", "");

    logger.info(`[DEBUG] Incoming message: "${Body}" from ${senderNumber}`);

    // Define opt-in commands
    const OPT_IN_COMMANDS = ["join auto2000", "start", "subscribe", "opt in"];
    const OPT_OUT_COMMANDS = ["stop", "unsubscribe", "opt out", "leave"];

    const client = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
    );

    // Check if message is an opt-in command
    if (OPT_IN_COMMANDS.some((cmd) => incomingMessage.includes(cmd))) {
      logger.info(`[OPT-IN] User ${senderNumber} is opting in`);

      // Store opt-in consent in Firestore
      await db.collection("whatsapp_opt_ins").doc(senderNumber).set({
        phoneNumber: senderNumber,
        optedIn: true,
        optInDate: admin.firestore.FieldValue.serverTimestamp(),
        optInMethod: "whatsapp_command",
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send confirmation message
      await client.messages.create({
        from: To,
        to: From,
        body: `✅ Terima kasih! Anda telah berhasil mendaftar untuk menerima notifikasi dari Auto2000 Way Halim.\n\n` +
              `Anda akan menerima pemberitahuan tentang:\n` +
              `• Inquiry baru yang ditugaskan kepada Anda\n` +
              `• Update status pelanggan\n\n` +
              `Untuk berhenti menerima pesan, kirim "STOP"`,
      });

      logger.info(`[SUCCESS] Opt-in completed for ${senderNumber}`);
    } else if (OPT_OUT_COMMANDS.some((cmd) => incomingMessage.includes(cmd))) {
      logger.info(`[OPT-OUT] User ${senderNumber} is opting out`);

      // Update opt-out status
      await db.collection("whatsapp_opt_ins").doc(senderNumber).set({
        phoneNumber: senderNumber,
        optedIn: false,
        optOutDate: admin.firestore.FieldValue.serverTimestamp(),
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});

      // Send confirmation message
      await client.messages.create({
        from: To,
        to: From,
        body: `✅ Anda telah berhasil berhenti berlangganan dari notifikasi Auto2000 Way Halim.\n\n` +
              `Untuk berlangganan kembali, kirim "JOIN AUTO2000"`,
      });

      logger.info(`[SUCCESS] Opt-out completed for ${senderNumber}`);
    } else {
      // Unknown command - send help message
      logger.info(`[INFO] Unknown command from ${senderNumber}, sending help`);

      await client.messages.create({
        from: To,
        to: From,
        body: `🔔 Auto2000 Way Halim WhatsApp Notifications\n\n` +
              `Untuk menerima notifikasi inquiry, kirim:\n` +
              `"JOIN AUTO2000"\n\n` +
              `Untuk berhenti menerima notifikasi, kirim:\n` +
              `"STOP"\n\n` +
              `Info lebih lanjut: https://toyotawayhalim.com`,
      });
    }

    res.status(200).send("OK");
  } catch (error) {
    logger.error("[ERROR] WhatsApp opt-in handler failed:", error);
    res.status(500).send("Error processing message");
  }
});

// Helper function to check if user has opted in
const checkWhatsAppOptIn = async (phoneNumber) => {
  try {
    const optInDoc = await db.collection("whatsapp_opt_ins").doc(phoneNumber).get();

    if (!optInDoc.exists) {
      logger.info(`[OPT-IN] No opt-in record found for ${phoneNumber}`);
      return false;
    }

    const optInData = optInDoc.data();
    const hasOptedIn = optInData.opted_in === true;

    logger.info(`[OPT-IN] User ${phoneNumber} opt-in status: ${hasOptedIn}`);
    return hasOptedIn;
  } catch (error) {
    logger.error(`[OPT-IN] Error checking opt-in status for ${phoneNumber}:`, error);
    return false;
  }
};

// ==========================================
// TWILIO CONVERSATIONS CHAT FUNCTIONS

// Generate access token for customer chat
exports.generateChatAccessToken = onRequest(
  {
    cors: true,
    invoker: "public"
  },
  async (req, res) => {
    // Handle CORS
    if (handleCors(req, res)) return;
  
  try {
    logger.info("[CHAT] Generating customer access token");
    const {customerEmail, customerName, customerId, identity} = req.body;
    
    // Use customerId as primary identity, fallback to customerEmail or identity
    const userIdentity = customerId || customerEmail || identity;
    
    if (!userIdentity) {
      logger.error("[CHAT] Missing identity in request");
      return res.status(400).json({error: "Missing identity (customerId, customerEmail, or identity required)"});
    }
    
    logger.info(`[CHAT] Generating token for identity: ${userIdentity}`);
    logger.info(`[CHAT] Customer details - Name: ${customerName}, Email: ${customerEmail}, CustomerId: ${customerId}`);
        const AccessToken = Twilio.jwt.AccessToken;
        const ChatGrant = AccessToken.ChatGrant;

        // Use environment variables directly (they should be set in deployment)
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const apiKeySid = process.env.TWILIO_API_KEY_SID;
        const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
        const serviceSid = process.env.TWILIO_CONVERSATIONS_SERVICE_SID;

        logger.info(`[CHAT] Account SID: ${accountSid}`);
        logger.info(`[CHAT] Service SID: ${serviceSid}`);
        logger.info(`[CHAT] API Key SID: ${apiKeySid}`);

        // Validate required environment variables
        if (!accountSid) {
          logger.error("[CHAT] Missing TWILIO_ACCOUNT_SID");
          return res.status(500).json({error: "Missing Account SID"});
        }
        if (!apiKeySid) {
          logger.error("[CHAT] Missing TWILIO_API_KEY_SID");
          return res.status(500).json({error: "Missing API Key SID"});
        }
        if (!apiKeySecret) {
          logger.error("[CHAT] Missing TWILIO_API_KEY_SECRET");
          return res.status(500).json({error: "Missing API Key Secret"});
        }
        if (!serviceSid) {
          logger.error("[CHAT] Missing TWILIO_CONVERSATIONS_SERVICE_SID");
          return res.status(500).json({error: "Missing Service SID"});
        }

        // Use API Key for token generation (required for Conversations)
        logger.info(`[CHAT] Creating AccessToken with API Key credentials`);
        const token = new AccessToken(
            accountSid,
            apiKeySid,
            apiKeySecret,
            {
              identity: userIdentity,
              ttl: 3600, // 1 hour
            },
        );

        logger.info(`[CHAT] Adding ChatGrant with service SID`);
        const chatGrant = new ChatGrant({
          serviceSid: serviceSid,
        });
        token.addGrant(chatGrant);

        const jwt = token.toJwt();
        logger.info(`[CHAT] JWT token generated, length: ${jwt.length}`);
        logger.info(`[CHAT] JWT starts with: ${jwt.substring(0, 50)}...`);

        res.json({token: jwt});
        logger.info(`[CHAT] Token sent successfully for ${userIdentity}`);
  } catch (error) {
    logger.error("[CHAT] Error generating token:", error);
    res.status(500).json({error: "Failed to generate token"});
  }
});

// Generate access token for salesperson chat
exports.generateSalespersonChatToken = onRequest(
  {
    cors: true,
    invoker: "public"
  },
  async (req, res) => {
    // Handle CORS
    if (handleCors(req, res)) return;
  
  try {
    logger.info("[CHAT] Generating salesperson access token");

    const {salespersonEmail} = req.body;

    if (!salespersonEmail) {
      logger.error("[CHAT] Missing salespersonEmail");
      return res.status(400).json({error: "Missing salespersonEmail"});
    }

        const AccessToken = Twilio.jwt.AccessToken;
        const ChatGrant = AccessToken.ChatGrant;

        // Check if we have API keys, fallback to Account SID/Auth Token
        const apiKeySid = process.env.TWILIO_API_KEY_SID &&
            process.env.TWILIO_API_KEY_SID !== "PLACEHOLDER_API_KEY_SID" ?
            process.env.TWILIO_API_KEY_SID :
            process.env.TWILIO_ACCOUNT_SID;

        const apiKeySecret = process.env.TWILIO_API_KEY_SECRET &&
            process.env.TWILIO_API_KEY_SECRET !== "PLACEHOLDER_API_KEY_SECRET" ?
            process.env.TWILIO_API_KEY_SECRET :
            process.env.TWILIO_AUTH_TOKEN;

        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            apiKeySid,
            apiKeySecret,
            {
              identity: salespersonEmail,
              ttl: 3600, // 1 hour
            },
    );

    const chatGrant = new ChatGrant({
      serviceSid: process.env.TWILIO_CONVERSATIONS_SERVICE_SID,
    });

    token.addGrant(chatGrant);

    logger.info(`[CHAT] Generated token for salesperson: ${salespersonEmail}`);

    res.json({
      token: token.toJwt(),
      identity: salespersonEmail,
    });
  } catch (error) {
    logger.error("[CHAT] Error generating salesperson token:", error);
    res.status(500).json({error: "Failed to generate token"});
  }
});

// Create or get conversation between customer and salesperson
exports.createOrGetConversation = onRequest(
  {
    cors: true,
    invoker: "public"
  },
  async (req, res) => {
    // Handle CORS
    if (handleCors(req, res)) return;
  
  try {
    logger.info("[CHAT] Creating or getting conversation");
    logger.info(`[CHAT] Using Service SID: ${process.env.TWILIO_CONVERSATIONS_SERVICE_SID}`);
    const {customerEmail, salespersonEmail, customerName, customerId} = req.body;
    
    // Use customerId as primary identifier, fallback to customerEmail
    const customerIdentity = customerId || customerEmail;
    
    if (!customerIdentity || !salespersonEmail || !customerName) {
      return res.status(400).json({error: "Missing required fields"});
    }
    
    logger.info(`[CHAT] Customer Identity: ${customerIdentity}, Salesperson: ${salespersonEmail}`);
    
    const twilioClient = new Twilio(
        process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN,
    );
    const serviceSid = process.env.TWILIO_CONVERSATIONS_SERVICE_SID;
    const uniqueName = `chat_${customerIdentity}_${salespersonEmail}`;
    let conversation;
    try {
      conversation = await twilioClient.conversations.v1
          .services(serviceSid).conversations(uniqueName).fetch();
      logger.info(`[CHAT] Found existing conversation: ${conversation.sid}`);
    } catch (error) {
      if (error.code === 20404) {
        logger.info(`[CHAT] Creating new conversation with uniqueName: ${uniqueName}`);
        conversation = await twilioClient.conversations.v1
            .services(serviceSid).conversations.create({
              uniqueName,
              friendlyName: `Chat with ${customerName}`,
              attributes: JSON.stringify({
                customerEmail, 
                salespersonEmail, 
                customerId,
                customerIdentity,
              }),
            });
        await twilioClient.conversations.v1.services(serviceSid)
            .conversations(conversation.sid)
            .participants.create({identity: customerIdentity});
        await twilioClient.conversations.v1.services(serviceSid)
            .conversations(conversation.sid)
            .participants.create({identity: salespersonEmail});
        logger.info(`[CHAT] Created new conversation: ${conversation.sid}`);
      } else {
        throw error;
      }
    }
    res.status(200).json({conversationSid: conversation.sid});
  } catch (error) {
    logger.error("[CHAT] Error in createOrGetConversation:", error);
    res.status(500).json({error: "Failed to process conversation"});
  }
});

// Delete user from Firebase Authentication and Firestore
exports.deleteUser = onRequest(
  {
    cors: true,
    invoker: "public"
  },
  async (req, res) => {
    // Set CORS headers manually
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
      try {
        // Verify this is a POST request
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const { email, salesmanId, adminEmail } = req.body;

        // Basic validation
        if (!email || !salesmanId || !adminEmail) {
          return res.status(400).json({ 
            error: 'Missing required fields: email, salesmanId, adminEmail' 
          });
        }

        logger.info(`[DELETE_USER] Admin ${adminEmail} requesting deletion of user ${email} (ID: ${salesmanId})`);

        // Verify the requesting user is an admin (v2.1 - with debug logging)
        try {
          logger.info(`[DELETE_USER] Checking admin permissions for: ${adminEmail}`);
          const adminConfigRef = db.collection('site_content').doc('admins');
          const adminConfigSnap = await adminConfigRef.get();
          
          if (!adminConfigSnap.exists) {
            logger.error('[DELETE_USER] Admin configuration document does not exist');
            return res.status(403).json({ error: 'Admin verification failed - config not found' });
          }
          
          const adminData = adminConfigSnap.data();
          logger.info(`[DELETE_USER] Admin document data:`, JSON.stringify(adminData));
          
          const adminEmails = adminData.email || [];
          logger.info(`[DELETE_USER] Admin emails array:`, JSON.stringify(adminEmails));
          logger.info(`[DELETE_USER] Checking if ${adminEmail} is in admin emails`);
          
          if (!Array.isArray(adminEmails)) {
            logger.error(`[DELETE_USER] Admin emails is not an array: ${typeof adminEmails}`);
            return res.status(403).json({ error: 'Admin configuration invalid - emails not array' });
          }
          
          if (!adminEmails.includes(adminEmail)) {
            logger.warn(`[DELETE_USER] User ${adminEmail} is not in admin emails list`);
            return res.status(403).json({ error: 'Insufficient permissions. Admin role required.' });
          }
          
          logger.info(`[DELETE_USER] Admin verification successful for ${adminEmail}`);
        } catch (verifyError) {
          logger.error('[DELETE_USER] Admin verification error:', verifyError);
          return res.status(500).json({ error: 'Failed to verify admin permissions' });
        }

        // Step 1: Delete from Firestore
        try {
          await db.collection('salesmen').doc(salesmanId).delete();
          logger.info(`[DELETE_USER] Successfully deleted Firestore document for ${email}`);
        } catch (firestoreError) {
          logger.error('[DELETE_USER] Firestore deletion error:', firestoreError);
          return res.status(500).json({ error: 'Failed to delete from database' });
        }

        // Step 2: Delete from Firebase Authentication
        try {
          // Get user by email first
          const userRecord = await admin.auth().getUserByEmail(email);
          
          // Delete the user
          await admin.auth().deleteUser(userRecord.uid);
          logger.info(`[DELETE_USER] Successfully deleted Firebase Auth user ${email} (UID: ${userRecord.uid})`);
          
          return res.status(200).json({ 
            success: true, 
            message: `User ${email} has been completely removed from the system`,
            deletedFromFirestore: true,
            deletedFromAuth: true
          });
          
        } catch (authError) {
          // If user doesn't exist in Auth, that's okay - they're already gone
          if (authError.code === 'auth/user-not-found') {
            logger.info(`[DELETE_USER] User ${email} not found in Firebase Auth (already deleted or never existed)`);
            return res.status(200).json({ 
              success: true, 
              message: `User ${email} removed from database. Auth account was already deleted or never existed.`,
              deletedFromFirestore: true,
              deletedFromAuth: false,
              authNote: 'User not found in Authentication'
            });
          }
          
          logger.error('[DELETE_USER] Firebase Auth deletion error:', authError);
          return res.status(500).json({ 
            error: 'Failed to delete from authentication system',
            details: authError.message,
            firestoreDeleted: true
          });
        }

      } catch (error) {
        logger.error('[DELETE_USER] Unexpected error:', error);
        return res.status(500).json({ 
          error: 'An unexpected error occurred',
          details: error.message 
        });
      }
  }
);

// Webhook handler for Twilio Conversations
exports.handleTwilioWebhook = onRequest(
  {
    cors: true,
    invoker: "public"
  },
  (req, res) => {
  cors(req, res, async () => {
    try {
      logger.info("[WEBHOOK] Received event:", req.body.EventType);
      if (req.body.EventType === "onMessageSent") {
        const {ConversationSid, Body, Author, Attributes} = req.body;
        const attributes = JSON.parse(Attributes || "{}");
        const messageData = {
          conversationSid: ConversationSid,
          messageSid: req.body.MessageSid,
          body: Body,
          author: Author,
          timestamp: new Date(req.body.DateCreated),
          customerEmail: attributes.customerEmail,
          salespersonEmail: attributes.salespersonEmail,
        };
        await admin.firestore().collection("chatConversations")
            .doc(ConversationSid)
            .collection("messages").doc(messageData.messageSid).set(messageData);
      }
      res.status(200).send("OK");
    } catch (error) {
      logger.error("[WEBHOOK] Error:", error);
      res.status(500).send("Error");
    }
  });
});

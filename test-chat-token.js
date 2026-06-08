const fetch = require('node-fetch');

async function testChatToken() {
  try {
    console.log('Testing chat token generation...');
    
    const response = await fetch('https://generatechataccesstoken-hpxnqdjnga-uc.a.run.app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerEmail: 'test@auto2000.temp',
        customerName: 'Test Customer',
        customerId: 'customer_test_123'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Token response:', data);
    
    // Test token validity by decoding JWT
    if (data.token) {
      const tokenParts = data.token.split('.');
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log('Token payload:', JSON.stringify(payload, null, 2));
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testChatToken();

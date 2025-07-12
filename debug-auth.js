// ============================================================================
// DEBUG AUTHENTICATION ISSUE
// ============================================================================
// Compare request formats between test page and React frontend

const API_URL = 'https://khoaugment-api.bangachieu2.workers.dev';

// Test credentials
const credentials = {
  email: 'admin@truongphat.com',
  password: 'admin123'
};

console.log('🔍 DEBUG: Testing authentication with different request formats');
console.log('API URL:', API_URL);
console.log('Credentials:', credentials);

// Test 1: Simple fetch (like test page)
async function testSimpleFetch() {
  console.log('\n📝 Test 1: Simple fetch (like test page)');
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response:', data);
    
    return { success: response.ok, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}

// Test 2: With additional headers (like React frontend)
async function testWithHeaders() {
  console.log('\n📝 Test 2: With additional headers (like React frontend)');
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'Khochuan-POS-Frontend',
        'X-Client-Version': '1.0.0',
        'X-Company': 'Truong-Phat-Computer'
      },
      body: JSON.stringify(credentials)
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response:', data);
    
    return { success: response.ok, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}

// Test 3: Different payload format
async function testDifferentPayload() {
  console.log('\n📝 Test 3: Different payload format');
  
  const payloads = [
    // Format 1: Direct credentials
    credentials,
    
    // Format 2: Wrapped in data
    { data: credentials },
    
    // Format 3: With additional fields
    { 
      ...credentials,
      remember: true,
      clientInfo: {
        userAgent: 'Debug-Script',
        timestamp: new Date().toISOString()
      }
    }
  ];
  
  for (let i = 0; i < payloads.length; i++) {
    console.log(`\n  📋 Payload ${i + 1}:`, payloads[i]);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloads[i])
      });
      
      console.log(`  Status: ${response.status}`);
      
      const data = await response.json();
      console.log(`  Response:`, data);
      
      if (response.ok) {
        console.log(`  ✅ SUCCESS with payload ${i + 1}!`);
        return { success: true, data, payloadIndex: i };
      }
    } catch (error) {
      console.error(`  Error with payload ${i + 1}:`, error);
    }
  }
  
  return { success: false };
}

// Test 4: Check backend logs
async function testBackendLogs() {
  console.log('\n📝 Test 4: Check backend health and logs');
  
  try {
    const response = await fetch(`${API_URL}/health`);
    console.log('Health Status:', response.status);
    
    const data = await response.json();
    console.log('Health Response:', data);
    
    return { success: response.ok, data };
  } catch (error) {
    console.error('Health Error:', error);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive authentication debug tests...');
  console.log('='.repeat(80));
  
  const results = {
    simpleFetch: await testSimpleFetch(),
    withHeaders: await testWithHeaders(),
    differentPayload: await testDifferentPayload(),
    backendLogs: await testBackendLogs()
  };
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY OF RESULTS:');
  console.log('='.repeat(80));
  
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${test}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (results.simpleFetch.success) {
    console.log('✅ Simple fetch works - issue is likely in React frontend implementation');
  } else if (results.withHeaders.success) {
    console.log('✅ Headers matter - check React frontend headers');
  } else if (results.differentPayload.success) {
    console.log('✅ Payload format matters - check React frontend payload structure');
  } else {
    console.log('❌ All tests failed - backend authentication is broken');
  }
  
  return results;
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testSimpleFetch, testWithHeaders, testDifferentPayload, testBackendLogs };
} else {
  // Run in browser
  runAllTests().then(results => {
    console.log('\n🏁 Debug tests completed!');
  });
}

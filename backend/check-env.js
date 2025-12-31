// Environment Validation Script
// Run with: node check-env.js

require('dotenv').config();

console.log('🔍 Checking Environment Configuration...\n');

const required = [
  'MONGO_URI',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const optional = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'PORT',
  'FRONTEND_URL'
];

let allGood = true;

console.log('✅ REQUIRED VARIABLES:');
required.forEach(key => {
  if (process.env[key]) {
    console.log(`   ✓ ${key}: ${maskValue(key, process.env[key])}`);
  } else {
    console.log(`   ✗ ${key}: MISSING ⚠️`);
    allGood = false;
  }
});

console.log('\n📋 OPTIONAL VARIABLES:');
optional.forEach(key => {
  if (process.env[key]) {
    console.log(`   ✓ ${key}: ${maskValue(key, process.env[key])}`);
  } else {
    console.log(`   - ${key}: not set (optional)`);
  }
});

console.log('\n🔐 JWT SECRET STRENGTH:');
if (process.env.JWT_SECRET) {
  const length = process.env.JWT_SECRET.length;
  if (length >= 32) {
    console.log(`   ✓ Length: ${length} chars (good)`);
  } else {
    console.log(`   ⚠️ Length: ${length} chars (recommend 32+)`);
  }
}

console.log('\n📧 EMAIL CONFIGURATION:');
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log('   ✓ Email credentials configured');
  if (process.env.EMAIL_USER.includes('@gmail.com')) {
    console.log('   ℹ️ Using Gmail - ensure App Password is used, not regular password');
  }
} else {
  console.log('   ⚠️ Email not configured - OTP emails will not be sent');
}

console.log('\n💳 PAYMENT GATEWAY:');
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  console.log('   ✓ Razorpay configured');
  if (process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_')) {
    console.log('   ℹ️ Using TEST mode (good for development)');
  } else if (process.env.RAZORPAY_KEY_ID.startsWith('rzp_live_')) {
    console.log('   ⚠️ Using LIVE mode - ensure this is intentional!');
  }
} else {
  console.log('   ⚠️ Razorpay not configured - payment features will not work');
}

console.log('\n🗄️ DATABASE:');
if (process.env.MONGO_URI) {
  if (process.env.MONGO_URI.includes('mongodb://localhost')) {
    console.log('   ℹ️ Using local MongoDB');
  } else if (process.env.MONGO_URI.includes('mongodb+srv://')) {
    console.log('   ℹ️ Using MongoDB Atlas (cloud)');
  } else {
    console.log('   ℹ️ Using custom MongoDB connection');
  }
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 You can start the server with: npm run start:dev');
} else {
  console.log('⚠️ Some required variables are missing!');
  console.log('📝 Please update your .env file before starting the server');
  console.log('📚 See .env.example for reference');
}
console.log('='.repeat(50) + '\n');

// Helper function to mask sensitive values
function maskValue(key, value) {
  const sensitiveKeys = ['SECRET', 'PASS', 'KEY', 'URI'];
  if (sensitiveKeys.some(k => key.includes(k))) {
    if (value.length <= 8) {
      return '*'.repeat(value.length);
    }
    return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
  }
  return value;
}

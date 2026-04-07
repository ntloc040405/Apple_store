import dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables
const requiredEnvs = ['JWT_SECRET', 'MONGODB_URI'];
const missing = requiredEnvs.filter(env => !process.env[env]);

if (missing.length > 0) {
  console.error(`\n❌ CRITICAL: Missing required environment variables: ${missing.join(', ')}`);
  console.error('Please add them to your .env file before starting the server.\n');
  process.exit(1);
}

export default {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
};

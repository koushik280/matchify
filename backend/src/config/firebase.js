const admin = require('firebase-admin');

// Read the JSON string from environment variable
const serviceAccount = process.env.FIREBASE_ADMIN_SDK 
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK) 
  : null;

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
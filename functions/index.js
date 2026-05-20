const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.promoteAdmin = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { uid, adminCode, appId } = req.body || {};

    if (!uid || !adminCode || !appId) {
      return res.status(400).json({ error: 'uid, adminCode, appId are required.' });
    }

    const expectedCode = process.env.ADMIN_PROMOTION_CODE;
    if (!expectedCode) {
      return res.status(500).json({ error: 'ADMIN_PROMOTION_CODE is not configured.' });
    }

    if (adminCode !== expectedCode) {
      return res.status(403).json({ error: 'Invalid admin code.' });
    }

    const userRef = admin.firestore().doc(`artifacts/${appId}/users/${uid}`);
    await userRef.set(
      {
        role: 'admin',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

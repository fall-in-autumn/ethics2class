const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.promoteAdmin = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { uid, appId, adminCode } = req.body || {};
    if (!uid || !appId || !adminCode) {
      return res.status(400).json({ error: 'uid, appId, adminCode are required' });
    }

    const expected = process.env.ADMIN_PROMOTION_CODE;
    if (!expected) return res.status(500).json({ error: 'ADMIN_PROMOTION_CODE not configured' });
    if (adminCode !== expected) return res.status(403).json({ error: 'Invalid admin code' });

    await admin.firestore()
      .doc(`artifacts/${appId}/users/${uid}`)
      .set({ role: 'admin', updatedAt: new Date().toISOString() }, { merge: true });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

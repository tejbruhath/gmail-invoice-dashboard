import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// Get user settings
router.get('/settings', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings email name picture');
    res.json({ user });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
router.patch('/settings', authenticate, async (req, res) => {
  try {
    const { autoSync, syncFrequency, categories } = req.body;

    const updates = {};
    if (autoSync !== undefined) updates['settings.autoSync'] = autoSync;
    if (syncFrequency) updates['settings.syncFrequency'] = syncFrequency;
    if (categories) updates['settings.categories'] = categories;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('settings email name picture');

    res.json({ user });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Delete all user data
router.delete('/data', authenticate, async (req, res) => {
  try {
    // Delete all invoices
    await Invoice.deleteMany({ userId: req.user._id });

    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.clearCookie('token');
    res.json({ message: 'All data deleted successfully' });
  } catch (error) {
    console.error('Delete data error:', error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

// Revoke access (keep data but remove tokens)
router.post('/revoke', authenticate, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { accessToken: '', refreshToken: '', tokenExpiry: '' }
    });

    res.clearCookie('token');
    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({ error: 'Failed to revoke access' });
  }
});

export default router;

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// Get dashboard summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = { userId: req.user._id };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Total spending
    const totalResult = await Invoice.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalSpending = totalResult[0]?.total || 0;

    // Category breakdown
    const categoryBreakdown = await Invoice.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Monthly trends
    const monthlyTrends = await Invoice.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent invoices
    const recentInvoices = await Invoice.find(dateFilter)
      .sort({ date: -1 })
      .limit(10);

    // Invoice count
    const totalInvoices = await Invoice.countDocuments(dateFilter);

    console.log('📊 DASHBOARD CALCULATION:');
    console.log('Total Spending:', totalSpending);
    console.log('Total Invoices:', totalInvoices);
    console.log('Average:', totalInvoices > 0 ? totalSpending / totalInvoices : 0);

    res.json({
      summary: {
        totalSpending,
        totalInvoices,
        averageSpending: totalInvoices > 0 ? totalSpending / totalInvoices : 0
      },
      categoryBreakdown: categoryBreakdown.map(cat => ({
        category: cat._id,
        total: cat.total,
        count: cat.count,
        percentage: (cat.total / totalSpending) * 100
      })),
      monthlyTrends: monthlyTrends.map(trend => ({
        year: trend._id.year,
        month: trend._id.month,
        total: trend.total,
        count: trend.count
      })),
      recentInvoices
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// Get category breakdown
router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await Invoice.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ categories });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;

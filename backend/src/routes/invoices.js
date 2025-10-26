import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { fetchInvoicesFromGmail } from '../services/gmailService.js';
import { queueInvoiceProcessing } from '../services/queueService.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// Trigger invoice fetch with date range
router.post('/fetch', authenticate, async (req, res) => {
  try {
    console.log('\n📨 Invoice fetch request received');
    console.log('User ID:', req.user._id);
    console.log('User email:', req.user.email);
    
    const { dateRange = 'thisMonth' } = req.body;
    console.log('Date range:', dateRange);

    // Queue the job
    const job = await queueInvoiceProcessing(req.user._id, dateRange);
    console.log('✅ Job queued with ID:', job.id);

    res.json({
      message: 'Invoice fetching started',
      jobId: job.id,
      status: 'processing'
    });
  } catch (error) {
    console.error('❌ Fetch invoices error:', error);
    res.status(500).json({ error: 'Failed to start invoice fetch' });
  }
});

// Check job status
router.get('/job/:jobId', authenticate, async (req, res) => {
  try {
    const { invoiceQueue } = await import('../services/queueService.js');
    const job = await invoiceQueue.getJob(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress();

    res.json({
      jobId: job.id,
      state,
      progress,
      isCompleted: state === 'completed',
      isFailed: state === 'failed',
      result: job.returnvalue // Include job result data (invoices)
    });
  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// Get all invoices
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      startDate, 
      endDate,
      sortBy = 'date',
      order = 'desc'
    } = req.query;

    const query = { userId: req.user._id };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Invoice.countDocuments(query)
    ]);

    res.json({
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get single invoice
router.get('/:id', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Update invoice category
router.patch('/:id/category', authenticate, async (req, res) => {
  try {
    const { category } = req.body;

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { category },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Delete invoice
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;

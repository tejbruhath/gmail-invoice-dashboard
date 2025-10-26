import Bull from 'bull';
import { fetchInvoicesFromGmail } from './gmailService.js';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js';

const invoiceQueue = new Bull('invoice-processing', process.env.REDIS_URL);

// Date range to days mapping
function dateRangeToDays(dateRange) {
  const ranges = {
    'thisMonth': 30,
    'lastMonth': 60,
    'last3Months': 90,
    'last6Months': 180,
    'thisYear': 365,
    'allTime': 730 // 2 years max
  };
  return ranges[dateRange] || 30;
}

// Process jobs
invoiceQueue.process(async (job) => {
  const { userId, dateRange } = job.data;

  try {
    // Update progress
    job.progress(10);

    // Fetch and extract invoices from Gmail (all within date range)
    console.log(`\n🚀 Starting invoice fetch for user: ${userId}`);
    const daysBack = dateRangeToDays(dateRange);
    console.log(`📅 Date Range: ${dateRange} (${daysBack} days)`);
    console.log(`📧 Fetching ALL LazyPay & Simpl invoices from last ${daysBack} days`);
    const invoices = await fetchInvoicesFromGmail(userId, daysBack);
    job.progress(50);

    let processedCount = 0;
    const totalInvoices = invoices.length;
    console.log(`📊 Total invoices to save: ${totalInvoices}`);

    // Save each invoice
    for (let i = 0; i < invoices.length; i++) {
      const invoiceData = invoices[i];

      // Check if already processed by emailId
      const existingByEmail = await Invoice.findOne({ emailId: invoiceData.emailId, userId });
      if (existingByEmail) {
        console.log(`⏭️  Skipped: Email already processed`);
        continue;
      }

      // Check for duplicates by merchant, amount, and date (within 1 day)
      const invoiceDate = new Date(invoiceData.date);
      const oneDayBefore = new Date(invoiceDate.getTime() - 24 * 60 * 60 * 1000);
      const oneDayAfter = new Date(invoiceDate.getTime() + 24 * 60 * 60 * 1000);
      
      const existingDuplicate = await Invoice.findOne({
        userId,
        merchant: invoiceData.merchant,
        amount: { $gte: invoiceData.amount - 0.01, $lte: invoiceData.amount + 0.01 },
        date: { $gte: oneDayBefore, $lte: oneDayAfter }
      });

      if (existingDuplicate) {
        console.log(`🔄 DUPLICATE: ${invoiceData.merchant} - ₹${invoiceData.amount} already exists`);
        continue;
      }

      try {
        // Save to database
        const invoice = new Invoice(invoiceData);
        await invoice.save();
        processedCount++;
        console.log(`✅ Saved invoice #${processedCount}: ${invoiceData.merchant} - ₹${invoiceData.amount}`);
      } catch (error) {
        console.error(`❌ Failed to save invoice:`, error.message);
        // Continue with next invoice
      }

      // Update progress
      const progress = 50 + ((i + 1) / totalInvoices) * 40;
      job.progress(Math.round(progress));
    }

    // Update user's last sync time
    await User.findByIdAndUpdate(userId, { lastSync: new Date() });

    job.progress(100);

    console.log(`\n✨ Job completed! Saved ${processedCount} out of ${totalInvoices} invoices\n`);

    // Fetch all invoices for this user to return
    const allUserInvoices = await Invoice.find({ userId })
      .sort({ date: -1 })
      .limit(100);

    return {
      success: true,
      totalInvoices: invoices.length,
      processedCount,
      invoices: allUserInvoices
    };
  } catch (error) {
    console.error('❌ Queue processing error:', error);
    throw error;
  }
});

// Queue event handlers
invoiceQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

invoiceQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

export const queueInvoiceProcessing = async (userId, dateRange = 'thisMonth') => {
  const job = await invoiceQueue.add(
    { userId, dateRange },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    }
  );

  return job;
};

export { invoiceQueue };

export const getJobStatus = async (jobId) => {
  const job = await invoiceQueue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job._progress;

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    result: job.returnvalue
  };
};

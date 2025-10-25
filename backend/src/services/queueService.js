import Bull from 'bull';
import { fetchInvoicesFromGmail, processEmailForInvoice } from './gmailService.js';
import { categorizeInvoice } from './categorizationService.js';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js';

const invoiceQueue = new Bull('invoice-processing', process.env.REDIS_URL);

// Process jobs
invoiceQueue.process(async (job) => {
  const { userId, maxResults } = job.data;

  try {
    // Update progress
    job.progress(10);

    // Fetch emails from Gmail
    const emails = await fetchInvoicesFromGmail(userId, maxResults);
    job.progress(30);

    let processedCount = 0;
    const totalEmails = emails.length;

    // Process each email
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      // Check if already processed
      const existing = await Invoice.findOne({ emailId: email.id, userId });
      if (existing) {
        continue;
      }

      try {
        // Extract invoice data
        const invoiceData = await processEmailForInvoice(email, userId);

        // Categorize
        const category = await categorizeInvoice(
          invoiceData.merchant,
          invoiceData.rawText || email.body
        );

        // Save to database
        const invoice = new Invoice({
          ...invoiceData,
          category: category.category,
          confidence: category.confidence
        });

        await invoice.save();
        processedCount++;
      } catch (error) {
        console.error(`Failed to process email ${email.id}:`, error);
        // Continue with next email
      }

      // Update progress
      const progress = 30 + ((i + 1) / totalEmails) * 60;
      job.progress(Math.round(progress));
    }

    // Update user's last sync time
    await User.findByIdAndUpdate(userId, { lastSync: new Date() });

    job.progress(100);

    return {
      success: true,
      totalEmails: emails.length,
      processedCount
    };
  } catch (error) {
    console.error('Queue processing error:', error);
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

export const queueInvoiceProcessing = async (userId, maxResults = 50) => {
  const job = await invoiceQueue.add(
    { userId, maxResults },
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

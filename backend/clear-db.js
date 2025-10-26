import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await mongoose.connection.db.collection('users').deleteMany({});
  await mongoose.connection.db.collection('invoices').deleteMany({});
  console.log('✅ Database cleared!');
  process.exit(0);
});

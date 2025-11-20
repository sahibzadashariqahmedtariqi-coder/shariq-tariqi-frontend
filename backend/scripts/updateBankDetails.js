import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Settings from '../models/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const updateBankDetails = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const settings = await Settings.findOne();
    
    if (settings) {
      settings.accountTitle = 'Muhammad Shariq';
      settings.accountNumber = '24407000008303';
      settings.ibanNumber = 'PK25 HABB 0024407000008303';
      settings.bankName = 'HBL (Habib Bank Limited)';
      settings.bankBranch = 'Bara Market Branch';
      
      await settings.save();
      
      console.log('✅ Bank details updated successfully!');
      console.log('Account Title:', settings.accountTitle);
      console.log('Account Number:', settings.accountNumber);
      console.log('IBAN:', settings.ibanNumber);
      console.log('Bank:', settings.bankName);
      console.log('Branch:', settings.bankBranch);
    } else {
      console.log('No settings found in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating bank details:', error);
    process.exit(1);
  }
};

updateBankDetails();

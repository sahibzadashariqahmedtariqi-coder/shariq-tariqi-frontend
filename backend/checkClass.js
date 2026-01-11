import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import LMSClass from './models/LMSClass.js';

const checkClass = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const classes = await LMSClass.find({});
    console.log('Classes found:', classes.length);
    console.log(JSON.stringify(classes, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkClass();

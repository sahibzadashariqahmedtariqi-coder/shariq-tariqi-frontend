import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/database.js';
import Product from '../models/Product.js';

const updateProductCategories = async () => {
  try {
    await connectDB();
    
    // Map old categories to new ones
    const categoryMapping = {
      'herbs': 'herbal',
      'taweez': 'spiritual',
      'other': 'books'
    };
    
    // Get all products with old categories
    const products = await Product.find({
      category: { $in: ['herbs', 'taweez', 'other'] }
    });
    
    console.log(`Found ${products.length} products with old categories`);
    
    for (const product of products) {
      const oldCategory = product.category;
      const newCategory = categoryMapping[oldCategory];
      
      if (newCategory) {
        // Use updateOne to bypass validation temporarily
        await Product.updateOne(
          { _id: product._id },
          { $set: { category: newCategory } }
        );
        console.log(`✅ Updated "${product.name}": ${oldCategory} -> ${newCategory}`);
      }
    }
    
    console.log('\n✅ All products updated successfully!');
    
    // Show all products with their categories
    const allProducts = await Product.find({}).select('name category');
    console.log('\nCurrent products:');
    allProducts.forEach(p => console.log(`  - ${p.name}: ${p.category}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
};

updateProductCategories();

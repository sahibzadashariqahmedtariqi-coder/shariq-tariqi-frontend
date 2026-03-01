import Product from '../models/Product.js';
import Service from '../models/Service.js';
import Course from '../models/Course.js';

// ============================================
// RULE-BASED CHATBOT + GEMINI AI FALLBACK
// ============================================

// Category keywords mapping for rule-based matching
const CATEGORY_RULES = {
  skin: {
    keywords: ['skin', 'acne', 'pimple', 'rash', 'eczema', 'psoriasis', 'daad', 'khujli', 'jild', 'chamra', 'face', 'chehra', 'glow', 'rang gora', 'whitening', 'cream', 'dhabbe', 'spots', 'dark circles', 'wrinkles', 'jhaiyan', 'daane', 'keel', 'muhase'],
    productCategory: 'herbal',
    productTags: ['skin', 'face', 'cream', 'beauty', 'glow'],
    message: 'جلدی مسائل کے لیے ہمارے پاس خاص جڑی بوٹیوں کی مصنوعات ہیں۔ یہ رہیں آپ کے لیے مناسب مصنوعات:',
  },
  digestive: {
    keywords: ['stomach', 'digestion', 'qabz', 'constipation', 'diarrhea', 'ulcer', 'acidity', 'gas', 'pait', 'pet dard', 'hazma', 'appetite', 'bhook', 'liver', 'jigar', 'intestine', 'tez aab', 'badhazmi'],
    productCategory: 'herbal',
    productTags: ['stomach', 'digestive', 'liver', 'herbal'],
    message: 'نظامِ ہاضمہ کے مسائل کے لیے ہماری مصنوعات دیکھیں:',
  },
  spiritual: {
    keywords: ['nazar', 'evil eye', 'jinn', 'jadu', 'magic', 'black magic', 'kala jadu', 'taweez', 'wazifa', 'ruqyah', 'bandish', 'asaib', 'hamzad', 'spiritual', 'roohani', 'rohani', 'protection', 'hifazat', 'dua', 'istikhara', 'nazar lagna', 'jinnat', 'saya'],
    productCategory: 'spiritual',
    productTags: ['spiritual', 'taweez', 'protection', 'ruqyah'],
    message: 'روحانی مسائل کے لیے ہماری خاص مصنوعات اور خدمات حاضر ہیں:',
    suggestAppointment: true,
  },
  pain: {
    keywords: ['pain', 'dard', 'headache', 'sir dard', 'backache', 'kamar dard', 'joint', 'joron', 'arthritis', 'muscle', 'body pain', 'knee', 'shoulder', 'sar dard', 'ghutna', 'hath dard', 'paon dard', 'sar ma dard'],
    productCategory: 'herbal',
    productTags: ['pain', 'oil', 'relief', 'body'],
    message: 'درد کے علاج کے لیے ہماری جڑی بوٹیوں کی مصنوعات:',
  },
  hair: {
    keywords: ['hair', 'baal', 'hair fall', 'baldness', 'ganjapan', 'dandruff', 'khushki', 'hair growth', 'hair oil', 'baal girna', 'baal jharna', 'safed baal', 'white hair'],
    productCategory: 'herbal',
    productTags: ['hair', 'oil', 'growth'],
    message: 'بالوں کے مسائل کے لیے ہماری مصنوعات:',
  },
  weight: {
    keywords: ['weight', 'wazan', 'motapa', 'obesity', 'fat', 'slim', 'diet', 'sugar', 'diabetes', 'blood pressure', 'bp', 'cholesterol', 'patla hona', 'mota', 'wazan kam', 'wazan barhna', 'sugar ki bimari'],
    productCategory: 'herbal',
    productTags: ['weight', 'sugar', 'diabetes', 'health'],
    message: 'وزن اور صحت کے مسائل کے لیے ہماری مصنوعات:',
  },
  health_general: {
    keywords: ['tabiyat', 'bimar', 'bimaari', 'health', 'sehat', 'kamzor', 'kamzori', 'bukhar', 'fever', 'flu', 'khansi', 'cough', 'cold', 'nazla', 'zukam', 'weakness', 'thakan', 'neend', 'sleep', 'tired', 'immunity', 'infection', 'allergy', 'saans', 'breathing', 'chest', 'seena', 'gala', 'throat', 'thand', 'khoon', 'blood', 'anemia', 'vitamin', 'energy', 'weak'],
    productCategory: 'herbal',
    productTags: ['health', 'herbal', 'immunity', 'energy'],
    message: 'آپ کی صحت کے لیے ہماری جڑی بوٹیوں کی مصنوعات دیکھیں:',
    suggestAppointment: true,
  },
  courses: {
    keywords: ['course', 'learn', 'seekhna', 'class', 'training', 'study', 'ilm', 'knowledge', 'sikho', 'enroll', 'admission', 'taaleem', 'padhai', 'parhna'],
    message: 'ہمارے تعلیمی کورسز دیکھیں:',
    type: 'courses',
  },
  appointment: {
    keywords: ['appointment', 'mulaqat', 'milna chahta', 'consult', 'mashwara', 'visit', 'checkup', 'doctor', 'hakeem', 'treatment', 'ilaj', 'book appointment', 'appointment book'],
    message: 'آپ ہمارے ساتھ اپائنٹمنٹ بک کر سکتے ہیں۔',
    type: 'appointment',
  },
  greeting: {
    keywords: ['hello', 'salam', 'assalam', 'assalamu', 'aoa', 'good morning', 'good evening', 'how are you', 'kaise ho', 'kya haal'],
    message: 'وعلیکم السلام! میں آپ کی خدمت میں حاضر ہوں۔ آپ اپنا مسئلہ بتائیں، میں آپ کو مناسب مصنوعات تجویز کروں گا۔',
    type: 'greeting',
  },
  products: {
    keywords: ['product', 'products', 'shop', 'buy', 'kharidna', 'order', 'price', 'qeemat', 'dawa', 'medicine', 'dawai'],
    message: 'ہماری مصنوعات دیکھیں:',
    type: 'products',
  },
  services: {
    keywords: ['service', 'services', 'kya karte', 'what do you do', 'help', 'madad'],
    message: 'ہماری خدمات حاضر ہیں:',
    type: 'services',
  },
};

// Quick reply options for initial interaction
const QUICK_REPLIES = [
  { label: '🌿 Herbal Products', value: 'show me herbal products' },
  { label: '🔮 Spiritual Healing', value: 'spiritual healing' },
  { label: '📚 Courses', value: 'courses' },
  { label: '📅 Book Appointment', value: 'appointment' },
  { label: '💊 Health Issues', value: 'health problems' },
  { label: '📞 Contact', value: 'contact information' },
];

// Detect category from user message (with word boundary matching)
function detectCategory(message) {
  const lowerMsg = message.toLowerCase().trim();

  for (const [key, rule] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of rule.keywords) {
      const kw = keyword.toLowerCase();
      // Use word boundary regex for short keywords (<=3 chars) to prevent false matches
      // e.g., 'hi' should NOT match inside 'nhi', 'bp' should match standalone only
      if (kw.length <= 3) {
        const regex = new RegExp(`(^|\\s|[^a-z])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|\\s|[^a-z])`, 'i');
        if (regex.test(lowerMsg)) {
          return { category: key, rule };
        }
      } else {
        if (lowerMsg.includes(kw)) {
          return { category: key, rule };
        }
      }
    }
  }

  return null;
}

// Fetch products by category/tags from DB
async function fetchRelevantProducts(rule, limit = 4) {
  try {
    const query = { isActive: true };

    if (rule.productCategory) {
      query.category = rule.productCategory;
    }

    let products = await Product.find(query)
      .select('name shortDescription price image category tags priceINR')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    // If tags available, try to filter further
    if (rule.productTags && rule.productTags.length > 0 && products.length > 0) {
      const tagFiltered = products.filter(p =>
        p.tags && p.tags.some(t => rule.productTags.includes(t.toLowerCase()))
      );
      if (tagFiltered.length > 0) {
        products = tagFiltered.slice(0, limit);
      }
    }

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Fetch services from DB
async function fetchServices(limit = 4) {
  try {
    return await Service.find({ isActive: true })
      .select('title shortDescription price category serviceId image priceINR')
      .sort({ order: 1, isFeatured: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

// Fetch courses from DB
async function fetchCourses(limit = 4) {
  try {
    return await Course.find({ isActive: true })
      .select('title shortDescription price image duration level')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

// Call Gemini AI (free tier)
async function callGeminiAI(userMessage, products, services) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    // Build context about available products/services
    const productList = products.map(p => `- ${p.name}: ${p.shortDescription || ''} (Rs. ${p.price})`).join('\n');
    const serviceList = services.map(s => `- ${s.title}: ${s.shortDescription || ''}`).join('\n');

    const systemPrompt = `You are a helpful assistant for "Sahibzada Shariq Ahmed Tariqi" - a spiritual healer and herbal medicine practitioner (Hakeem) based in Karachi, Pakistan.

Your role:
1. Understand the user's health/spiritual problem
2. Suggest relevant products or services from the available list
3. If the problem seems serious, recommend booking an appointment
4. Be respectful, warm, and professional
5. Reply in the SAME LANGUAGE as the user (Urdu/Roman Urdu/English)
6. Keep responses concise (2-4 sentences max)
7. NEVER give medical diagnoses - only suggest products and recommend consultation
8. If you're unsure, recommend an appointment with the Hakeem

Available Products:
${productList || 'No products loaded'}

Available Services:
${serviceList || 'No services loaded'}

Website: https://www.sahibzadashariqahmedtariqi.com
Appointment Page: https://www.sahibzadashariqahmedtariqi.com/appointments
Products Page: https://www.sahibzadashariqahmedtariqi.com/products`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Understood. I will help users find the right products and services from Sahibzada Shariq Ahmed Tariqi\'s offerings. I will be respectful and warm.' }] },
            { role: 'user', parts: [{ text: userMessage }] },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return aiText || null;
  } catch (error) {
    console.error('Gemini AI error:', error.message);
    return null;
  }
}

// Fallback to OpenAI if Gemini fails
async function callOpenAI(userMessage, products, services) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const productList = products.map(p => `- ${p.name}: ${p.shortDescription || ''} (Rs. ${p.price})`).join('\n');
    const serviceList = services.map(s => `- ${s.title}: ${s.shortDescription || ''}`).join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant for "Sahibzada Shariq Ahmed Tariqi" - a spiritual healer and herbal medicine practitioner. Suggest products/services. Reply in user's language. Keep responses short (2-4 sentences). Never give medical diagnoses.

Products: ${productList}
Services: ${serviceList}`,
          },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI error:', error.message);
    return null;
  }
}

// ============================================
// MAIN CHATBOT ENDPOINT
// ============================================
export const chatbotMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Sanitize input - remove any HTML/scripts
    const sanitizedMessage = message
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 500); // Max 500 chars

    if (sanitizedMessage.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message',
      });
    }

    // Step 1: Try rule-based matching
    const detected = detectCategory(sanitizedMessage);

    if (detected) {
      const { rule } = detected;

      // Handle greeting
      if (rule.type === 'greeting') {
        return res.status(200).json({
          success: true,
          data: {
            reply: rule.message,
            type: 'greeting',
            quickReplies: QUICK_REPLIES,
          },
        });
      }

      // Handle appointment request
      if (rule.type === 'appointment') {
        return res.status(200).json({
          success: true,
          data: {
            reply: rule.message,
            type: 'appointment',
            appointmentUrl: '/appointments',
            quickReplies: [
              { label: '📅 Book Now', value: 'LINK:/appointments' },
              { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
            ],
          },
        });
      }

      // Handle courses
      if (rule.type === 'courses') {
        const courses = await fetchCourses();
        return res.status(200).json({
          success: true,
          data: {
            reply: rule.message,
            type: 'courses',
            courses: courses,
            quickReplies: [
              { label: '📚 View All Courses', value: 'LINK:/courses' },
              { label: '📅 Book Appointment', value: 'appointment' },
            ],
          },
        });
      }

      // Handle services
      if (rule.type === 'services') {
        const services = await fetchServices();
        return res.status(200).json({
          success: true,
          data: {
            reply: rule.message,
            type: 'services',
            services: services,
            quickReplies: [
              { label: '🔍 View All Services', value: 'LINK:/services' },
              { label: '📅 Book Appointment', value: 'appointment' },
            ],
          },
        });
      }

      // Handle products
      if (rule.type === 'products') {
        const products = await fetchRelevantProducts({ productCategory: null }, 6);
        return res.status(200).json({
          success: true,
          data: {
            reply: rule.message,
            type: 'products',
            products: products,
            quickReplies: [
              { label: '🛒 View All Products', value: 'LINK:/products' },
              { label: '📅 Book Appointment', value: 'appointment' },
            ],
          },
        });
      }

      // Handle category-specific product suggestions
      const products = await fetchRelevantProducts(rule);

      // If rule matched but needs AI enhancement, try Gemini for a better response
      let aiEnhancedReply = null;
      if (detected.category === 'health_general' || rule.suggestAppointment) {
        const allProducts = products.length > 0 ? products : await Product.find({ isActive: true }).select('name shortDescription price category tags').sort({ isFeatured: -1 }).limit(10).lean();
        const allServices = await Service.find({ isActive: true }).select('title shortDescription category').sort({ order: 1 }).limit(10).lean();
        aiEnhancedReply = await callGeminiAI(sanitizedMessage, allProducts, allServices);
      }

      const response = {
        reply: aiEnhancedReply || rule.message,
        type: 'product_suggestion',
        products: products,
        quickReplies: [
          { label: '🛒 View All Products', value: 'LINK:/products' },
        ],
      };

      // Suggest appointment for serious/spiritual/health issues
      if (rule.suggestAppointment) {
        if (!aiEnhancedReply) {
          response.reply += '\n\nاگر مسئلہ سنگین ہو تو حکیم صاحب سے مشورہ ضرور کریں۔';
        }
        response.quickReplies.unshift({ label: '📅 Book Appointment', value: 'appointment' });
      } else {
        response.quickReplies.push({ label: '📅 Consult Hakeem', value: 'appointment' });
      }

      return res.status(200).json({ success: true, data: response });
    }

    // Step 2: No rule matched - try AI (Gemini first, then OpenAI fallback)
    const [products, services] = await Promise.all([
      Product.find({ isActive: true })
        .select('name shortDescription price category tags')
        .sort({ isFeatured: -1 })
        .limit(20)
        .lean(),
      Service.find({ isActive: true })
        .select('title shortDescription category')
        .sort({ order: 1 })
        .limit(10)
        .lean(),
    ]);

    // Try Gemini first
    let aiReply = await callGeminiAI(sanitizedMessage, products, services);

    // Fallback to OpenAI
    if (!aiReply) {
      aiReply = await callOpenAI(sanitizedMessage, products, services);
    }

    if (aiReply) {
      return res.status(200).json({
        success: true,
        data: {
          reply: aiReply,
          type: 'ai_response',
          products: products.slice(0, 4),
          quickReplies: [
            { label: '🛒 Products', value: 'LINK:/products' },
            { label: '📅 Book Appointment', value: 'appointment' },
            { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
          ],
        },
      });
    }

    // Step 3: No AI available - give generic helpful response
    return res.status(200).json({
      success: true,
      data: {
        reply: 'معذرت، میں آپ کا مسئلہ سمجھ نہیں پایا۔ براہ کرم نیچے دیے گئے آپشنز میں سے کوئی منتخب کریں یا حکیم صاحب سے براہ راست رابطہ کریں۔',
        type: 'fallback',
        quickReplies: QUICK_REPLIES,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get initial chatbot data (quick replies + welcome message)
export const chatbotInit = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      welcome: 'السلام علیکم! 👋\nمیں آپ کی کیا مدد کر سکتا ہوں؟\nاپنا مسئلہ بتائیں یا نیچے سے کوئی آپشن منتخب کریں۔',
      quickReplies: QUICK_REPLIES,
    },
  });
};

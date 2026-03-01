import fetch from 'node-fetch';
import Product from '../models/Product.js';
import Service from '../models/Service.js';
import Course from '../models/Course.js';

// ============================================
// SMART CHATBOT - Rule-Based + AI Fallback
// ============================================

// Category keywords with multiple contextual responses
const CATEGORY_RULES = {
  skin: {
    keywords: ['skin', 'acne', 'pimple', 'rash', 'eczema', 'psoriasis', 'daad', 'khujli', 'jild', 'chamra', 'face', 'chehra', 'glow', 'rang gora', 'whitening', 'cream', 'dhabbe', 'spots', 'dark circles', 'wrinkles', 'jhaiyan', 'daane', 'keel', 'muhase', 'chehre', 'noor', 'rang nikharna', 'safai', 'pimples', 'dagh'],
    productCategory: 'herbal',
    productTags: ['skin', 'face', 'cream', 'beauty', 'glow'],
    responses: [
      'جلدی مسائل کے لیے ہمارے پاس خاص جڑی بوٹیوں سے تیار کردہ مصنوعات ہیں جو قدرتی طور پر آپ کی جلد کی دیکھ بھال کریں گی۔ یہ رہیں مناسب مصنوعات:',
      'آپ کی جلد کے مسئلے کے لیے ہمارے حکیم صاحب نے خاص فارمولے تیار کیے ہیں۔ ان مصنوعات کو آزمائیں:',
      'جلد کے مسائل عام ہیں لیکن قدرتی علاج سے بہتری آ سکتی ہے۔ ہماری مصنوعات دیکھیں:',
    ],
    suggestAppointment: true,
  },
  digestive: {
    keywords: ['stomach', 'digestion', 'qabz', 'constipation', 'diarrhea', 'ulcer', 'acidity', 'gas', 'pait', 'pet dard', 'hazma', 'appetite', 'bhook', 'liver', 'jigar', 'intestine', 'tez aab', 'badhazmi', 'pait kharab', 'ulti', 'vomit', 'matli', 'nausea'],
    productCategory: 'herbal',
    productTags: ['stomach', 'digestive', 'liver', 'herbal'],
    responses: [
      'نظامِ ہاضمہ کے مسائل جڑی بوٹیوں سے بہتر ہو سکتے ہیں۔ ہماری جانچ شدہ مصنوعات دیکھیں:',
      'ہاضمے کی خرابی عام مسئلہ ہے۔ ہمارے حکیم صاحب کے تیار کردہ فارمولے آزمائیں:',
      'پیٹ کے مسائل کے لیے قدرتی علاج بہترین ہے۔ یہ مصنوعات دیکھیں:',
    ],
    suggestAppointment: true,
  },
  spiritual: {
    keywords: ['nazar', 'evil eye', 'jinn', 'jadu', 'magic', 'black magic', 'kala jadu', 'taweez', 'wazifa', 'ruqyah', 'bandish', 'asaib', 'hamzad', 'spiritual', 'roohani', 'rohani', 'protection', 'hifazat', 'dua', 'istikhara', 'nazar lagna', 'jinnat', 'saya', 'sehr', 'sahar', 'jadoo', 'buri nazar', 'bhoot', 'asar', 'waswasay', 'wahm', 'khwab', 'dream', 'darr', 'darr lagna', 'pareshani', 'stress', 'tension', 'depression', 'anxiety'],
    productCategory: 'spiritual',
    productTags: ['spiritual', 'taweez', 'protection', 'ruqyah'],
    responses: [
      'روحانی مسائل کے لیے صاحبزادہ شارق احمد طارقی صاحب خصوصی خدمات فراہم کرتے ہیں۔ ہماری مصنوعات اور خدمات دیکھیں:',
      'اللہ تعالیٰ ہر مسئلے کا حل رکھتا ہے۔ ہمارے روحانی علاج اور مصنوعات حاضر ہیں:',
      'روحانی پریشانیوں کا حل موجود ہے۔ حکیم صاحب سے مشورہ کریں اور ہماری مصنوعات دیکھیں:',
    ],
    suggestAppointment: true,
  },
  pain: {
    keywords: ['pain', 'dard', 'headache', 'sir dard', 'backache', 'kamar dard', 'joint', 'joron', 'arthritis', 'muscle', 'body pain', 'knee', 'shoulder', 'sar dard', 'ghutna', 'hath dard', 'paon dard', 'sar ma dard', 'gathiya', 'sujan', 'swelling', 'injury', 'chot', 'toot', 'haddi', 'bone', 'gardan', 'neck'],
    productCategory: 'herbal',
    productTags: ['pain', 'oil', 'relief', 'body'],
    responses: [
      'درد کے لیے ہمارے خاص تیل اور جڑی بوٹیوں کی مصنوعات بہت مؤثر ہیں:',
      'جوڑوں اور جسم کے درد کے لیے قدرتی علاج بہترین ہے۔ یہ مصنوعات آزمائیں:',
      'درد سے نجات کے لیے ہمارے حکیم صاحب کے تجویز کردہ علاج دیکھیں:',
    ],
    suggestAppointment: true,
  },
  hair: {
    keywords: ['hair', 'baal', 'hair fall', 'baldness', 'ganjapan', 'dandruff', 'khushki', 'hair growth', 'hair oil', 'baal girna', 'baal jharna', 'safed baal', 'white hair', 'baalon', 'hair loss', 'thinning', 'split ends'],
    productCategory: 'herbal',
    productTags: ['hair', 'oil', 'growth'],
    responses: [
      'بالوں کے مسائل کے لیے ہمارے خاص ہربل تیل اور مصنوعات دیکھیں:',
      'بالوں کا گرنا، خشکی یا سفید ہونا - سب کا علاج ہمارے پاس ہے:',
      'قدرتی جڑی بوٹیوں سے بنی مصنوعات بالوں کے لیے بہترین ہیں:',
    ],
  },
  weight: {
    keywords: ['weight', 'wazan', 'motapa', 'obesity', 'fat', 'slim', 'diet', 'sugar', 'diabetes', 'blood pressure', 'bp', 'cholesterol', 'patla hona', 'mota', 'wazan kam', 'wazan barhna', 'sugar ki bimari', 'thyroid', 'hormones'],
    productCategory: 'herbal',
    productTags: ['weight', 'sugar', 'diabetes', 'health'],
    responses: [
      'وزن اور شوگر کے مسائل کے لیے ہمارے قدرتی فارمولے بہت مؤثر ہیں:',
      'موٹاپا اور ذیابیطس کے لیے جڑی بوٹیوں کا علاج آزمائیں:',
      'وزن کنٹرول اور صحت مند زندگی کے لیے ہماری مصنوعات:',
    ],
    suggestAppointment: true,
  },
  health_general: {
    keywords: ['tabiyat', 'bimar', 'bimaari', 'health', 'sehat', 'kamzor', 'kamzori', 'bukhar', 'fever', 'flu', 'khansi', 'cough', 'cold', 'nazla', 'zukam', 'weakness', 'thakan', 'neend', 'sleep', 'tired', 'immunity', 'infection', 'allergy', 'saans', 'breathing', 'chest', 'seena', 'gala', 'throat', 'thand', 'khoon', 'blood', 'anemia', 'vitamin', 'energy', 'weak', 'bimaar', 'theek nahi', 'nahi theek', 'pareshan', 'problem', 'masla', 'masail', 'takleef', 'issue', 'taklif', 'bemari', 'achy nahi', 'achi nahi', 'kharab', 'feel nahi', 'unwell', 'sick', 'ill'],
    productCategory: 'herbal',
    productTags: ['health', 'herbal', 'immunity', 'energy'],
    responses: [
      'آپ کی صحت ہمارے لیے اہم ہے۔ قدرتی جڑی بوٹیوں سے بنی مصنوعات آپ کی مدد کر سکتی ہیں:',
      'بیماری میں فکر نہ کریں - ہمارے حکیم صاحب کے تیار کردہ فارمولے دیکھیں:',
      'صحت کے مسائل کے لیے ہمارے قدرتی ہربل علاج مؤثر ہیں۔ مصنوعات دیکھیں:',
    ],
    suggestAppointment: true,
  },
  mens_health: {
    keywords: ['mardana', 'mardangi', 'timing', 'power', 'taqat', 'strength', 'shadi', 'marriage', 'wedding', 'suhaag raat', 'fertility', 'infertility', 'baanjhpan', 'male', 'virility', 'performance', 'stamina'],
    productCategory: 'herbal',
    productTags: ['men', 'power', 'health', 'herbal'],
    responses: [
      'مردانہ صحت کے لیے ہمارے خاص قدرتی فارمولے موجود ہیں۔ شادی کی تیاری یا عمومی صحت - سب کا حل ہے:',
      'مردانہ مسائل کے لیے فکر نہ کریں - ہمارے حکیم صاحب کے تجویز کردہ نسخے دیکھیں:',
    ],
    suggestAppointment: true,
  },
  womens_health: {
    keywords: ['hamal', 'pregnancy', 'period', 'periods', 'mahwari', 'masik', 'pcod', 'pcos', 'uterus', 'bacha', 'aulad', 'female', 'khawateen', 'aurat', 'bachcha dani', 'hormonal', 'breast', 'lactation', 'doodh'],
    productCategory: 'herbal',
    productTags: ['women', 'health', 'herbal', 'female'],
    responses: [
      'خواتین کی صحت کے لیے ہمارے خاص جڑی بوٹیوں کے فارمولے موجود ہیں:',
      'خواتین کے مسائل کا قدرتی حل - ہماری مصنوعات دیکھیں:',
    ],
    suggestAppointment: true,
  },
  eye: {
    keywords: ['eye', 'eyes', 'nazar kamzor', 'aankhein', 'aankh', 'eyesight', 'vision', 'glasses', 'chasma', 'motia', 'cataract'],
    productCategory: 'herbal',
    productTags: ['eye', 'health', 'herbal'],
    responses: [
      'آنکھوں کے مسائل کے لیے ہمارے قدرتی علاج موجود ہیں:',
      'نظر کی کمزوری کا قدرتی حل - ہماری مصنوعات دیکھیں:',
    ],
    suggestAppointment: true,
  },
  kidney: {
    keywords: ['kidney', 'gurda', 'pathri', 'stone', 'peshab', 'urine', 'bladder', 'uti', 'renal'],
    productCategory: 'herbal',
    productTags: ['kidney', 'health', 'herbal'],
    responses: [
      'گردے اور پیشاب کے مسائل کے لیے ہمارے قدرتی جڑی بوٹیوں کے فارمولے:',
      'گردے کی پتھری یا دیگر مسائل - ہمارے حکیم صاحب سے مشورہ مفید ہوگا:',
    ],
    suggestAppointment: true,
  },
  courses: {
    keywords: ['course', 'learn', 'seekhna', 'class', 'training', 'study', 'ilm', 'knowledge', 'sikho', 'enroll', 'admission', 'taaleem', 'padhai', 'parhna', 'seekhein', 'sikhao'],
    responses: ['ہمارے تعلیمی کورسز میں آپ روحانیت، طب اور مزید بہت کچھ سیکھ سکتے ہیں:'],
    type: 'courses',
  },
  appointment: {
    keywords: ['appointment', 'mulaqat', 'milna chahta', 'consult', 'mashwara', 'visit', 'checkup', 'doctor', 'hakeem', 'treatment', 'ilaj', 'book appointment', 'appointment book', 'milna', 'rabta karna'],
    responses: [
      'آپ حکیم صاحبزادہ شارق احمد طارقی صاحب سے اپائنٹمنٹ بک کر سکتے ہیں۔ ابھی بک کریں یا واٹس ایپ پر رابطہ کریں:',
      'ملاقات کا وقت مقرر کرنے کے لیے نیچے Book Now دبائیں یا واٹس ایپ پر پیغام بھیجیں:',
    ],
    type: 'appointment',
  },
  greeting: {
    keywords: ['hello', 'salam', 'assalam', 'assalamu', 'aoa', 'good morning', 'good evening', 'how are you', 'kaise ho', 'kya haal', 'namaste', 'bohat achy'],
    responses: [
      'وعلیکم السلام! 🌿\nمیں طارقی AI اسسٹنٹ ہوں۔ آپ مجھ سے اپنی صحت کا کوئی مسئلہ بتائیں - میں آپ کو حکیم صاحب کی مصنوعات تجویز کروں گا۔\n\nیا نیچے سے کوئی آپشن منتخب کریں:',
      'وعلیکم السلام! خوش آمدید 🌿\nمیں آپ کی کیا مدد کر سکتا ہوں؟ اپنا مسئلہ بتائیں یا آپشنز میں سے منتخب کریں:',
    ],
    type: 'greeting',
  },
  products: {
    keywords: ['product', 'products', 'shop', 'buy', 'kharidna', 'order', 'price', 'qeemat', 'dawa', 'medicine', 'dawai', 'khareed', 'dikhao', 'show', 'dekho'],
    responses: [
      'ہماری تمام مصنوعات قدرتی جڑی بوٹیوں سے بنی ہیں۔ یہ رہیں:',
      'ہمارے اسٹور کی مشہور مصنوعات دیکھیں:',
    ],
    type: 'products',
  },
  services: {
    keywords: ['service', 'services', 'kya karte', 'what do you do', 'madad', 'kya milta', 'provide', 'offer'],
    responses: [
      'ہم روحانی علاج، جڑی بوٹیوں کا علاج اور مزید خدمات فراہم کرتے ہیں:',
      'ہماری خدمات میں استخارہ، روحانی مشاورت، حکمت اور مزید شامل ہیں:',
    ],
    type: 'services',
  },
  about: {
    keywords: ['about', 'barein', 'kaun', 'who', 'website', 'kis ki', 'kahan', 'where', 'location', 'address', 'pata', 'ye kya', 'yeh kya', 'batao', 'bataen', 'introduction', 'taaruf'],
    responses: [
      'یہ صاحبزادہ شارق احمد طارقی صاحب کی آفیشل ویب سائٹ ہے۔ آپ روحانی علاج، جڑی بوٹیوں کی ادویات، تعلیمی کورسز اور مزید بہت کچھ یہاں پا سکتے ہیں۔\n\n🏢 کراچی، پاکستان\n📞 واٹس ایپ: +92 318 2392985',
    ],
    type: 'about',
  },
  contact: {
    keywords: ['contact', 'phone', 'number', 'whatsapp', 'call', 'email', 'rabta', 'fone', 'mobile', 'social media', 'facebook', 'instagram'],
    responses: [
      'رابطے کی تفصیلات:\n\n📞 واٹس ایپ: +92 318 2392985\n🌐 ویب سائٹ: sahibzadashariqahmedtariqi.com\n\nنیچے "واٹس ایپ" بٹن دبا کر براہ راست بات کریں:',
    ],
    type: 'contact',
  },
  thanks: {
    keywords: ['thank', 'thanks', 'shukriya', 'jazakallah', 'jazak', 'bohut acha', 'bohat acha', 'great', 'nice', 'awesome', 'perfect', 'best', 'good job', 'well done', 'zabardast', 'shaandaar', 'lajawab'],
    responses: [
      'شکریہ! 🌿 اللہ آپ کو صحت و عافیت عطا فرمائے۔ اگر کوئی اور سوال ہو تو بے جھجک پوچھیں!',
      'جزاک اللہ! آپ کی خدمت میں حاضر ہوں۔ کوئی اور مدد چاہیں تو بتائیں 🤲',
    ],
    type: 'thanks',
  },
  donate: {
    keywords: ['donate', 'donation', 'sadqa', 'sadqah', 'zakat', 'khairat', 'chanda', 'paisa dena', 'madad karna'],
    responses: [
      'آپ ہماری ویب سائٹ پر صدقہ، زکوٰۃ اور خیرات کے لیے عطیہ دے سکتے ہیں:',
    ],
    type: 'donate',
  },
};

// Quick reply options for initial interaction
const QUICK_REPLIES = [
  { label: '🌿 Herbal Products', value: 'show me herbal products' },
  { label: '🔮 Spiritual Healing', value: 'spiritual healing services' },
  { label: '📚 Courses', value: 'courses available' },
  { label: '📅 Book Appointment', value: 'appointment book' },
  { label: '💊 Health Issues', value: 'health problem tabiyat kharab' },
  { label: '📞 Contact', value: 'contact information rabta' },
];

// Smart category detection with scoring (best match wins)
function detectCategory(message) {
  const lowerMsg = message.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const [key, rule] of Object.entries(CATEGORY_RULES)) {
    let score = 0;
    for (const keyword of rule.keywords) {
      const kw = keyword.toLowerCase();
      if (kw.length <= 3) {
        const regex = new RegExp(`(^|\\s|[^a-z])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|\\s|[^a-z])`, 'i');
        if (regex.test(lowerMsg)) {
          score += kw.length <= 2 ? 1 : 2;
        }
      } else {
        if (lowerMsg.includes(kw)) {
          score += kw.length >= 6 ? 3 : 2; // Longer keywords = higher confidence
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { category: key, rule, score };
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

// Get random response from array
function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
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

// ============================================
// AI FALLBACK CHAIN (6 FREE APIs)
// HuggingFace → OpenRouter → Cohere → Groq → Gemini → OpenAI
// ============================================
function buildSystemPrompt(products, services) {
  const productList = products.map(p => `- ${p.name}: ${p.shortDescription || ''} (Rs. ${p.price})`).join('\n');
  const serviceList = services.map(s => `- ${s.title}: ${s.shortDescription || ''}`).join('\n');
  return `You are "Tariqi AI Assistant" for Sahibzada Shariq Ahmed Tariqi - a spiritual healer & herbal medicine practitioner (Hakeem) in Karachi, Pakistan.
Rules: Reply in user's language (Urdu/Roman Urdu/English). Keep responses 2-4 sentences. Never give medical diagnoses. Suggest products/services. Recommend appointment if serious.
Products: ${productList || 'None'}
Services: ${serviceList || 'None'}
Website: sahibzadashariqahmedtariqi.com | Appointments: /appointments | Products: /products`;
}

// 1. HuggingFace Inference API (FREE - works globally, no credit card)
async function callHuggingFace(userMessage, systemPrompt) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://router.huggingface.co/hf-inference/models/microsoft/Phi-3-mini-4k-instruct/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'microsoft/Phi-3-mini-4k-instruct',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
        max_tokens: 300, temperature: 0.7,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) { console.log('HuggingFace AI: success'); return text; }
    } else {
      console.error('HuggingFace error:', res.status, await res.text().catch(() => ''));
    }
  } catch (e) { console.error('HuggingFace error:', e.message); }
  return null;
}

// 2. OpenRouter (FREE models - works globally)
async function callOpenRouter(userMessage, systemPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://www.sahibzadashariqahmedtariqi.com',
        'X-Title': 'Tariqi AI Assistant',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
        max_tokens: 300, temperature: 0.7,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) { console.log('OpenRouter AI: success'); return text; }
    } else {
      console.error('OpenRouter error:', res.status, await res.text().catch(() => ''));
    }
  } catch (e) { console.error('OpenRouter error:', e.message); }
  return null;
}

// 3. Cohere (FREE trial - works globally, no credit card)
async function callCohere(userMessage, systemPrompt) {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'command-r',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 300, temperature: 0.7,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.message?.content?.[0]?.text;
      if (text) { console.log('Cohere AI: success'); return text; }
    } else {
      console.error('Cohere error:', res.status, await res.text().catch(() => ''));
    }
  } catch (e) { console.error('Cohere error:', e.message); }
  return null;
}

// 4. Groq (FREE - LLaMA model)
async function callGroq(userMessage, systemPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
        max_tokens: 300, temperature: 0.7,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) { console.log('Groq AI: success'); return text; }
    }
  } catch (e) { console.error('Groq error:', e.message); }
  return null;
}

// 5. Gemini (FREE in some regions)
async function callGemini(userMessage, systemPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\nUser: ' + userMessage }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) { console.log('Gemini AI: success'); return text; }
    }
  } catch (e) { console.error('Gemini error:', e.message); }
  return null;
}

// 6. OpenAI (paid - last resort)
async function callOpenAI(userMessage, systemPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
        max_tokens: 300, temperature: 0.7,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) { console.log('OpenAI: success'); return text; }
    }
  } catch (e) { console.error('OpenAI error:', e.message); }
  return null;
}

// Master AI caller - tries all 6 APIs in order
async function callAI(userMessage, products, services) {
  const systemPrompt = buildSystemPrompt(products, services);

  // Try each API in order: OpenRouter FIRST (confirmed working) → others as backup
  const aiResult =
    await callOpenRouter(userMessage, systemPrompt) ||
    await callHuggingFace(userMessage, systemPrompt) ||
    await callCohere(userMessage, systemPrompt) ||
    await callGroq(userMessage, systemPrompt) ||
    await callGemini(userMessage, systemPrompt) ||
    await callOpenAI(userMessage, systemPrompt);

  return aiResult;
}

// ============================================
// MAIN CHATBOT ENDPOINT
// ============================================
export const chatbotMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const sanitizedMessage = message.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim().slice(0, 500);
    if (sanitizedMessage.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid message' });
    }

    // Step 1: Smart scoring-based category matching
    const detected = detectCategory(sanitizedMessage);

    if (detected) {
      const { category, rule } = detected;

      // === GREETING ===
      if (rule.type === 'greeting') {
        return res.json({
          success: true,
          data: { reply: getRandomResponse(rule.responses), type: 'greeting', quickReplies: QUICK_REPLIES },
        });
      }

      // === THANKS ===
      if (rule.type === 'thanks') {
        return res.json({
          success: true,
          data: {
            reply: getRandomResponse(rule.responses),
            type: 'thanks',
            quickReplies: [
              { label: '🌿 Products', value: 'LINK:/products' },
              { label: '📅 Appointment', value: 'appointment book' },
              { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
            ],
          },
        });
      }

      // === ABOUT ===
      if (rule.type === 'about') {
        const services = await fetchServices(3);
        return res.json({
          success: true,
          data: {
            reply: getRandomResponse(rule.responses),
            type: 'about',
            services,
            quickReplies: [
              { label: '🌿 Products', value: 'LINK:/products' },
              { label: '🔮 Services', value: 'LINK:/services' },
              { label: '📚 Courses', value: 'LINK:/courses' },
              { label: '📅 Appointment', value: 'appointment book' },
            ],
          },
        });
      }

      // === CONTACT ===
      if (rule.type === 'contact') {
        return res.json({
          success: true,
          data: {
            reply: getRandomResponse(rule.responses),
            type: 'contact',
            quickReplies: [
              { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
              { label: '📅 Book Appointment', value: 'appointment book' },
              { label: '🌐 Website', value: 'LINK:/' },
            ],
          },
        });
      }

      // === DONATE ===
      if (rule.type === 'donate') {
        return res.json({
          success: true,
          data: {
            reply: getRandomResponse(rule.responses),
            type: 'donate',
            quickReplies: [
              { label: '❤️ Donate Now', value: 'LINK:/donate' },
              { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
            ],
          },
        });
      }

      // === APPOINTMENT ===
      if (rule.type === 'appointment') {
        return res.json({
          success: true,
          data: {
            reply: getRandomResponse(rule.responses),
            type: 'appointment',
            appointmentUrl: '/appointments',
            quickReplies: [
              { label: '📅 Book Now', value: 'LINK:/appointments' },
              { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
            ],
          },
        });
      }

      // === COURSES ===
      if (rule.type === 'courses') {
        const courses = await fetchCourses();
        return res.json({
          success: true,
          data: {
            reply: getRandomResponse(rule.responses),
            type: 'courses',
            courses,
            quickReplies: [
              { label: '📚 View All Courses', value: 'LINK:/courses' },
              { label: '📅 Book Appointment', value: 'appointment book' },
            ],
          },
        });
      }

      // === SERVICES ===
      if (rule.type === 'services') {
        const services = await fetchServices();
        return res.json({
          success: true,
          data: {
            reply: getRandomResponse(rule.responses),
            type: 'services',
            services,
            quickReplies: [
              { label: '🔍 View All Services', value: 'LINK:/services' },
              { label: '📅 Book Appointment', value: 'appointment book' },
            ],
          },
        });
      }

      // === PRODUCTS ===
      if (rule.type === 'products') {
        const products = await fetchRelevantProducts({ productCategory: null }, 6);
        return res.json({
          success: true,
          data: {
            reply: getRandomResponse(rule.responses),
            type: 'products',
            products,
            quickReplies: [
              { label: '🛒 View All Products', value: 'LINK:/products' },
              { label: '📅 Book Appointment', value: 'appointment book' },
            ],
          },
        });
      }

      // === HEALTH/PRODUCT CATEGORIES (skin, digestive, spiritual, pain, etc.) ===
      const products = await fetchRelevantProducts(rule);
      const reply = getRandomResponse(rule.responses);
      const responseData = {
        reply,
        type: 'product_suggestion',
        products,
        quickReplies: [{ label: '🛒 View All Products', value: 'LINK:/products' }],
      };

      if (rule.suggestAppointment) {
        responseData.reply += '\n\nاگر مسئلہ سنگین ہو تو حکیم صاحب سے ضرور مشورہ کریں۔';
        responseData.quickReplies.unshift({ label: '📅 Book Appointment', value: 'appointment book' });
      } else {
        responseData.quickReplies.push({ label: '📅 Consult Hakeem', value: 'appointment book' });
      }

      return res.json({ success: true, data: responseData });
    }

    // Step 2: No rule matched - try AI APIs as fallback
    const [products, services] = await Promise.all([
      Product.find({ isActive: true }).select('name shortDescription price category tags').sort({ isFeatured: -1 }).limit(15).lean(),
      Service.find({ isActive: true }).select('title shortDescription category').sort({ order: 1 }).limit(10).lean(),
    ]);

    const aiReply = await callAI(sanitizedMessage, products, services);

    if (aiReply) {
      return res.json({
        success: true,
        data: {
          reply: aiReply,
          type: 'ai_response',
          products: products.slice(0, 4),
          quickReplies: [
            { label: '🛒 Products', value: 'LINK:/products' },
            { label: '📅 Book Appointment', value: 'appointment book' },
            { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
          ],
        },
      });
    }

    // Step 3: Smart fallback with helpful guidance + products
    return res.json({
      success: true,
      data: {
        reply: 'آپ کے سوال کا شکریہ! 🌿\nمیں آپ کی بہتر مدد کے لیے نیچے دیے گئے آپشنز میں سے کوئی منتخب کریں، یا اپنا مسئلہ تفصیل سے بتائیں۔\n\nآپ حکیم صاحب سے واٹس ایپ پر بھی بات کر سکتے ہیں۔',
        type: 'fallback',
        products: products.slice(0, 3),
        quickReplies: QUICK_REPLIES,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get initial chatbot data
export const chatbotInit = async (req, res) => {
  res.json({
    success: true,
    data: {
      welcome: 'السلام علیکم! 👋\nمیں طارقی AI اسسٹنٹ ہوں۔\nآپ اپنا مسئلہ بتائیں یا نیچے سے کوئی آپشن منتخب کریں۔',
      quickReplies: QUICK_REPLIES,
    },
  });
};

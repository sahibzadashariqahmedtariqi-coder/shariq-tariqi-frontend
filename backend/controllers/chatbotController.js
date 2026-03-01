import fetch from 'node-fetch';
import Product from '../models/Product.js';
import Service from '../models/Service.js';
import Course from '../models/Course.js';

// ============================================
// SMART CHATBOT - Rule-Based + AI Fallback
// ============================================

// Business Information Constants
const BUSINESS_INFO = {
  address: 'Shop No, 2334+43, LS 13-14 Madiha Road, Sector 5 A 1, New Karachi Town, Karachi, 78850',
  phone: '0318 2392985',
  whatsapp: '+92 318 2392985',
  website: 'sahibzadashariqahmedtariqi.com',
  hours: {
    sunday: '2:00 PM - 5:00 PM',
    monday: '2:00 PM - 5:00 PM',
    tuesday: '2:00 PM - 5:00 PM',
    wednesday: '2:00 PM - 5:00 PM',
    thursday: '2:00 PM - 5:00 PM',
    friday: 'Closed (بند)',
    saturday: '2:00 PM - 5:00 PM',
  },
};

// Category keywords with multiple contextual responses
const CATEGORY_RULES = {
  // === MUREED REGISTRATION (HIGH PRIORITY) ===
  mureed: {
    keywords: ['mureed', 'murid', 'mureeed', 'murrid', 'bay\'at', 'bayat', 'bait', 'bayt', 'silsila', 'silsilah', 'tariqa', 'tareeqa', 'tariqah', 'peer', 'pir', 'murshid', 'murshad', 'bnna chahta', 'banna chahta', 'banna chahti', 'bnna chahti', 'mureed bnna', 'mureed banna', 'murid banna', 'murid bnna', 'mureed ban', 'murid ban', 'mureedi', 'irada', 'nisbat', 'intisab', 'halqa', 'khandaan', 'roohani talluq', 'rohani taluq', 'rohani rishta', 'register mureed', 'mureed card', 'mureed registration', 'mureed form'],
    responses: [
      'مریدی کے لیے آپ کا شکریہ! 🤲\nآپ ہماری ویب سائٹ پر مرید رجسٹریشن فارم بھر سکتے ہیں۔ نیچے "مرید رجسٹریشن" پر کلک کریں:\n\nصاحبزادہ شارق احمد طارقی صاحب آپ کی درخواست دیکھ کر جواب دیں گے۔',
      'ماشاءاللہ! مریدی کا ارادہ بہت اچھا ہے۔ 🤲\nآپ ہماری ویب سائٹ پر مرید رجسٹریشن کا فارم بھریں - صاحبزادہ شارق احمد طارقی صاحب خود آپ سے رابطہ کریں گے:',
    ],
    type: 'mureed',
  },

  // === ORDER TRACKING ===
  order_tracking: {
    keywords: ['track order', 'order track', 'mera order', 'order status', 'order kahan', 'delivery', 'shipping', 'dispatch', 'parcel', 'courier', 'order number', 'order id', 'track karo', 'track krna', 'track karna', 'order aya', 'order aaya', 'order nahi aya', 'order nhi aaya', 'kab ayega', 'kab milega', 'order kab', 'shipment', 'delivered', 'pending order', 'mera parcel', 'order milna', 'order dhoondo', 'order find'],
    responses: [
      'آپ اپنے آرڈر کی حالت نیچے "Track Order" بٹن سے چیک کر سکتے ہیں۔ آپ کو اپنا آرڈر نمبر درکار ہوگا:',
      'آرڈر ٹریک کرنے کے لیے نیچے بٹن دبائیں اور اپنا آرڈر نمبر درج کریں:',
    ],
    type: 'order_tracking',
  },

  // === ADDRESS / LOCATION / TIMINGS ===
  address_location: {
    keywords: ['address', 'pata', 'location', 'timing', 'timings', 'waqt', 'hours', 'kab khulta', 'kab band', 'open', 'close', 'closed', 'band', 'khula', 'dawakhana', 'dawakhany', 'dawa khana', 'maktab', 'dukan', 'shop', 'clinic', 'office', 'jagah', 'jaga', 'kahan hai', 'kahan hain', 'kidhar', 'directions', 'map', 'google map', 'karachi', 'new karachi', 'madiha road', 'sector 5', 'kahin aaun', 'kahan aaun', 'ana chahta', 'aana chahta', 'visit karna', 'visit krna', 'pohanchna', 'pohanchun', 'come', 'where is', 'where are', 'working hours', 'opening hours', 'schedule', 'time', 'friday', 'juma', 'jumma', 'hafta', 'week', 'daily', 'roz'],
    responses: [
      `📍 پتہ:\n${BUSINESS_INFO.address}\n\n🕐 اوقات کار:\n• اتوار تا جمعرات: 2:00 بجے سے 5:00 بجے تک\n• ہفتہ: 2:00 بجے سے 5:00 بجے تک\n• جمعہ: بند\n\n📞 فون: ${BUSINESS_INFO.phone}`,
    ],
    type: 'address_location',
  },

  // === LMS STUDENT LOGIN ===
  lms_student: {
    keywords: ['lms', 'student', 'student login', 'login karna', 'login krna', 'log in', 'signin', 'sign in', 'mera account', 'dashboard', 'portal', 'mera course', 'enrolled', 'enrollment', 'lms login', 'student portal', 'student panel', 'my courses', 'my classes', 'meri class', 'mera enrollment', 'certificate', 'progress', 'assignment', 'lecture', 'video lecture', 'online class', 'online course', 'lms student', 'student hn', 'student hon', 'student hoon'],
    responses: [
      'آپ LMS سٹوڈنٹ پورٹل سے اپنے کورسز، لیکچرز اور پروگریس دیکھ سکتے ہیں۔ نیچے لنک سے لاگ ان کریں:',
      'اپنے LMS اکاؤنٹ میں لاگ ان کر کے اپنے کورسز اور لیکچرز تک رسائی حاصل کریں:',
    ],
    type: 'lms_student',
  },

  // === HEALTH CATEGORIES ===
  skin: {
    keywords: ['skin', 'acne', 'pimple', 'rash', 'eczema', 'psoriasis', 'daad', 'khujli', 'jild', 'chamra', 'face', 'chehra', 'glow', 'rang gora', 'whitening', 'cream', 'dhabbe', 'spots', 'dark circles', 'wrinkles', 'jhaiyan', 'daane', 'keel', 'muhase', 'chehre', 'noor', 'rang nikharna', 'safai', 'pimples', 'dagh'],
    productCategory: 'herbal',
    productTags: ['skin', 'face', 'cream', 'beauty', 'glow'],
    productKeywords: ['skin', 'face', 'cream', 'beauty', 'glow', 'chehra', 'rang', 'complexion', 'whitening', 'fair'],
    responses: [
      'جلدی مسائل کے لیے ہمارے پاس خاص جڑی بوٹیوں سے تیار کردہ مصنوعات ہیں جو قدرتی طور پر آپ کی جلد کی دیکھ بھال کریں گی۔ یہ رہیں مناسب مصنوعات:',
      'آپ کی جلد کے مسئلے کے لیے صاحبزادہ صاحب نے خاص فارمولے تیار کیے ہیں۔ ان مصنوعات کو آزمائیں:',
      'جلد کے مسائل عام ہیں لیکن قدرتی علاج سے بہتری آ سکتی ہے۔ ہماری مصنوعات دیکھیں:',
    ],
    suggestAppointment: true,
  },
  digestive: {
    keywords: ['stomach', 'digestion', 'qabz', 'constipation', 'diarrhea', 'ulcer', 'acidity', 'gas', 'pait', 'pet dard', 'hazma', 'appetite', 'bhook', 'liver', 'jigar', 'intestine', 'tez aab', 'badhazmi', 'pait kharab', 'ulti', 'vomit', 'matli', 'nausea'],
    productCategory: 'herbal',
    productTags: ['stomach', 'digestive', 'liver', 'herbal'],
    productKeywords: ['stomach', 'digestive', 'liver', 'pet', 'hazma', 'qabz', 'acidity', 'gastric'],
    responses: [
      'نظامِ ہاضمہ کے مسائل جڑی بوٹیوں سے بہتر ہو سکتے ہیں۔ ہماری جانچ شدہ مصنوعات دیکھیں:',
      'ہاضمے کی خرابی عام مسئلہ ہے۔ صاحبزادہ صاحب کے تیار کردہ فارمولے آزمائیں:',
      'پیٹ کے مسائل کے لیے قدرتی علاج بہترین ہے۔ یہ مصنوعات دیکھیں:',
    ],
    suggestAppointment: true,
  },
  spiritual: {
    keywords: ['nazar', 'evil eye', 'jinn', 'jadu', 'magic', 'black magic', 'kala jadu', 'taweez', 'wazifa', 'ruqyah', 'bandish', 'asaib', 'hamzad', 'spiritual', 'roohani', 'rohani', 'protection', 'hifazat', 'dua', 'istikhara', 'nazar lagna', 'jinnat', 'saya', 'sehr', 'sahar', 'jadoo', 'buri nazar', 'bhoot', 'asar', 'waswasay', 'wahm', 'khwab', 'dream', 'darr', 'darr lagna', 'pareshani', 'stress', 'tension', 'depression', 'anxiety', 'bezaar', 'tang', 'udaas', 'udas', 'zindagi', 'life', 'mushkil', 'mushkilat', 'dil', 'ghabra', 'ghabrahat', 'rona', 'rone', 'akela', 'lonely', 'hopeless', 'umeed', 'naummeed', 'na ummeed', 'himmat', 'haar', 'thak', 'thak gaya', 'haar gaya', 'haar gayi', 'smjh nhi', 'samajh nahi', 'pata nahi', 'confuse', 'confused', 'sad', 'upset', 'frustrated', 'frustation', 'mayoos', 'mayoosi', 'dukh', 'dukhi', 'takleef', 'aziyat', 'fikr', 'fikar', 'preshan', 'worried', 'worry', 'sukoon', 'chain', 'neend nahi', 'raat', 'disturb', 'mentally', 'mental', 'dimagh', 'pagal', 'satana', 'ajeeb'],
    productCategory: 'spiritual',
    productTags: ['spiritual', 'taweez', 'protection', 'ruqyah'],
    productKeywords: ['spiritual', 'rohani', 'taweez', 'protection', 'nazar', 'dua', 'hizbul', 'manzil'],
    responses: [
      'روحانی مسائل کے لیے صاحبزادہ شارق احمد طارقی صاحب خصوصی خدمات فراہم کرتے ہیں۔ اپائنٹمنٹ بک کر کے ان سے بات کریں:',
      'اللہ تعالیٰ ہر مسئلے کا حل رکھتا ہے۔ صاحبزادہ شارق احمد طارقی صاحب سے اپائنٹمنٹ لے کر بات کریں:',
      'روحانی پریشانیوں کا حل موجود ہے۔ صاحبزادہ صاحب سے اپائنٹمنٹ بک کریں:',
    ],
    suggestAppointment: true,
  },
  pain: {
    keywords: ['pain', 'dard', 'headache', 'sir dard', 'backache', 'kamar dard', 'joint', 'joron', 'arthritis', 'muscle', 'body pain', 'knee', 'shoulder', 'sar dard', 'ghutna', 'hath dard', 'paon dard', 'sar ma dard', 'gathiya', 'sujan', 'swelling', 'injury', 'chot', 'toot', 'haddi', 'bone', 'gardan', 'neck'],
    productCategory: 'herbal',
    productTags: ['pain', 'oil', 'relief', 'body'],
    productKeywords: ['pain', 'dard', 'oil', 'joint', 'relief', 'muscle', 'body'],
    responses: [
      'درد کے لیے ہمارے خاص تیل اور جڑی بوٹیوں کی مصنوعات بہت مؤثر ہیں:',
      'جوڑوں اور جسم کے درد کے لیے قدرتی علاج بہترین ہے۔ یہ مصنوعات آزمائیں:',
      'درد سے نجات کے لیے صاحبزادہ صاحب کے تجویز کردہ علاج دیکھیں:',
    ],
    suggestAppointment: true,
  },
  hair: {
    keywords: ['hair', 'baal', 'hair fall', 'baldness', 'ganjapan', 'dandruff', 'khushki', 'hair growth', 'hair oil', 'baal girna', 'baal jharna', 'safed baal', 'white hair', 'baalon', 'hair loss', 'thinning', 'split ends'],
    productCategory: 'herbal',
    productTags: ['hair', 'oil', 'growth'],
    productKeywords: ['hair', 'baal', 'oil', 'growth', 'dandruff', 'scalp'],
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
    productKeywords: ['weight', 'wazan', 'sugar', 'diabetes', 'slim', 'fat', 'cholesterol'],
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
    productKeywords: ['health', 'herbal', 'immunity', 'energy', 'tonic', 'sehat', 'vitamin'],
    responses: [
      'آپ کی صحت ہمارے لیے اہم ہے۔ قدرتی جڑی بوٹیوں سے بنی مصنوعات آپ کی مدد کر سکتی ہیں:',
      'بیماری میں فکر نہ کریں - صاحبزادہ صاحب کے تیار کردہ فارمولے دیکھیں:',
      'صحت کے مسائل کے لیے ہمارے قدرتی ہربل علاج مؤثر ہیں۔ مصنوعات دیکھیں:',
    ],
    suggestAppointment: true,
  },
  mens_health: {
    keywords: ['mardana', 'mardangi', 'timing', 'power', 'taqat', 'strength', 'shadi', 'marriage', 'wedding', 'suhaag raat', 'fertility', 'infertility', 'baanjhpan', 'male', 'virility', 'performance', 'stamina'],
    productCategory: 'herbal',
    productTags: ['men', 'power', 'health', 'herbal'],
    productKeywords: ['men', 'mardana', 'power', 'taqat', 'stamina', 'strength', 'shadi'],
    responses: [
      'مردانہ صحت کے لیے ہمارے خاص قدرتی فارمولے موجود ہیں۔ شادی کی تیاری یا عمومی صحت - سب کا حل ہے:',
      'مردانہ مسائل کے لیے فکر نہ کریں - صاحبزادہ صاحب سے اپائنٹمنٹ لے کر بات کریں:',
    ],
    suggestAppointment: true,
  },
  womens_health: {
    keywords: ['hamal', 'pregnancy', 'period', 'periods', 'mahwari', 'masik', 'pcod', 'pcos', 'uterus', 'bacha', 'aulad', 'female', 'khawateen', 'aurat', 'bachcha dani', 'hormonal', 'breast', 'lactation', 'doodh', 'fertility', 'miscarriage'],
    productCategory: 'herbal',
    productTags: ['women', 'health', 'herbal', 'female', 'fertility'],
    productKeywords: ['women', 'female', 'fertility', 'pregnancy', 'period', 'hormonal', 'miscarriage'],
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
    productKeywords: ['eye', 'nazar', 'vision', 'aankhein'],
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
    productKeywords: ['kidney', 'gurda', 'pathri', 'stone', 'urine'],
    responses: [
      'گردے اور پیشاب کے مسائل کے لیے ہمارے قدرتی جڑی بوٹیوں کے فارمولے:',
      'گردے کی پتھری یا دیگر مسائل - صاحبزادہ صاحب سے اپائنٹمنٹ لے کر مشورہ کریں:',
    ],
    suggestAppointment: true,
  },

  // === FUNCTIONAL CATEGORIES ===
  courses: {
    keywords: ['course', 'courses', 'learn', 'seekhna', 'class', 'classes', 'training', 'study', 'ilm', 'knowledge', 'sikho', 'enroll', 'admission', 'taaleem', 'padhai', 'parhna', 'seekhein', 'sikhao', 'diploma', 'certificate course', 'online course', 'fee', 'course fee', 'syllabus', 'curriculum', 'teacher', 'ustaad', 'taleem', 'education'],
    responses: [
      'ہمارے تعلیمی کورسز میں آپ روحانیت، طب اور مزید بہت کچھ سیکھ سکتے ہیں۔ یہ رہے دستیاب کورسز:',
      'صاحبزادہ شارق احمد طارقی صاحب کے زیرِ نگرانی تعلیمی کورسز دستیاب ہیں۔ ابھی اندراج کریں:',
    ],
    type: 'courses',
  },
  appointment: {
    keywords: ['appointment', 'mulaqat', 'milna chahta', 'consult', 'mashwara', 'visit', 'checkup', 'doctor', 'hakeem', 'treatment', 'ilaj', 'book appointment', 'appointment book', 'milna', 'rabta karna', 'baat krna', 'baat karna', 'baat chahta', 'baat chahti', 'ap sy baat', 'aap se baat', 'ap se baat', 'baat kr', 'refer', 'suggest', 'consultation', 'discuss', 'meet', 'meeting', 'mil sakta', 'mil sakti', 'rabta', 'contact karna', 'mulaaqat', 'dekhna chahta', 'dikhana chahta'],
    responses: [
      'آپ صاحبزادہ شارق احمد طارقی صاحب سے اپائنٹمنٹ بک کر کے بات کر سکتے ہیں۔ ابھی بک کریں:',
      'ملاقات کا وقت مقرر کرنے کے لیے نیچے Book Now دبائیں:',
    ],
    type: 'appointment',
  },
  greeting: {
    keywords: ['hello', 'hi', 'hey', 'salam', 'assalam', 'assalamu', 'aoa', 'good morning', 'good evening', 'how are you', 'kaise ho', 'kya haal', 'namaste', 'bohat achy', 'aadaab', 'g'],
    responses: [
      'وعلیکم السلام! 🌿\nمیں طارقی AI اسسٹنٹ ہوں۔ آپ مجھ سے اپنا مسئلہ بتائیں - میں آپ کو مناسب مصنوعات تجویز کروں گا۔\n\nیا نیچے سے کوئی آپشن منتخب کریں:',
      'وعلیکم السلام! خوش آمدید 🌿\nمیں آپ کی کیا مدد کر سکتا ہوں؟ اپنا مسئلہ بتائیں یا آپشنز میں سے منتخب کریں:',
    ],
    type: 'greeting',
  },
  products: {
    keywords: ['product', 'products', 'shop', 'buy', 'kharidna', 'order karna', 'order krna', 'price', 'qeemat', 'dawa', 'medicine', 'dawai', 'khareed', 'dikhao', 'show', 'dekho', 'store', 'mall'],
    responses: [
      'ہماری تمام مصنوعات قدرتی جڑی بوٹیوں سے بنی ہیں۔ یہ رہیں:',
      'ہمارے اسٹور کی مشہور مصنوعات دیکھیں:',
    ],
    type: 'products',
  },
  services: {
    keywords: ['service', 'services', 'kya karte', 'what do you do', 'kya milta', 'provide', 'offer', 'khidmat', 'khidmaat'],
    responses: [
      'ہم روحانی علاج، جڑی بوٹیوں کا علاج اور مزید خدمات فراہم کرتے ہیں:',
      'ہماری خدمات میں استخارہ، روحانی مشاورت، حکمت اور مزید شامل ہیں:',
    ],
    type: 'services',
  },
  about: {
    keywords: ['about', 'barein', 'kaun', 'who', 'website', 'kis ki', 'ye kya', 'yeh kya', 'batao', 'bataen', 'introduction', 'taaruf', 'kon hain', 'kya kaam'],
    responses: [
      `یہ صاحبزادہ شارق احمد طارقی صاحب کی آفیشل ویب سائٹ ہے۔ آپ روحانی علاج، جڑی بوٹیوں کی ادویات، تعلیمی کورسز اور مزید بہت کچھ یہاں پا سکتے ہیں۔\n\n📍 ${BUSINESS_INFO.address}\n📞 فون: ${BUSINESS_INFO.phone}`,
    ],
    type: 'about',
  },
  contact: {
    keywords: ['contact', 'phone', 'number', 'whatsapp', 'email', 'rabta', 'fone', 'mobile', 'social media', 'facebook', 'instagram', 'call karna', 'call krna'],
    responses: [
      `رابطے کی تفصیلات:\n\n📞 فون/واٹس ایپ: ${BUSINESS_INFO.phone}\n📍 پتہ: ${BUSINESS_INFO.address}\n🌐 ویب سائٹ: ${BUSINESS_INFO.website}\n\nنیچے "واٹس ایپ" بٹن دبا کر براہ راست بات کریں:`,
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
    keywords: ['donate', 'donation', 'sadqa', 'sadqah', 'zakat', 'khairat', 'chanda', 'paisa dena', 'madad karna', 'atiya', 'lillah', 'infaq', 'charity', 'give', 'dena chahta', 'donate karna', 'donate krna', 'fund', 'help financially'],
    responses: [
      'آپ ہماری ویب سائٹ پر صدقہ، زکوٰۃ اور خیرات کے لیے عطیہ دے سکتے ہیں۔ آپ کا ہر عطیہ اللہ کی راہ میں ہے۔ 🤲',
      'جزاک اللہ آپ کے عطیےکی نیت پر! صدقہ، زکوٰۃ، للّٰہ - سب آپشنز دستیاب ہیں:',
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
  { label: '🤲 Mureed Registration', value: 'mureed bnna chahta hn' },
  { label: '💊 Health Issues', value: 'health problem tabiyat kharab' },
  { label: '📦 Track Order', value: 'track my order' },
  { label: '❤️ Donate', value: 'donate sadqa zakat' },
  { label: '🎓 LMS Login', value: 'student login lms' },
  { label: '📍 Address & Timings', value: 'address timing location' },
  { label: '📞 Contact', value: 'contact information rabta' },
];

// ============================================
// LANGUAGE DETECTION
// ============================================
function detectLanguage(message) {
  const text = message.trim();
  if (!text) return 'roman_urdu';

  // Count Urdu/Arabic script characters
  const urduRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const urduChars = (text.match(urduRegex) || []).length;
  const nonSpaceChars = text.replace(/\s/g, '').length;

  // If more than 40% Urdu script characters, it's Urdu
  if (nonSpaceChars > 0 && urduChars / nonSpaceChars > 0.4) return 'urdu';

  // Check for Roman Urdu marker words
  const romanUrduMarkers = [
    'hai', 'hain', 'nahi', 'nhi', 'kya', 'kaise', 'kasy', 'bhi', 'aur',
    'mein', 'ho', 'ha', 'hoon', 'hon', 'tha', 'thi', 'karo', 'karna',
    'krna', 'wala', 'wali', 'chahiye', 'chahte', 'sakte', 'sakta',
    'bohat', 'bahut', 'bht', 'acha', 'achy', 'theek', 'thik',
    'jee', 'ji', 'yeh', 'ye', 'wo', 'woh', 'kuch', 'koi',
    'apna', 'apni', 'apne', 'mera', 'meri', 'abhi', 'phir',
    'lekin', 'magar', 'agr', 'agar', 'jab', 'tab',
    'kaisa', 'kaisi', 'kitna', 'kitni', 'kahan', 'yahan',
    'sab', 'sub', 'dena', 'lena', 'batao', 'bataen', 'btao',
    'karein', 'milti', 'milta', 'hota', 'hoti', 'raha', 'rahi',
    'chahta', 'chahti', 'dard', 'sehat', 'tabiyat', 'masla',
    'masail', 'ilaaj', 'dawai', 'pareshani', 'taklif', 'takleef',
    'kharab', 'kamyabi', 'zaroorat', 'madad', 'pehle', 'baad',
    'liye', 'wajah', 'kyun', 'kyu', 'kon', 'kaun', 'kidhar',
    'salam', 'walaikum', 'assalam', 'mashwara', 'shifa', 'rohani',
  ];

  const words = text.toLowerCase().split(/\s+/);
  let romanUrduCount = 0;
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (romanUrduMarkers.includes(cleanWord)) romanUrduCount++;
  }

  if (words.length <= 5 && romanUrduCount >= 1) return 'roman_urdu';
  if (words.length > 5 && romanUrduCount / words.length > 0.15) return 'roman_urdu';

  return 'english';
}

// ============================================
// MULTI-LANGUAGE RESPONSES
// ============================================
const ROMAN_URDU_RESPONSES = {
  // === NEW CATEGORIES ===
  mureed: [
    'MashaAllah! Mureedi ka irada bohat acha hai. 🤲\nAap hamari website par Mureed Registration ka form bhar sakte hain. Neeche "Mureed Registration" button par click karein:\n\nSahibzada Shariq Ahmed Tariqi sahab khud aap se rabta karenge.',
    'Mureedi ke liye aap ka shukriya! 🤲\nAap hamari website par mureed registration form bharein - Sahibzada Shariq Ahmed Tariqi sahab aap ki darkhwast dekh kar jawab denge:',
  ],
  order_tracking: [
    'Aap apne order ki haalat neeche "Track Order" button se check kar sakte hain. Aap ko apna order number darna hoga:',
    'Order track karne ke liye neeche button dabaein aur apna order number darj karein:',
  ],
  address_location: [
    `📍 Pata:\n${BUSINESS_INFO.address}\n\n🕐 Timing:\n• Sunday se Thursday: 2:00 PM - 5:00 PM\n• Saturday: 2:00 PM - 5:00 PM\n• Friday: Band (Closed)\n\n📞 Phone: ${BUSINESS_INFO.phone}`,
  ],
  lms_student: [
    'Aap LMS Student Portal se apne courses, lectures aur progress dekh sakte hain. Neeche link se login karein:',
    'Apne LMS account mein login kar ke apne courses aur lectures tak access haasil karein:',
  ],

  // === EXISTING CATEGORIES ===
  skin: [
    'Aap ki skin ke masle ke liye hamare khaas herbal products hain jo qudrati tor par aap ki jild ki dekh bhaal karein ge. Ye dekhein:',
    'Jild ke masail aam hain lekin qudrati ilaaj se behteri aa sakti hai. Hamare products dekhein:',
    'Sahibzada Shariq Ahmed Tariqi sahab ke khaas formula aap ki skin ke liye tayyar kiye gaye hain. Ye products dekhein:',
  ],
  digestive: [
    'Hazme ke masail jari bootiyon se behtar ho sakte hain. Hamare products dekhein:',
    'Pet ke masail ke liye qudrati ilaaj behtareen hai. Ye products dekhein:',
    'Hazme ki kharabi aam masla hai. Sahibzada sahab ke formula azmain:',
  ],
  spiritual: [
    'Rohani masail ke liye Sahibzada Shariq Ahmed Tariqi sahab khaas khidmaat faraham karte hain. Hamare products aur services dekhein:',
    'Allah Taala har masle ka hal rakhta hai. Hamare rohani ilaaj aur products haazir hain:',
    'Rohani pareshaniyon ka hal mojood hai. Sahibzada Shariq Ahmed Tariqi sahab se appointment le kar baat karein:',
  ],
  pain: [
    'Dard ke liye hamare khaas oils aur herbal products bohat moassar hain:',
    'Joron aur jism ke dard ke liye qudrati ilaaj behtareen hai. Ye products azmain:',
    'Dard se nijaat ke liye Sahibzada sahab ke tajweez karda ilaaj dekhein:',
  ],
  hair: [
    'Baalon ke masail ke liye hamare khaas herbal oils aur products dekhein:',
    'Baal girna, khushki ya safed hona - sab ka ilaaj hamare paas hai:',
    'Qudrati jari bootiyon se bani products baalon ke liye behtareen hain:',
  ],
  weight: [
    'Wazan aur sugar ke masail ke liye hamare qudrati formula bohat moassar hain:',
    'Motapa aur diabetes ke liye jari bootiyon ka ilaaj azmain:',
    'Wazan control aur sehatmand zindagi ke liye hamare products dekhein:',
  ],
  health_general: [
    'Aap ki sehat hamare liye ahem hai. Qudrati jari bootiyon se bani products aap ki madad kar sakti hain:',
    'Bemari mein fikar na karein - Sahibzada sahab ke tayyar karda formula dekhein:',
    'Sehat ke masail ke liye hamare qudrati herbal ilaaj moassar hain. Products dekhein:',
  ],
  mens_health: [
    'Mardana sehat ke liye hamare khaas qudrati formula mojood hain. Shadi ki tayyari ya aam sehat - sab ka hal hai:',
    'Mardana masail ke liye fikar na karein - Sahibzada sahab se appointment le kar baat karein:',
  ],
  womens_health: [
    'Khawateen ki sehat ke liye hamare khaas herbal formula mojood hain:',
    'Khawateen ke masail ka qudrati hal - hamare products dekhein:',
  ],
  eye: [
    'Aankhon ke masail ke liye hamare qudrati ilaaj mojood hain:',
    'Nazar ki kamzori ka qudrati hal - hamare products dekhein:',
  ],
  kidney: [
    'Gurde aur peshab ke masail ke liye hamare qudrati jari bootiyon ke formula dekhein:',
    'Gurde ki pathri ya degar masail ke liye Sahibzada sahab se appointment le kar mashwara karein:',
  ],
  courses: [
    'Hamare courses mein aap rohaniyat, tib aur bohat kuch seekh sakte hain. Ye hain dastiyaab courses:',
    'Sahibzada Shariq Ahmed Tariqi sahab ke zeir nigrani taleemi courses dastiyaab hain. Abhi enrollment karein:',
  ],
  appointment: [
    'Aap Sahibzada Shariq Ahmed Tariqi sahab se appointment book kar ke baat kar sakte hain. Abhi book karein:',
    'Mulaqat ka waqt muqarrar karne ke liye neeche Book Now dabain:',
  ],
  greeting: [
    'Walaikum Assalam! 🌿\nMein Tariqi AI Assistant hoon. Aap mujhe apna masla bataein - mein aap ko munasib products tajweez karunga.\n\nYa neeche se koi option select karein:',
    'Walaikum Assalam! Khush aamdeed 🌿\nMein aap ki kya madad kar sakta hoon? Apna masla bataein ya options mein se select karein:',
  ],
  products: [
    'Hamari tamam products qudrati jari bootiyon se bani hain. Ye dekhein:',
    'Hamare store ki mashhoor products dekhein:',
  ],
  services: [
    'Hum rohani ilaaj, jari bootiyon ka ilaaj aur mazeed services faraham karte hain:',
    'Hamari services mein istikhara, rohani mashwarat, hikmat aur mazeed shaamil hain:',
  ],
  about: [
    `Ye Sahibzada Shariq Ahmed Tariqi sahab ki official website hai. Aap rohani ilaaj, herbal medicines, courses aur bohat kuch yahan pa sakte hain.\n\n📍 ${BUSINESS_INFO.address}\n📞 Phone: ${BUSINESS_INFO.phone}`,
  ],
  contact: [
    `Rabte ki details:\n\n📞 Phone/WhatsApp: ${BUSINESS_INFO.phone}\n📍 Pata: ${BUSINESS_INFO.address}\n🌐 Website: ${BUSINESS_INFO.website}\n\nNeeche WhatsApp button daba kar seedha baat karein:`,
  ],
  thanks: [
    'Shukriya! 🌿 Allah aap ko sehat o aafiyat ata farmaye. Agar koi aur sawal ho to zaroor poochein!',
    'JazakAllah! Aap ki khidmat mein haazir hoon. Koi aur madad chahein to bataein 🤲',
  ],
  donate: [
    'Aap hamari website par sadqa, zakat aur khairaat ke liye donate kar sakte hain. Aap ka har atiya Allah ki raah mein hai. 🤲',
    'JazakAllah aap ke atiye ki niyat par! Sadqa, Zakat, Lillah - sab options dastiyaab hain:',
  ],
};

const ENGLISH_RESPONSES = {
  // === NEW CATEGORIES ===
  mureed: [
    'MashaAllah! Your intention to become a Mureed is wonderful. 🤲\nYou can fill out the Mureed Registration form on our website. Click "Mureed Registration" below:\n\nSahibzada Shariq Ahmed Tariqi will personally review your application and get in touch with you.',
    'Thank you for your interest in becoming a Mureed! 🤲\nPlease fill out the registration form on our website - Sahibzada Shariq Ahmed Tariqi will respond to your request:',
  ],
  order_tracking: [
    'You can check your order status using the "Track Order" button below. You\'ll need your order number:',
    'To track your order, click the button below and enter your order number:',
  ],
  address_location: [
    `📍 Address:\n${BUSINESS_INFO.address}\n\n🕐 Working Hours:\n• Sunday to Thursday: 2:00 PM - 5:00 PM\n• Saturday: 2:00 PM - 5:00 PM\n• Friday: Closed\n\n📞 Phone: ${BUSINESS_INFO.phone}`,
  ],
  lms_student: [
    'You can access your courses, lectures and progress through the LMS Student Portal. Login using the link below:',
    'Login to your LMS account to access your courses and lectures:',
  ],

  // === EXISTING CATEGORIES ===
  skin: [
    'We have special herbal products for skin issues that naturally care for your skin. Check them out:',
    'Skin problems are common but can improve with natural remedies. See our products:',
  ],
  digestive: [
    'Natural herbal remedies are best for digestive issues. Check our products:',
    'Digestive problems are common. Try our specially prepared herbal formulas:',
  ],
  spiritual: [
    'Sahibzada Shariq Ahmed Tariqi provides special spiritual healing services. See our products and services:',
    'Allah has a solution for every problem. Check our spiritual remedies:',
  ],
  pain: [
    'Our special oils and herbal products are very effective for pain relief:',
    'Natural remedies are best for body and joint pain. Try these products:',
  ],
  hair: [
    'Check out our special herbal oils and products for hair problems:',
    'Hair fall, dandruff, or greying - we have solutions for all:',
  ],
  weight: [
    'Our natural formulas are very effective for weight and sugar problems:',
    'Try our herbal remedies for obesity and diabetes:',
  ],
  health_general: [
    'Your health is important to us. Our natural herbal products can help:',
    'Don\'t worry - check out our effective herbal formulas by Sahibzada Shariq Ahmed Tariqi:',
  ],
  mens_health: [
    'We have special natural formulas for men\'s health and wellness:',
  ],
  womens_health: [
    'We have special herbal formulas for women\'s health:',
  ],
  eye: [
    'We have natural remedies for eye problems:',
  ],
  kidney: [
    'Natural herbal formulas for kidney and urinary issues:',
  ],
  courses: [
    'Learn about spirituality, herbal medicine and more through our courses. Here are the available courses:',
    'Educational courses under Sahibzada Shariq Ahmed Tariqi\'s supervision are available. Enroll now:',
  ],
  appointment: [
    'You can book an appointment with Sahibzada Shariq Ahmed Tariqi to discuss your concerns. Book now:',
  ],
  greeting: [
    'Hello! Welcome! 🌿\nI\'m Tariqi AI Assistant. Tell me about any health concern and I\'ll suggest suitable herbal products.\n\nOr select an option below:',
    'Hi there! Welcome! 🌿\nHow can I help you? Share your concern or select from the options:',
  ],
  products: [
    'All our products are made from natural herbs. Here they are:',
    'Check out our popular herbal products:',
  ],
  services: [
    'We provide spiritual healing, herbal treatments and more:',
    'Our services include Istikhara, spiritual consultation, herbal medicine and more:',
  ],
  about: [
    `This is the official website of Sahibzada Shariq Ahmed Tariqi. Find spiritual healing, herbal medicines, courses and more.\n\n📍 ${BUSINESS_INFO.address}\n📞 Phone: ${BUSINESS_INFO.phone}`,
  ],
  contact: [
    `Contact Details:\n\n📞 Phone/WhatsApp: ${BUSINESS_INFO.phone}\n📍 Address: ${BUSINESS_INFO.address}\n🌐 Website: ${BUSINESS_INFO.website}\n\nClick the WhatsApp button below to chat directly:`,
  ],
  thanks: [
    'Thank you! 🌿 May Allah grant you health and wellness. Feel free to ask any more questions!',
    'JazakAllah! I\'m here to help. Let me know if you need anything else 🤲',
  ],
  donate: [
    'You can donate for Sadqa, Zakat and charity on our website. Every contribution counts in the path of Allah. 🤲',
    'JazakAllah for your generous intention! Sadqa, Zakat, Lillah - all options are available:',
  ],
};

// Get response based on detected language
function getResponseForLanguage(category, language) {
  if (language === 'roman_urdu' && ROMAN_URDU_RESPONSES[category]) {
    return getRandomResponse(ROMAN_URDU_RESPONSES[category]);
  }
  if (language === 'english' && ENGLISH_RESPONSES[category]) {
    return getRandomResponse(ENGLISH_RESPONSES[category]);
  }
  // Default: Urdu responses
  return getRandomResponse(CATEGORY_RULES[category].responses);
}

// Smart category detection with scoring (best match wins)
function detectCategory(message) {
  const lowerMsg = message.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  // Priority categories get a bonus - these should be matched first if keywords hit
  const priorityCategories = ['mureed', 'order_tracking', 'address_location', 'lms_student', 'donate'];

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
          score += kw.length >= 8 ? 5 : kw.length >= 6 ? 3 : 2; // Longer keywords = higher confidence
        }
      }
    }

    // Priority categories get a boost to ensure they win ties
    if (score > 0 && priorityCategories.includes(key)) {
      score += 2;
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

// Fetch products by category/tags/keywords from DB - SMART RELEVANCE MATCHING
async function fetchRelevantProducts(rule, limit = 4) {
  try {
    const query = { isActive: true };

    if (rule.productCategory) {
      query.category = rule.productCategory;
    }

    let products = await Product.find(query)
      .select('name shortDescription description price image category tags priceINR')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(20) // Fetch more to filter by relevance
      .lean();

    // Score each product by relevance to the category
    if (rule.productKeywords && rule.productKeywords.length > 0) {
      const scoredProducts = products.map(p => {
        let score = 0;
        const name = (p.name || '').toLowerCase();
        const desc = ((p.shortDescription || '') + ' ' + (p.description || '')).toLowerCase();
        const tags = (p.tags || []).map(t => t.toLowerCase());

        for (const kw of rule.productKeywords) {
          const kwLower = kw.toLowerCase();
          if (name.includes(kwLower)) score += 5; // Name match = highest relevance
          if (tags.includes(kwLower)) score += 3; // Tag match = high relevance
          if (desc.includes(kwLower)) score += 2; // Description match = medium relevance
        }

        // Also check productTags
        if (rule.productTags && rule.productTags.length > 0) {
          for (const tag of rule.productTags) {
            if (tags.includes(tag.toLowerCase())) score += 3;
            if (name.includes(tag.toLowerCase())) score += 4;
          }
        }

        return { ...p, relevanceScore: score };
      });

      // Sort by relevance score (highest first), then filter those with score > 0
      scoredProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const relevant = scoredProducts.filter(p => p.relevanceScore > 0);

      if (relevant.length > 0) {
        return relevant.slice(0, limit).map(({ relevanceScore, description, ...rest }) => rest);
      }
    }

    // Fallback: tag-based filtering
    if (rule.productTags && rule.productTags.length > 0 && products.length > 0) {
      const tagFiltered = products.filter(p =>
        p.tags && p.tags.some(t => rule.productTags.includes(t.toLowerCase()))
      );
      if (tagFiltered.length > 0) {
        return tagFiltered.slice(0, limit).map(({ description, ...rest }) => rest);
      }
    }

    return products.slice(0, limit).map(({ description, ...rest }) => rest);
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
// AI FALLBACK CHAIN - SMART MULTI-MODEL
// ============================================

// Best free models on OpenRouter (VERIFIED available - ranked by quality)
const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',       // Llama 3.3 70B - best quality, strong multilingual
  'nousresearch/hermes-3-llama-3.1-405b:free',     // 405B! Largest free model
  'qwen/qwen3-next-80b-a3b-instruct:free',         // Qwen 3 80B - very strong at Urdu
  'google/gemma-3-27b-it:free',                     // Gemma 3 27B - good multilingual
  'mistralai/mistral-small-3.1-24b-instruct:free', // Mistral Small - decent
  'nvidia/nemotron-3-nano-30b-a3b:free',            // CONFIRMED WORKING fallback
];

function buildSystemPrompt(products, services, language) {
  const topProducts = products.slice(0, 8).map(p => `${p.name} (Rs.${p.price})`).join(', ');
  const topServices = services.slice(0, 5).map(s => s.title).join(', ');

  const langRules = {
    roman_urdu: `REPLY ONLY IN ROMAN URDU (Latin letters). NEVER use Urdu/Arabic script like ا ب پ. Example: "Aap ki sehat ke liye hamare products bohat achay hain."`,
    urdu: `REPLY ONLY IN URDU SCRIPT (Arabic/Urdu characters). NEVER use English/Latin letters. Example: "آپ کی صحت کے لیے ہماری مصنوعات بہت اچھی ہیں۔"`,
    english: `REPLY ONLY IN ENGLISH. Do not use Urdu script or Roman Urdu.`,
  };

  return `You are Tariqi AI Assistant for Sahibzada Shariq Ahmed Tariqi's website - a spiritual healer & herbal medicine expert in Karachi, Pakistan.

LANGUAGE: ${langRules[language] || langRules.roman_urdu}

BUSINESS INFO:
- Address: ${BUSINESS_INFO.address}
- Phone: ${BUSINESS_INFO.phone}
- Hours: Sunday-Thursday & Saturday: 2-5 PM, Friday: CLOSED
- Website: ${BUSINESS_INFO.website}
- Appointments: sahibzadashariqahmedtariqi.com/appointments
- Mureed Registration: sahibzadashariqahmedtariqi.com/mureed-registration
- LMS Student Portal: sahibzadashariqahmedtariqi.com/lms
- Donations: sahibzadashariqahmedtariqi.com/donate
- Order Tracking: sahibzadashariqahmedtariqi.com/track-order
- Products: sahibzadashariqahmedtariqi.com/products
- Courses: sahibzadashariqahmedtariqi.com/courses

RULES:
- Give 2-3 SHORT, helpful sentences. Be warm and caring.
- Suggest relevant products/services from the list below when appropriate.
- For health issues, suggest relevant products AND recommend booking an appointment.
- If someone wants to become a mureed, refer them to the Mureed Registration page.
- If someone is a student, refer them to LMS Student Portal for login.
- If someone asks about address/timing/location, give the full address and hours.
- If someone wants to track their order, tell them to use Track Order page.
- If someone wants to donate, refer them to the Donations page.
- For serious issues, recommend booking an appointment with Sahibzada Shariq Ahmed Tariqi.
- NEVER diagnose diseases. NEVER mix languages/scripts.
- Always refer to the person as "Sahibzada Shariq Ahmed Tariqi sahab" (not Hakeem).

Products: ${topProducts || 'Various herbal products'}
Services: ${topServices || 'Spiritual healing, Istikhara, Consultation'}`;
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

// 2. OpenRouter - Try multiple free models (best first)
async function callOpenRouter(userMessage, systemPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  for (const model of FREE_MODELS) {
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
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 350,
          temperature: 0.6,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 10) {
          console.log(`OpenRouter AI (${model}): success`);
          return text.trim();
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.log(`OpenRouter (${model}): ${res.status} - trying next model...`);
      }
    } catch (e) {
      console.log(`OpenRouter (${model}): error - ${e.message} - trying next...`);
    }
  }
  console.error('OpenRouter: all models failed');
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
async function callAI(userMessage, products, services, language) {
  const systemPrompt = buildSystemPrompt(products, services, language);

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
    const { message, language: clientLanguage } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const sanitizedMessage = message.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim().slice(0, 500);
    if (sanitizedMessage.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid message' });
    }

    // Use client-selected language if provided, otherwise auto-detect
    const validLanguages = ['urdu', 'roman_urdu', 'english'];
    const language = validLanguages.includes(clientLanguage) ? clientLanguage : detectLanguage(sanitizedMessage);
    console.log('Language:', language, '(source:', validLanguages.includes(clientLanguage) ? 'client' : 'auto-detect', ') for:', sanitizedMessage.substring(0, 50));

    // Step 1: Smart scoring-based category matching
    const detected = detectCategory(sanitizedMessage);

    if (detected) {
      const { category, rule } = detected;

      // === GREETING ===
      if (rule.type === 'greeting') {
        return res.json({
          success: true,
          data: { reply: getResponseForLanguage(category, language), type: 'greeting', quickReplies: QUICK_REPLIES },
        });
      }

      // === THANKS ===
      if (rule.type === 'thanks') {
        return res.json({
          success: true,
          data: {
            reply: getResponseForLanguage(category, language),
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
            reply: getResponseForLanguage(category, language),
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
            reply: getResponseForLanguage(category, language),
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
            reply: getResponseForLanguage(category, language),
            type: 'donate',
            quickReplies: [
              { label: '❤️ Donate Now', value: 'LINK:/donate' },
              { label: '� Book Appointment', value: 'appointment book' },
              { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
            ],
          },
        });
      }

      // === MUREED REGISTRATION ===
      if (rule.type === 'mureed') {
        return res.json({
          success: true,
          data: {
            reply: getResponseForLanguage(category, language),
            type: 'mureed',
            quickReplies: [
              { label: '🤲 Mureed Registration', value: 'LINK:/mureed-registration' },
              { label: '📅 Book Appointment', value: 'appointment book' },
              { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
            ],
          },
        });
      }

      // === ORDER TRACKING ===
      if (rule.type === 'order_tracking') {
        return res.json({
          success: true,
          data: {
            reply: getResponseForLanguage(category, language),
            type: 'order_tracking',
            quickReplies: [
              { label: '📦 Track Order', value: 'LINK:/track-order' },
              { label: '🛒 View Products', value: 'LINK:/products' },
              { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
            ],
          },
        });
      }

      // === ADDRESS / LOCATION / TIMINGS ===
      if (rule.type === 'address_location') {
        return res.json({
          success: true,
          data: {
            reply: getResponseForLanguage(category, language),
            type: 'address_location',
            quickReplies: [
              { label: '📍 Google Maps', value: 'LINK:https://maps.google.com/?q=Shop+No+2334+43+LS+13-14+Madiha+Road+Sector+5+A+1+New+Karachi+Town+Karachi' },
              { label: '📅 Book Appointment', value: 'appointment book' },
              { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
            ],
          },
        });
      }

      // === LMS STUDENT LOGIN ===
      if (rule.type === 'lms_student') {
        return res.json({
          success: true,
          data: {
            reply: getResponseForLanguage(category, language),
            type: 'lms_student',
            quickReplies: [
              { label: '🎓 LMS Login', value: 'LINK:/lms/login' },
              { label: '📚 View Courses', value: 'LINK:/courses' },
              { label: '�📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
            ],
          },
        });
      }

      // === APPOINTMENT ===
      if (rule.type === 'appointment') {
        return res.json({
          success: true,
          data: {
            reply: getResponseForLanguage(category, language),
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
            reply: getResponseForLanguage(category, language),
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
            reply: getResponseForLanguage(category, language),
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
            reply: getResponseForLanguage(category, language),
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
      const reply = getResponseForLanguage(category, language);
      const responseData = {
        reply,
        type: 'product_suggestion',
        products,
        quickReplies: [{ label: '🛒 View All Products', value: 'LINK:/products' }],
      };

      if (rule.suggestAppointment) {
        const appointmentMsg = language === 'roman_urdu'
          ? '\n\nAgar masla serious ho to Sahibzada Shariq Ahmed Tariqi sahab se appointment le kar zaroor baat karein.'
          : language === 'english'
          ? '\n\nIf the issue is serious, please book an appointment with Sahibzada Shariq Ahmed Tariqi.'
          : '\n\nاگر مسئلہ سنگین ہو تو صاحبزادہ شارق احمد طارقی صاحب سے اپائنٹمنٹ لے کر ضرور بات کریں۔';
        responseData.reply += appointmentMsg;
        responseData.quickReplies.unshift({ label: '📅 Book Appointment', value: 'appointment book' });
      } else {
        responseData.quickReplies.push({ label: '📅 Book Appointment', value: 'appointment book' });
      }

      return res.json({ success: true, data: responseData });
    }

    // Step 2: No rule matched - try AI APIs as fallback
    const [products, services] = await Promise.all([
      Product.find({ isActive: true }).select('name shortDescription price category tags').sort({ isFeatured: -1 }).limit(15).lean(),
      Service.find({ isActive: true }).select('title shortDescription category').sort({ order: 1 }).limit(10).lean(),
    ]);

    const aiReply = await callAI(sanitizedMessage, products, services, language);

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
        reply: language === 'roman_urdu'
          ? 'Aap ke sawal ka shukriya! 🌿\nBehtar madad ke liye neeche diye gaye options mein se koi select karein, ya apna masla tafseel se bataein.\n\nAap Sahibzada Shariq Ahmed Tariqi sahab se appointment le kar bhi baat kar sakte hain.'
          : language === 'english'
          ? 'Thank you for your question! 🌿\nPlease select one of the options below for better help, or describe your issue in detail.\n\nYou can also book an appointment with Sahibzada Shariq Ahmed Tariqi.'
          : 'آپ کے سوال کا شکریہ! 🌿\nبہتر مدد کے لیے نیچے دیے گئے آپشنز میں سے کوئی منتخب کریں، یا اپنا مسئلہ تفصیل سے بتائیں۔\n\nآپ صاحبزادہ شارق احمد طارقی صاحب سے اپائنٹمنٹ لے کر بھی بات کر سکتے ہیں۔',
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

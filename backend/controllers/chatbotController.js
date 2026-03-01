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
      'آپ کی جلد کے مسئلے کے لیے صاحبزادہ صاحب نے خاص فارمولے تیار کیے ہیں۔ ان مصنوعات کو آزمائیں:',
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
      'ہاضمے کی خرابی عام مسئلہ ہے۔ صاحبزادہ صاحب کے تیار کردہ فارمولے آزمائیں:',
      'پیٹ کے مسائل کے لیے قدرتی علاج بہترین ہے۔ یہ مصنوعات دیکھیں:',
    ],
    suggestAppointment: true,
  },
  spiritual: {
    keywords: ['nazar', 'evil eye', 'jinn', 'jadu', 'magic', 'black magic', 'kala jadu', 'taweez', 'wazifa', 'ruqyah', 'bandish', 'asaib', 'hamzad', 'spiritual', 'roohani', 'rohani', 'protection', 'hifazat', 'dua', 'istikhara', 'nazar lagna', 'jinnat', 'saya', 'sehr', 'sahar', 'jadoo', 'buri nazar', 'bhoot', 'asar', 'waswasay', 'wahm', 'khwab', 'dream', 'darr', 'darr lagna', 'pareshani', 'stress', 'tension', 'depression', 'anxiety', 'bezaar', 'tang', 'udaas', 'udas', 'zindagi', 'life', 'mushkil', 'mushkilat', 'dil', 'ghabra', 'ghabrahat', 'rona', 'rone', 'akela', 'lonely', 'hopeless', 'umeed', 'naummeed', 'na ummeed', 'himmat', 'haar', 'thak', 'thak gaya', 'haar gaya', 'haar gayi', 'smjh nhi', 'samajh nahi', 'pata nahi', 'confuse', 'confused', 'sad', 'upset', 'frustrated', 'frustation', 'mayoos', 'mayoosi', 'dukh', 'dukhi', 'takleef', 'aziyat', 'fikr', 'fikar', 'preshan', 'worried', 'worry', 'sukoon', 'chain', 'neend nahi', 'raat', 'disturb', 'mentally', 'mental', 'dimagh', 'pagal', 'satana', 'ajeeb'],
    productCategory: 'spiritual',
    productTags: ['spiritual', 'taweez', 'protection', 'ruqyah'],
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
      'بیماری میں فکر نہ کریں - صاحبزادہ صاحب کے تیار کردہ فارمولے دیکھیں:',
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
      'مردانہ مسائل کے لیے فکر نہ کریں - صاحبزادہ صاحب سے اپائنٹمنٹ لے کر بات کریں:',
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
      'گردے کی پتھری یا دیگر مسائل - صاحبزادہ صاحب سے اپائنٹمنٹ لے کر مشورہ کریں:',
    ],
    suggestAppointment: true,
  },
  courses: {
    keywords: ['course', 'learn', 'seekhna', 'class', 'training', 'study', 'ilm', 'knowledge', 'sikho', 'enroll', 'admission', 'taaleem', 'padhai', 'parhna', 'seekhein', 'sikhao'],
    responses: ['ہمارے تعلیمی کورسز میں آپ روحانیت، طب اور مزید بہت کچھ سیکھ سکتے ہیں:'],
    type: 'courses',
  },
  appointment: {
    keywords: ['appointment', 'mulaqat', 'milna chahta', 'consult', 'mashwara', 'visit', 'checkup', 'doctor', 'hakeem', 'treatment', 'ilaj', 'book appointment', 'appointment book', 'milna', 'rabta karna', 'baat krna', 'baat karna', 'baat chahta', 'baat chahti', 'ap sy baat', 'aap se baat', 'ap se baat', 'baat kr', 'call', 'refer', 'suggest', 'consultation', 'discuss', 'meet', 'meeting', 'mil sakta', 'mil sakti', 'rabta', 'contact karna', 'mulaaqat'],
    responses: [
      'آپ صاحبزادہ شارق احمد طارقی صاحب سے اپائنٹمنٹ بک کر کے بات کر سکتے ہیں۔ ابھی بک کریں:',
      'ملاقات کا وقت مقرر کرنے کے لیے نیچے Book Now دبائیں:',
    ],
    type: 'appointment',
  },
  greeting: {
    keywords: ['hello', 'salam', 'assalam', 'assalamu', 'aoa', 'good morning', 'good evening', 'how are you', 'kaise ho', 'kya haal', 'namaste', 'bohat achy'],
    responses: [
      'وعلیکم السلام! 🌿\nمیں طارقی AI اسسٹنٹ ہوں۔ آپ مجھ سے اپنا مسئلہ بتائیں - میں آپ کو مناسب مصنوعات تجویز کروں گا۔\n\nیا نیچے سے کوئی آپشن منتخب کریں:',
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
    'Hamare courses mein aap rohaniyat, tib aur bohat kuch seekh sakte hain:',
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
    'Ye Sahibzada Shariq Ahmed Tariqi sahab ki official website hai. Aap rohani ilaaj, herbal medicines, courses aur bohat kuch yahan pa sakte hain.\n\n🏢 Karachi, Pakistan\n📞 WhatsApp: +92 318 2392985',
  ],
  contact: [
    'Rabte ki details:\n\n📞 WhatsApp: +92 318 2392985\n🌐 Website: sahibzadashariqahmedtariqi.com\n\nNeeche WhatsApp button daba kar seedha baat karein:',
  ],
  thanks: [
    'Shukriya! 🌿 Allah aap ko sehat o aafiyat ata farmaye. Agar koi aur sawal ho to zaroor poochein!',
    'JazakAllah! Aap ki khidmat mein haazir hoon. Koi aur madad chahein to bataein 🤲',
  ],
  donate: [
    'Aap hamari website par sadqa, zakat aur khairaat ke liye donate kar sakte hain:',
  ],
};

const ENGLISH_RESPONSES = {
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
    'Learn about spirituality, herbal medicine and more through our courses:',
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
    'This is the official website of Sahibzada Shariq Ahmed Tariqi. Find spiritual healing, herbal medicines, courses and more.\n\n🏢 Karachi, Pakistan\n📞 WhatsApp: +92 318 2392985',
  ],
  contact: [
    'Contact Details:\n\n📞 WhatsApp: +92 318 2392985\n🌐 Website: sahibzadashariqahmedtariqi.com\n\nClick the WhatsApp button below to chat directly:',
  ],
  thanks: [
    'Thank you! 🌿 May Allah grant you health and wellness. Feel free to ask any more questions!',
    'JazakAllah! I\'m here to help. Let me know if you need anything else 🤲',
  ],
  donate: [
    'You can donate for Sadqa, Zakat and charity on our website:',
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

RULES:
- Give 2-3 SHORT, helpful sentences. Be warm and caring.
- Suggest relevant products/services from the list below.
- For serious issues, recommend booking an appointment with Sahibzada Shariq Ahmed Tariqi.
- NEVER diagnose diseases. NEVER mix languages/scripts.

Products: ${topProducts || 'Various herbal products'}
Services: ${topServices || 'Spiritual healing, Istikhara, Consultation'}
Appointments: sahibzadashariqahmedtariqi.com/appointments`;
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

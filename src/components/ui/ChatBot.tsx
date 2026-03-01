import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, User, ExternalLink, Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface QuickReply {
  label: string;
  value: string;
}

interface ProductItem {
  _id: string;
  name?: string;
  title?: string;
  shortDescription?: string;
  price?: number;
  priceINR?: number;
  image?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  quickReplies?: QuickReply[];
  products?: ProductItem[];
  courses?: ProductItem[];
  services?: ProductItem[];
  type?: string;
  appointmentUrl?: string;
  timestamp: Date;
}

type Language = 'urdu' | 'roman_urdu' | 'english';

const WELCOME_MESSAGES: Record<Language, string> = {
  urdu: 'السلام علیکم! 👋\nخوش آمدید! میں طارقی AI اسسٹنٹ ہوں۔\nآپ اپنا مسئلہ لکھیں یا نیچے موجود آپشنز میں سے کوئی ایک منتخب کریں۔',
  roman_urdu: 'Assalam o Alaikum! 👋\nKhush aamdeed! Mein Tariqi AI Assistant hoon.\nAap apna masla likhein ya neeche mojood options mein se koi aik select karein.',
  english: 'Assalam o Alaikum! 👋\nWelcome! I am Tariqi AI Assistant.\nPlease describe your issue or select an option below.',
};

const PLACEHOLDER_TEXT: Record<Language, string> = {
  urdu: 'اپنا مسئلہ لکھیں...',
  roman_urdu: 'Apna masla likhein...',
  english: 'Type your message...',
};

const LOADING_TEXT: Record<Language, string> = {
  urdu: 'سوچ رہا ہوں...',
  roman_urdu: 'Soch raha hoon...',
  english: 'Thinking...',
};

const QUICK_REPLIES: QuickReply[] = [
  { label: '🌿 Herbal Products', value: 'show me herbal products' },
  { label: '🔮 Spiritual Healing', value: 'spiritual healing services' },
  { label: '📚 Courses', value: 'courses available' },
  { label: '📅 Book Appointment', value: 'appointment book' },
  { label: '💊 Health Issues', value: 'health problem tabiyat kharab' },
  { label: '📞 Contact', value: 'contact information rabta' },
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSelectLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        text: WELCOME_MESSAGES[lang],
        quickReplies: QUICK_REPLIES,
        timestamp: new Date(),
      },
    ]);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (selectedLanguage) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    // Handle link quick replies
    if (messageText.startsWith('LINK:')) {
      const url = messageText.replace('LINK:', '');
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
      return;
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chatbot/message', { 
        message: messageText,
        language: selectedLanguage || 'roman_urdu',
      });
      if (response.data.success) {
        const data = response.data.data;
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: data.reply,
          quickReplies: data.quickReplies,
          products: data.products,
          courses: data.courses,
          services: data.services,
          type: data.type,
          appointmentUrl: data.appointmentUrl,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error: any) {
      const fallbackErrors: Record<Language, string> = {
        urdu: 'معذرت، کچھ غلطی ہو گئی۔ براہ کرم دوبارہ کوشش کریں۔',
        roman_urdu: 'Mazrat, kuch ghalti ho gayi. Dobara koshish karein.',
        english: 'Sorry, something went wrong. Please try again.',
      };
      const errorMsg = error.response?.data?.message || fallbackErrors[selectedLanguage || 'roman_urdu'];
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'bot',
          text: errorMsg,
          timestamp: new Date(),
          quickReplies: [
            { label: '🔄 Try Again', value: messageText },
            { label: '📞 WhatsApp', value: 'LINK:https://api.whatsapp.com/send/?phone=923182392985' },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderProductCard = (item: ProductItem, type: 'product' | 'course' | 'service') => {
    const name = item.name || item.title || '';
    const link =
      type === 'product' ? `/products/${item._id}` :
      type === 'course' ? `/courses/${item._id}` :
      `/services`;

    return (
      <a
        key={item._id}
        href={link}
        className="flex items-center gap-3 p-2.5 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer no-underline"
      >
        {item.image && (
          <img
            src={item.image}
            alt={name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
          {item.shortDescription && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.shortDescription}</p>
          )}
          {item.price !== undefined && item.price > 0 && (
            <p className="text-xs font-bold text-primary-600 mt-0.5">Rs. {item.price.toLocaleString()}</p>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </a>
    );
  };

  return (
    <>
      {/* Chat Toggle Button with label */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-24 right-6 z-50 flex items-center gap-2"
          >
            {/* Blinking label */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full shadow-lg border border-primary-200 dark:border-primary-700 text-xs font-bold whitespace-nowrap animate-pulse">
                ✨ Tariqi AI Assistant
              </div>
              {/* Arrow pointing to button */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-white dark:bg-gray-800 border-r border-b border-primary-200 dark:border-primary-700 rotate-[-45deg]" />
            </motion.div>

            {/* Glowing AI Button */}
            <motion.button
              onClick={handleOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center overflow-hidden group"
              aria-label="Open Chatbot"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-primary-600 to-amber-500 animate-gradient-spin" />
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full animate-ping bg-primary-400/30" style={{ animationDuration: '2s' }} />
              {/* Inner circle with robot icon */}
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary-600 to-emerald-600 rounded-full flex items-center justify-center border-2 border-white/30">
                <Bot className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[500px] sm:h-[550px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">Tariqi AI Assistant</h3>
                <p className="text-xs text-white/80">آپ کی خدمت میں حاضر 🌿</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Selector or Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {/* Language Selection Screen */}
              {!selectedLanguage && (
                <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                    <Globe className="w-8 h-8 text-primary-600 dark:text-primary-300" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white">Select Your Language</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">اپنی زبان منتخب کریں</p>
                  </div>
                  <div className="flex flex-col gap-3 w-full max-w-[240px]">
                    <button
                      onClick={() => handleSelectLanguage('urdu')}
                      className="w-full px-5 py-3 bg-white dark:bg-gray-700 border-2 border-primary-200 dark:border-primary-700 rounded-xl text-base font-bold text-gray-800 dark:text-white hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all shadow-sm"
                    >
                      🇵🇰 اردو
                    </button>
                    <button
                      onClick={() => handleSelectLanguage('roman_urdu')}
                      className="w-full px-5 py-3 bg-white dark:bg-gray-700 border-2 border-primary-200 dark:border-primary-700 rounded-xl text-base font-bold text-gray-800 dark:text-white hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all shadow-sm"
                    >
                      🗣️ Roman Urdu
                    </button>
                    <button
                      onClick={() => handleSelectLanguage('english')}
                      className="w-full px-5 py-3 bg-white dark:bg-gray-700 border-2 border-primary-200 dark:border-primary-700 rounded-xl text-base font-bold text-gray-800 dark:text-white hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all shadow-sm"
                    >
                      🌐 English
                    </button>
                  </div>
                </div>
              )}
              {selectedLanguage && messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary-600 dark:text-primary-300" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Text bubble */}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-md shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Product cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {msg.products.map((p) => renderProductCard(p, 'product'))}
                      </div>
                    )}

                    {/* Course cards */}
                    {msg.courses && msg.courses.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {msg.courses.map((c) => renderProductCard(c, 'course'))}
                      </div>
                    )}

                    {/* Service cards */}
                    {msg.services && msg.services.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {msg.services.map((s) => renderProductCard(s, 'service'))}
                      </div>
                    )}

                    {/* Quick Replies */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.quickReplies.map((qr, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(qr.value)}
                            className="px-3 py-1.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-colors"
                          >
                            {qr.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {loading && selectedLanguage && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-600 dark:text-primary-300" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                      <span className="text-sm text-gray-500">{LOADING_TEXT[selectedLanguage]}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedLanguage ? PLACEHOLDER_TEXT[selectedLanguage] : 'Select language first...'}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-full text-sm text-gray-800 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                  disabled={loading || !selectedLanguage}
                  maxLength={500}
                  dir="auto"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-1.5">Powered by Sahibzada Shariq Ahmed Tariqi</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

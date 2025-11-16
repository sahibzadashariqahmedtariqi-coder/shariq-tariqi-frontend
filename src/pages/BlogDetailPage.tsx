import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import { motion } from 'framer-motion'

interface UpdateDetail {
  id: number
  title: string
  description: string
  fullContent: string
  date: string
  type: 'announcement' | 'event' | 'news'
  author: string
  image?: string
}

const updatesData: UpdateDetail[] = [
  {
    id: 1,
    title: "New Spiritual Healing Course Starting",
    description: "Join our comprehensive spiritual healing course beginning next month. Learn authentic Islamic healing methods and spiritual practices.",
    fullContent: `We are excited to announce the launch of our comprehensive Spiritual Healing Course starting from December 1st, 2025. This course is designed to provide you with deep insights into authentic Islamic healing methods and spiritual practices.

    Course Highlights:
    • Learn traditional Islamic healing techniques
    • Understand the spiritual dimensions of well-being
    • Practice authentic Ruqyah and spiritual healing methods
    • Gain knowledge of Quranic verses for healing
    • Study the prophetic medicine (Tibb-e-Nabawi)
    • Interactive sessions with experienced spiritual healers
    
    Duration: 3 Months
    Schedule: Every weekend (Saturday & Sunday)
    Mode: Both online and in-person sessions available
    
    This course is perfect for those who wish to deepen their spiritual connection and learn how to help others through Islamic healing practices. Limited seats available, so register early to secure your spot.
    
    What You Will Learn:
    - The foundations of Islamic spiritual healing
    - Practical application of Quranic verses and supplications
    - Diagnosis and treatment of spiritual ailments
    - Protection from evil eye and black magic
    - Building a strong connection with Allah through spiritual practices
    
    Our experienced instructors have years of knowledge in traditional Islamic healing and will guide you through every step of your spiritual journey.`,
    date: "2025-12-01",
    type: "event",
    author: "Sahibzada Shariq Ahmed Tariqi"
  },
  {
    id: 2,
    title: "Ruhani Punjab Tour",
    description: "Join us on an enlightening spiritual journey across Punjab. Experience divine blessings, spiritual healing sessions, and traditional Islamic teachings in multiple cities.",
    fullContent: `Assalamu Alaikum wa Rahmatullahi wa Barakatuhu,

    We are pleased to announce the Ruhani Punjab Tour - a transformative spiritual journey across the blessed land of Punjab. This tour is designed to bring spiritual healing, divine blessings, and authentic Islamic teachings to communities across multiple cities.

    Tour Details:
    Starting Date: November 20, 2025
    Duration: 2 Weeks
    Cities Covered: Lahore, Faisalabad, Multan, Gujranwala, Sialkot, and more
    
    What to Expect:
    • Daily Spiritual Gatherings (Majalis) after Maghrib prayer
    • Individual spiritual healing sessions
    • TAQ healing and Ruqyah sessions
    • Traditional Hikmat consultations
    • Distribution of blessed herbal medicines
    • Question & Answer sessions on Islamic spirituality
    • Special prayers and supplications for attendees
    
    Program Schedule:
    - Morning: Individual consultations and healing sessions
    - Afternoon: Group spiritual discussions and Islamic teachings
    - Evening: Main Majlis with spiritual guidance and collective prayers
    
    Special Features:
    • Free consultation for those in need
    • Distribution of blessed items and spiritual protection amulets
    • Traditional Hikmat medicine prescriptions
    • Spiritual guidance for personal and family matters
    • Special focus on healing from spiritual ailments
    
    Cities and Dates:
    - Lahore: Nov 20-22
    - Faisalabad: Nov 23-25
    - Multan: Nov 26-28
    - Gujranwala: Nov 29-30
    - Sialkot: Dec 1-3
    
    This is a blessed opportunity to strengthen your connection with Allah, seek spiritual healing, and receive guidance from experienced spiritual scholars. All are welcome to attend - no prior registration required for the main gatherings.
    
    For individual consultation appointments during the tour, please book in advance through our appointments page.
    
    May Allah accept this humble effort and shower His blessings upon all attendees. Ameen.`,
    date: "2025-11-20",
    type: "announcement",
    author: "Sahibzada Shariq Ahmed Tariqi"
  },
  {
    id: 3,
    title: "New Herbal Medicine Products Available",
    description: "We have added new authentic herbal medicines and spiritual healing items to our products collection.",
    fullContent: `Alhamdulillah, we are delighted to announce the addition of new authentic herbal medicines and spiritual healing items to our products collection. These carefully prepared products combine traditional Hikmat wisdom with spiritual blessings.

    New Products Added:
    
    Herbal Medicines:
    • Premium Honey with Black Seed (Kalonji)
    • Saffron Extract for Mental Clarity
    • Digestive Health Herbal Mix
    • Joint Pain Relief Oil
    • Memory Enhancement Capsules
    • Immunity Booster Syrup
    • Stress Relief Herbal Tea
    • Sleep Enhancement Formula
    
    Spiritual Healing Items:
    • Blessed Protection Amulets (Ta'weez)
    • Spiritual Cleansing Water (Dum water)
    • Blessed Rose Water
    • Incense for Home Purification
    • Protection Oil with Quranic verses
    • Blessed Black Seed Oil
    
    Why Choose Our Products:
    ✓ Prepared according to traditional Hikmat methods
    ✓ All herbal medicines use natural, high-quality ingredients
    ✓ Spiritual items blessed with Quranic recitation
    ✓ No harmful chemicals or artificial additives
    ✓ Tested and trusted by thousands of satisfied customers
    ✓ Prepared under strict quality control
    
    Special Introductory Offers:
    - 15% off on all new products for the first month
    - Free consultation with product purchase
    - Free home delivery on orders above PKR 3000
    - Special bundle packages available
    
    Each product comes with:
    • Detailed usage instructions in Urdu and English
    • Recommended prayers and supplications
    • Storage guidelines
    • Authenticity certificate
    
    How to Order:
    Visit our Products page to browse the complete collection. Each product listing includes detailed information about ingredients, benefits, usage instructions, and pricing.
    
    Customer Support:
    Our team is available to answer your questions and provide guidance on product selection. Contact us through:
    • WhatsApp: [Contact Number]
    • Email: support@shariqtariqi.com
    • Phone: Available during business hours
    
    Note: These products are meant to complement spiritual practices and medical treatment, not replace them. For serious health conditions, please consult with qualified medical professionals.
    
    May Allah grant healing and wellness to all. Ameen.`,
    date: "2025-11-18",
    type: "news",
    author: "Admin Team"
  },
  {
    id: 4,
    title: "Appointment Booking Now Open",
    description: "Book your personal consultation sessions for spiritual guidance, TAQ healing, and traditional Hikmat treatment.",
    fullContent: `Assalamu Alaikum,

    We are pleased to announce that appointment bookings are now open for personal consultation sessions with Sahibzada Shariq Ahmed Tariqi.

    Available Services:
    
    1. Spiritual Guidance & Counseling
    - Personal spiritual development
    - Islamic lifestyle guidance
    - Family matters and relationships
    - Business and career guidance from Islamic perspective
    
    2. TAQ Healing Sessions
    - Energy healing based on Quranic principles
    - Chakra balancing through Islamic methods
    - Spiritual cleansing and protection
    - Removal of negative energies
    
    3. Traditional Hikmat Treatment
    - Herbal medicine prescriptions
    - Natural healing remedies
    - Chronic disease management
    - Preventive healthcare guidance
    
    4. Ruqyah and Spiritual Healing
    - Treatment for evil eye (Nazar)
    - Protection from black magic (Sihr)
    - Relief from Jinn possession
    - Spiritual ailments diagnosis and treatment
    
    Appointment Types:
    
    In-Person Consultation:
    - Duration: 30-60 minutes
    - Location: Main Center, Lahore
    - Charges: PKR 2000-5000 (based on service type)
    - Includes: Face-to-face consultation, personalized treatment plan
    
    Online Consultation:
    - Duration: 30 minutes
    - Platform: WhatsApp Video Call / Zoom
    - Charges: PKR 1500-3000
    - Includes: Video consultation, follow-up via messages
    
    Phone Consultation:
    - Duration: 20 minutes
    - Charges: PKR 1000
    - Suitable for: Quick guidance and follow-ups
    
    How to Book:
    1. Visit our Appointments page
    2. Select your preferred service type
    3. Choose date and time slot
    4. Fill in your details and concerns
    5. Submit booking request
    6. Receive confirmation via SMS/Email
    
    Important Information:
    • Limited slots available each day
    • Advance booking recommended
    • Cancellation policy: 24 hours notice required
    • Payment can be made online or at the time of appointment
    • For emergency cases, please call our helpline
    
    Special Notes:
    - First-time visitors get 20% discount
    - Free follow-up consultation within 15 days
    - Family package deals available
    - Special rates for students and elderly
    
    Preparation for Your Appointment:
    • Be in a state of Wudhu if possible
    • Prepare a list of your concerns/questions
    • Bring any previous medical reports if relevant
    • Ensure a quiet environment for online consultations
    
    Testimonials:
    Thousands of people have benefited from these consultations, finding relief from spiritual, emotional, and physical ailments. Read their stories on our testimonials page.
    
    Contact Information:
    For any queries regarding appointments:
    • Phone: [Contact Number]
    • WhatsApp: [WhatsApp Number]
    • Email: appointments@shariqtariqi.com
    
    Available Hours:
    Monday - Saturday: 10 AM - 8 PM
    Sunday: 2 PM - 6 PM
    Friday: After Jummah prayer - 8 PM
    
    We look forward to serving you on your spiritual journey. May Allah grant you healing, guidance, and peace.
    
    JazakAllahu Khairan,
    Sahibzada Shariq Ahmed Tariqi Team`,
    date: "2025-11-15",
    type: "announcement",
    author: "Admin Team"
  }
]

export default function BlogDetailPage() {
  const { id } = useParams()
  const updateDetail = updatesData.find(update => update.id === Number(id))

  if (!updateDetail) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Update Not Found</h1>
        <Link to="/" className="text-primary-600 hover:text-primary-700 font-semibold">
          Return to Home
        </Link>
      </div>
    )
  }

  const typeColors = {
    announcement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    event: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    news: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }

  return (
    <>
      <Helmet>
        <title>{updateDetail.title} | Sahibzada Shariq Ahmed Tariqi</title>
        <meta name="description" content={updateDetail.description} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white to-primary-50 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Back Button */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold mb-8 group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            {/* Article Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${typeColors[updateDetail.type]}`}>
                  {updateDetail.type}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {new Date(updateDetail.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4" />
                  {updateDetail.author}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {updateDetail.title}
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {updateDetail.description}
              </p>
            </div>

            {/* Article Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {updateDetail.fullContent.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Call to Action */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-primary-50 to-gold-50 dark:from-primary-900/30 dark:to-gold-900/30 rounded-xl p-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Want to Learn More?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Book an appointment or explore our services to get personalized guidance
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                      to="/appointments"
                      className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Book Appointment
                    </Link>
                    <Link
                      to="/services"
                      className="px-6 py-3 bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary-600"
                    >
                      View Services
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Section */}
            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 font-semibold"
              >
                ← View All Updates
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

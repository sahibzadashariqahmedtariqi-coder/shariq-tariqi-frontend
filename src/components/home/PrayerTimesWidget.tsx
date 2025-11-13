import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { prayerTimesApi } from '@/services/apiService'

export default function PrayerTimesWidget() {
  const { data: prayerTimes, isLoading } = useQuery({
    queryKey: ['prayer-times'],
    queryFn: () => prayerTimesApi.getCurrent().then(res => res.data),
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  const prayers = [
    { name: 'Fajr', time: prayerTimes?.fajr || '5:41 AM' },
    { name: 'Dhuhr', time: prayerTimes?.dhuhr || '12:16 PM' },
    { name: 'Asr', time: prayerTimes?.asr || '3:24 PM' },
    { name: 'Maghrib', time: prayerTimes?.maghrib || '5:45 PM' },
    { name: 'Isha', time: prayerTimes?.isha || '6:50 PM' },
  ]

  return (
    <section className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-primary-500 rounded-2xl p-8 text-white shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-8 w-8 text-gold-400" />
          <h2 className="text-2xl md:text-3xl font-bold">Prayer Times</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading prayer times...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {prayers.map((prayer, index) => (
              <motion.div
                key={prayer.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm"
              >
                <h3 className="font-semibold text-lg mb-2">{prayer.name}</h3>
                <p className="text-2xl font-bold text-gold-400">{prayer.time}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}

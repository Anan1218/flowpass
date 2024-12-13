import { HiQrCode } from "react-icons/hi2"
import { HiCalendar } from "react-icons/hi2"
import { HiCreditCard } from "react-icons/hi2"
import { HiUsers } from "react-icons/hi2"

interface FeatureItem {
  icon: React.ReactNode
  title: string
  description: string
}

const features: FeatureItem[] = [
  {
    icon: <HiQrCode className="w-8 h-8 text-indigo-400" />,
    title: 'FastPass',
    description: 'Streamline entry with digital passes. Get customers in faster and track attendance in real-time.',
  },
  {
    icon: <HiCalendar className="w-8 h-8 text-indigo-400" />,
    title: 'Reservations',
    description: 'Manage tables, sections, and VIP bookings all in one place. Never double-book again.',
  },
  {
    icon: <HiCreditCard className="w-8 h-8 text-indigo-400" />,
    title: 'Collect Payments',
    description: 'Process cover charges, tickets, and reservations with integrated digital payments.',
  },
  {
    icon: <HiUsers className="w-8 h-8 text-indigo-400" />,
    title: 'View Customers',
    description: 'Track customer visits, preferences, and spending patterns to improve your service.',
  },
]

export function Features() {
  return (
    <section className="relative py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">See How Easy It Is</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Seemlessly register with ScanPass and see how we can help your business.</p>
        </div>
        
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-indigo-500/10 rounded-lg p-3">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

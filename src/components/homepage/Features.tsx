import Image from 'next/image'

interface FeatureItem {
  icon: string
  title: string
  description: string
}

const features: FeatureItem[] = [
  {
    icon: '/icons/scanpass.svg',
    title: 'ScanPass',
    description: 'Skip the line with ScanPass - your digital fast pass to instant venue entry.',
  },
  {
    icon: '/icons/cover.svg',
    title: 'Digital Payments',
    description: 'Pay cover charges and tickets digitally through your preferred payment method.',
  },
  {
    icon: '/icons/drinks.svg',
    title: 'Mobile Ordering',
    description: 'Order and pay for drinks directly from your phone. Skip the bar line completely!',
  },
  {
    icon: '/icons/tickets.svg',
    title: 'Event Access',
    description: 'Get exclusive access to events, concerts, and special venue promotions.',
  },
  {
    icon: '/icons/deals.svg',
    title: 'Member Perks',
    description: 'Enjoy member-only drink specials and venue deals through the app.',
  },
  {
    icon: '/icons/reservations.svg',
    title: 'Table Service',
    description: 'Reserve tables and VIP sections directly through the app.',
  },
]

export function Features() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 max-w-3xl">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={48}
                    height={48}
                    className="bg-blue-50 rounded-lg p-2"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute top-1/2 -right-20 -translate-y-1/2 hidden lg:block">
            <Image
              src="/images/app-mockup.png"
              alt="App Interface"
              width={400}
              height={800}
              className="drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

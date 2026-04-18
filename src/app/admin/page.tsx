import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <section className="space-y-6">
      <div className="border-2 border-[#1d348a] bg-white p-6 md:p-8">
        <p className="text-sm uppercase tracking-tight font-bold text-zinc-600">Admin Panel</p>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1d348a] mt-1">
          Dashboard
        </h2>
        <p className="mt-3 text-zinc-700 text-lg font-medium max-w-3xl">
          Manage fleet tracking, schedules, seat booking, and revenue in one place.
          Start with onboarding, then move into daily operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { title: 'Onboarding Journey', href: '/onboarding', desc: 'Guided setup for first success in minutes.' },
          { title: 'Bookings', href: '/admin/bookings', desc: 'Monitor reservations and boarding status.' },
          { title: 'Tracking', href: '/admin/tracking', desc: 'Follow active trips and bus movement live.' },
          { title: 'Schedule', href: '/admin/schedule', desc: 'Build departures and route timetables.' },
          { title: 'Reports', href: '/admin/reports', desc: 'Inspect earnings, occupancy, and trends.' },
          { title: 'Settings', href: '/admin/settings', desc: 'Configure fare, company, and notifications.' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border-2 border-[#1d348a] bg-white p-5 hover:bg-[#ff6802] hover:text-white transition-colors"
          >
            <h3 className="text-2xl font-black uppercase tracking-tighter">{item.title}</h3>
            <p className="mt-2 text-sm font-medium">{item.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

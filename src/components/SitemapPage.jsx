import { Link } from 'react-router-dom';

const GROUPS = [
  { title: 'Explore', links: [['Home', '/'], ['Destinations', '/travel'], ['Hotels', '/hotels'], ['Flights', '/flights'], ['Travel guides', '/guides'], ['Journal', '/journal'], ['Seasonal offers', '/offers']] },
  { title: 'Plan', links: [['Plan a trip', '/plan-trip'], ['My trips', '/my-trips'], ['Saved places', '/favorites'], ['Suggest a place', '/suggest-place'], ['Gallery', '/gallery']] },
  { title: 'Services', links: [['Private jets', '/private-jets'], ['Villa stays', '/villas'], ['Experiences', '/experiences'], ['Concierge', '/concierge']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['Careers', '/careers'], ['Press', '/press'], ['Support', '/support']] },
  { title: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms of Use', '/terms']] }
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-[#0c0c0c] px-4 pb-24 pt-32 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-brand-gold">Navigation</p>
        <h1 className="font-serif text-4xl text-white sm:text-6xl">Sitemap</h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">Find every public area of Horizon Travels in one place.</p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <section key={group.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="font-serif text-2xl text-white">{group.title}</h2>
              <ul className="mt-5 space-y-3">
                {group.links.map(([label, to]) => (
                  <li key={to}><Link to={to} className="text-sm text-white/60 transition-colors hover:text-brand-gold">{label}</Link></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SectionHeading, { MotionReveal } from '../components/ui/SectionHeading';
import CTASection from '../components/ui/CTASection';
import { ErrorState } from '../components/ui/states';
import { getGuideBySlug, guides } from '../data/guides';
import { getDestinationBySlug, destinations } from '../data/destinations';
import { getTripsByDestination } from '../data/trips';
import TripCard from '../components/ui/TripCard';

export default function GuideDetailPage() {
    const { slug } = useParams();
    const guide = getGuideBySlug(slug);

    if (!guide) {
        return (
            <div className="container-tight pt-40">
                <ErrorState title="Guide not found" description="This article may have moved." actionLabel="Browse guides" onAction={() => { window.location.href = '/guides'; }} />
            </div>
        );
    }

    const relatedDestination = guide.relatedDestination ? getDestinationBySlug(guide.relatedDestination) : null;
    const relatedTrips = guide.relatedDestination ? getTripsByDestination(guide.relatedDestination).slice(0, 3) : [];
    const relatedDestinations = destinations.filter((d) => d.slug !== guide.relatedDestination).slice(0, 3);
    const moreGuides = guides.filter((g) => g.slug !== slug).slice(0, 3);

    return (
        <>
            {/* Article hero */}
            <section className="container-tight pt-32 pb-12">
                <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Guides', to: '/guides' }, { label: guide.category }]} />
                <div className="mt-10 max-w-3xl">
                    <div className="flex items-center gap-3 font-mono text-[10px] tracking-widest uppercase text-travel-gold mb-5">
                        <span>{guide.category}</span>
                        <span className="w-8 h-px bg-travel-gold/40" />
                        <span>{guide.date}</span>
                        <span className="w-8 h-px bg-white/15" />
                        <span className="text-white/40">{guide.readTime}</span>
                    </div>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-[1.02]">{guide.title}</h1>
                    <p className="mt-6 font-sans text-white/60 text-lg leading-relaxed">{guide.excerpt}</p>
                    <p className="mt-4 font-sans text-sm text-white/40">By {guide.author}</p>
                </div>

                <div className="mt-10 relative aspect-[16/8] overflow-hidden rounded-2xl">
                    <img src={guide.image} alt={guide.title} className="h-full w-full object-cover" />
                </div>
            </section>

            {/* Article body */}
            <article className="container-tight py-10">
                <div className="max-w-3xl">
                    {guide.content.map((section, i) => (
                        <MotionReveal key={i} delay={0.05}>
                            <div className="mb-12">
                                <h2 className="font-serif text-2xl md:text-3xl text-white mb-4">{section.heading}</h2>
                                <p className="font-sans text-white/65 text-base md:text-lg leading-[1.9]">{section.text}</p>
                            </div>
                        </MotionReveal>
                    ))}
                </div>
            </article>

            {/* Related trips */}
            {relatedTrips.length > 0 && (
                <section className="container-tight py-12">
                    <SectionHeading eyebrow="Keep going" title={relatedDestination ? `Trips in ${relatedDestination.name}` : 'Related trips'} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedTrips.map((trip, i) => (
                            <MotionReveal key={trip.slug} delay={i * 0.05}>
                                <TripCard trip={trip} />
                            </MotionReveal>
                        ))}
                    </div>
                </section>
            )}

            {/* Related destinations */}
            {relatedDestinations.length > 0 && (
                <section className="container-tight py-12">
                    <SectionHeading eyebrow="Explore" title="Related destinations" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {relatedDestinations.map((d) => (
                            <Link key={d.slug} to={`/destinations/${d.slug}`} className="group relative block aspect-[16/10] overflow-hidden rounded-2xl border border-white/8">
                                <img src={d.image} alt={d.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-5">
                                    <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-travel-gold">{d.country}</p>
                                    <h3 className="font-serif text-xl text-white">{d.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* More guides */}
            <section className="container-tight py-12">
                <SectionHeading eyebrow="The Journal" title="More reading" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {moreGuides.map((g) => (
                        <Link key={g.slug} to={`/guides/${g.slug}`} className="group block">
                            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/8">
                                <img src={g.image} alt={g.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                            </div>
                            <div className="mt-4">
                                <p className="font-mono text-[10px] tracking-widest uppercase text-white/40">{g.category} · {g.readTime}</p>
                                <h3 className="mt-2 font-serif text-xl text-white leading-snug group-hover:text-travel-gold transition-colors">{g.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <CTASection
                title="Ready to put this into practice?"
                description="Turn what you've read into a journey. We'll handle the details."
                primaryLabel="Plan a trip"
                primaryTo="/plan"
                secondaryLabel="Browse trips"
                secondaryTo="/trips"
            />
        </>
    );
}

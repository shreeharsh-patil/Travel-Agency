import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SectionHeading, { MotionReveal } from '../components/ui/SectionHeading';
import DestinationCard from '../components/ui/DestinationCard';
import TripCard from '../components/ui/TripCard';
import CTASection from '../components/ui/CTASection';
import { ErrorState } from '../components/ui/states';
import { getExperienceBySlug, experienceCategories } from '../data/experiences';
import { destinations } from '../data/destinations';
import { trips } from '../data/trips';

export default function ExperienceDetailPage() {
    const { slug } = useParams();
    const experience = getExperienceBySlug(slug);

    if (!experience) {
        return (
            <div className="container-tight pt-40">
                <ErrorState title="Experience not found" description="This category may have moved." actionLabel="Browse experiences" onAction={() => { window.location.href = '/experiences'; }} />
            </div>
        );
    }

    const relatedDestinations = destinations.filter((d) => d.style.some((s) => experience.style.includes(s)));
    const relatedTrips = trips.filter((t) => relatedDestinations.some((d) => d.slug === t.destination));
    const others = experienceCategories.filter((e) => e.slug !== slug).slice(0, 3);

    return (
        <>
            <section className="relative h-[56vh] min-h-[420px] flex items-end overflow-hidden">
                <img src={experience.image} alt={experience.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/30 to-transparent" />
                <div className="container-tight relative pb-12">
                    <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Experiences', to: '/experiences' }, { label: experience.title }]} />
                    <p className="mt-6 font-mono text-xs tracking-[0.25em] uppercase text-travel-gold">Experience</p>
                    <h1 className="mt-3 font-serif text-5xl sm:text-7xl text-white leading-none">{experience.title}</h1>
                    <p className="mt-5 font-sans text-white/75 text-base md:text-lg max-w-2xl">{experience.description}</p>
                </div>
            </section>

            <section className="container-tight py-16 md:py-20">
                <SectionHeading eyebrow="Where it lives" title={`${experience.title} destinations`} />
                {relatedDestinations.length === 0 ? (
                    <p className="font-sans text-white/50">We're building journeys for this style — plan a custom trip in the meantime.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedDestinations.map((d, i) => (
                            <MotionReveal key={d.slug} delay={i * 0.05}>
                                <DestinationCard destination={d} />
                            </MotionReveal>
                        ))}
                    </div>
                )}
            </section>

            {relatedTrips.length > 0 && (
                <section className="container-tight pb-16">
                    <SectionHeading eyebrow="Trips" title={`Ready-made ${experience.title.toLowerCase()} journeys`} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedTrips.map((trip, i) => (
                            <MotionReveal key={trip.slug} delay={i * 0.05}>
                                <TripCard trip={trip} />
                            </MotionReveal>
                        ))}
                    </div>
                </section>
            )}

            <section className="container-tight pb-16">
                <SectionHeading eyebrow="Keep browsing" title="Other ways to travel" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {others.map((e) => (
                        <Link key={e.slug} to={`/experiences/${e.slug}`} className="group relative block aspect-[16/10] overflow-hidden rounded-2xl border border-white/8">
                            <img src={e.image} alt={e.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-5">
                                <h3 className="font-serif text-xl text-white">{e.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <CTASection
                title={`Plan a ${experience.title.toLowerCase()} journey`}
                description="Tell us the destination and we'll shape the itinerary around this style of travel."
                primaryLabel="Plan a trip"
                primaryTo="/plan"
            />
        </>
    );
}

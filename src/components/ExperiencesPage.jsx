import { Link } from 'react-router-dom';
import PageHero from '../components/ui/PageHero';
import SectionHeading, { MotionReveal } from '../components/ui/SectionHeading';
import CTASection from '../components/ui/CTASection';
import { experienceCategories } from '../data/experiences';

export default function ExperiencesPage() {
    return (
        <>
            <PageHero
                eyebrow="Experiences"
                title="Ways of travelling"
                description="Every trip is shaped by how you like to move through the world. Choose a way of travelling and we'll build the journey around it."
                image="/images/beach_dinner.png"
                height="h-[52vh]"
            />

            <section className="container-tight py-16 md:py-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {experienceCategories.map((cat, i) => (
                        <MotionReveal key={cat.slug} delay={i * 0.05}>
                            <Link to={`/experiences/${cat.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/8">
                                <img src={cat.image} alt={cat.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-6">
                                    <h3 className="font-serif text-3xl text-white">{cat.title}</h3>
                                    <p className="mt-2 font-sans text-sm text-white/70 line-clamp-2">{cat.description}</p>
                                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-travel-gold">
                                        Explore
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </span>
                                </div>
                            </Link>
                        </MotionReveal>
                    ))}
                </div>
            </section>

            <CTASection
                title="Not sure which style fits?"
                description="Tell us how you like to travel and we'll point you in the right direction."
                primaryLabel="Plan a trip"
                primaryTo="/plan"
                secondaryLabel="Talk to us"
                secondaryTo="/contact"
            />
        </>
    );
}

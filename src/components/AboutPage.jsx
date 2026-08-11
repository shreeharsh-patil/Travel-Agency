import { Link } from 'react-router-dom';
import PageHero from '../components/ui/PageHero';
import SectionHeading, { MotionReveal } from '../components/ui/SectionHeading';
import CTASection from '../components/ui/CTASection';

const principles = [
    {
        title: 'We travel to the places we send you',
        text: 'Every destination in our portfolio has been visited by our team. We stay in the properties, eat at the tables, and test the itineraries ourselves.'
    },
    {
        title: 'Small, personal, considered',
        text: 'We are deliberately a small company. Each journey is designed by a person, not an algorithm, and we limit how many guests we take to any one place.'
    },
    {
        title: 'Honest advice, always',
        text: 'If a destination or property isn\u2019t right for you, we\u2019ll say so. Our recommendations are built on years of travel, not commissions.'
    }
];

const values = [
    { label: 'Est. 2018', text: 'Founded in Mumbai by two travellers with a simple conviction: luxury is about time well spent.' },
    { label: 'A small team', text: 'A dozen travel designers, each specialising in the regions they know best.' },
    { label: 'Real relationships', text: 'Long-standing partners — ryokans, villas, guides — who we work with year after year.' }
];

export default function AboutPage() {
    return (
        <>
            <PageHero
                eyebrow="About Horizon"
                title="Travel, done properly"
                description="Horizon Travels is a boutique travel company. We design journeys for people who want more than a checklist — and we handle every detail that gets in the way."
                image="/images/yacht.png"
                height="h-[60vh]"
            />

            {/* Story */}
            <section className="container-tight py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <SectionHeading eyebrow="Our story" title="Built on the road" />
                        <div className="space-y-6 font-sans text-white/65 text-base md:text-lg leading-relaxed">
                            <p>
                                Horizon Travels began in 2018, when two friends returned from a badly-planned honeymoon — one hotel too far from the beach, one itinerary with no room to breathe — and decided the industry deserved better.
                            </p>
                            <p>
                                Since then we've grown slowly and deliberately. We now design journeys across eight destinations and counting, always the same way: we go first, we stay, we test, and only then do we recommend.
                            </p>
                            <p>
                                We remain small on purpose. Every trip you see on this site is one we've built, refined, and would happily take ourselves.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
                        {values.map((v) => (
                            <MotionReveal key={v.label}>
                                <div className="rounded-2xl border border-white/10 bg-surface-raised p-6">
                                    <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-travel-gold">{v.label}</p>
                                    <p className="mt-3 font-sans text-sm text-white/65 leading-relaxed">{v.text}</p>
                                </div>
                            </MotionReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Principles */}
            <section className="container-tight py-10 md:py-16">
                <SectionHeading eyebrow="How we work" title="What we believe" align="center" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {principles.map((p, i) => (
                        <MotionReveal key={p.title} delay={i * 0.06}>
                            <div className="h-full rounded-2xl border border-white/10 bg-surface-raised p-8">
                                <span className="font-serif italic text-5xl text-travel-gold">0{i + 1}</span>
                                <h3 className="mt-6 font-serif text-2xl text-white leading-tight">{p.title}</h3>
                                <p className="mt-4 font-sans text-sm text-white/60 leading-relaxed">{p.text}</p>
                            </div>
                        </MotionReveal>
                    ))}
                </div>
            </section>

            {/* Why choose us */}
            <section className="container-tight py-10 md:py-16">
                <SectionHeading eyebrow="Why Horizon" title="What you get when you travel with us" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'A dedicated designer', text: 'One person on your journey, from first call to return flight.' },
                        { title: 'Private access', text: 'Gardens, kitchens, and teahouses that don\u2019t appear on any map.' },
                        { title: '24/7 in-trip support', text: 'A real human, reachable anywhere, throughout your travels.' },
                        { title: 'No fine print', text: 'Transparent pricing, honest advice, and nothing hidden.' }
                    ].map((item, i) => (
                        <MotionReveal key={item.title} delay={i * 0.05}>
                            <div className="h-full rounded-2xl border border-white/10 bg-surface-raised p-6">
                                <h3 className="font-serif text-xl text-white">{item.title}</h3>
                                <p className="mt-3 font-sans text-sm text-white/60 leading-relaxed">{item.text}</p>
                            </div>
                        </MotionReveal>
                    ))}
                </div>
            </section>

            <CTASection
                title="Travel with people who've been there."
                description="Tell us where you're thinking of going — we'll show you what we've learned."
                primaryLabel="Start a conversation"
                primaryTo="/contact"
                secondaryLabel="Browse destinations"
                secondaryTo="/destinations"
            />
        </>
    );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/ui/PageHero';
import SectionHeading, { MotionReveal } from '../components/ui/SectionHeading';
import CTASection from '../components/ui/CTASection';
import FilterPanel from '../components/ui/FilterPanel';
import { offers, offerCategories } from '../data/offers';
import { getDestinationBySlug } from '../data/destinations';

export default function OffersPage() {
    const [category, setCategory] = useState(null);

    const filtered = category ? offers.filter((o) => o.category === category) : offers;

    return (
        <>
            <PageHero
                eyebrow="Offers"
                title="Current promotions"
                description="The offers we're running right now. All are real and tied to live journeys — no invented discounts."
                image="/images/hotel_lobby.png"
                height="h-[52vh]"
            />

            <section className="container-tight py-16">
                <div className="mb-10">
                    <FilterPanel
                        groups={[
                            {
                                label: 'Category',
                                active: category,
                                onChange: setCategory,
                                options: offerCategories.map((c) => ({ value: c, label: c }))
                            }
                        ]}
                        onClear={() => setCategory(null)}
                        showClear={!!category}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map((offer, i) => {
                        const dest = getDestinationBySlug(offer.destination);
                        return (
                            <MotionReveal key={offer.slug} delay={i * 0.05}>
                                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface-raised">
                                    <div className="relative aspect-[16/9] overflow-hidden">
                                        <img src={offer.image} alt={offer.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                                        <span className="absolute top-4 left-4 rounded-full bg-travel-gold px-3 py-1 font-mono text-[10px] tracking-widest uppercase text-black">
                                            {offer.category}
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-serif text-2xl text-white">{offer.title}</h3>
                                        <p className="mt-2 font-sans text-sm text-white/60 leading-relaxed">{offer.description}</p>
                                        <div className="mt-5 flex items-center justify-between">
                                            <span className="font-mono text-[10px] tracking-widest uppercase text-white/40">
                                                Valid {offer.validUntil}
                                            </span>
                                            {dest && (
                                                <Link to={`/destinations/${dest.slug}`} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-travel-gold hover:text-white transition-colors">
                                                    {dest.name}
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </MotionReveal>
                        );
                    })}
                </div>
            </section>

            <CTASection
                title="Don't see the right moment?"
                description="Offers change with the seasons. Tell us what you're planning and we'll flag the best window for it."
                primaryLabel="Plan a trip"
                primaryTo="/plan"
                secondaryLabel="Contact us"
                secondaryTo="/contact"
            />
        </>
    );
}

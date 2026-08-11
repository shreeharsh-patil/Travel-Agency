import { useState, useMemo } from 'react';
import PageHero from '../components/ui/PageHero';
import SearchBar from '../components/ui/SearchBar';
import FilterPanel from '../components/ui/FilterPanel';
import GuideCard from '../components/ui/GuideCard';
import { MotionReveal } from '../components/ui/SectionHeading';
import { EmptyState } from '../components/ui/states';
import { guides, guideCategories } from '../data/guides';

export default function GuidesPage() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return guides.filter((g) => {
            const matchesSearch = !q || `${g.title} ${g.excerpt} ${g.category}`.toLowerCase().includes(q);
            const matchesCategory = !category || g.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [search, category]);

    return (
        <>
            <PageHero
                eyebrow="The Journal"
                title="Notes from the road"
                description="Guides, itineraries, and honest advice from the destinations we travel to and the trips we build."
                image="/images/swiss_alps.png"
                height="h-[52vh]"
            />

            <section className="container-tight py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
                    <aside className="lg:sticky lg:top-28 lg:self-start">
                        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/40 mb-5">Browse guides</p>
                        <SearchBar value={search} onChange={setSearch} placeholder="Search guides…" className="mb-6" />
                        <FilterPanel
                            groups={[
                                {
                                    label: 'Category',
                                    active: category,
                                    onChange: setCategory,
                                    options: guideCategories.map((c) => ({ value: c, label: c }))
                                }
                            ]}
                            onClear={() => { setSearch(''); setCategory(null); }}
                        />
                    </aside>

                    <div>
                        <p className="mb-6 font-sans text-sm text-white/50">{filtered.length} {filtered.length === 1 ? 'guide' : 'guides'}</p>
                        {filtered.length === 0 ? (
                            <EmptyState title="No guides match" description="Try a different search or category." />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {filtered.map((guide, i) => (
                                    <MotionReveal key={guide.slug} delay={i * 0.05}>
                                        <GuideCard guide={guide} />
                                    </MotionReveal>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

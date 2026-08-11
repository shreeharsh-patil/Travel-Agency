import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { getTripBySlug } from '../data/trips';
import { getDestinationBySlug } from '../data/destinations';
import { formatPrice } from '../lib/format';
import { ErrorState } from '../components/ui/states';

const addOns = [
    { id: 'airport', label: 'Private airport transfers', price: 250 },
    { id: 'guide', label: 'Extra private guide day', price: 400 },
    { id: 'photographer', label: 'Travel photographer for a day', price: 550 },
    { id: 'insurance', label: 'Premium travel insurance', price: 180 }
];

export default function BookingPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const trip = getTripBySlug(params.get('trip') || '');
    const [travelers, setTravelers] = useState(Number(params.get('travelers')) || 2);
    const [dates, setDates] = useState(params.get('dates') || '');
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
    const [error, setError] = useState('');

    if (!trip) {
        return (
            <div className="container-tight pt-40">
                <ErrorState title="No trip selected" description="Choose a journey to begin your booking." actionLabel="Browse trips" onAction={() => { window.location.href = '/trips'; }} />
            </div>
        );
    }

    const destination = getDestinationBySlug(trip.destination);
    const addonsTotal = selectedAddons.reduce((sum, id) => sum + (addOns.find((a) => a.id === id)?.price || 0), 0);
    const total = trip.price * travelers + addonsTotal;

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const toggleAddon = (id) =>
        setSelectedAddons((cur) => (cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dates) { setError('Please choose your travel dates.'); return; }
        if (!form.name || !form.email) { setError('Please complete your name and email.'); return; }
        if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Please enter a valid email address.'); return; }
        setError('');

        const reference = 'HT-' + Date.now().toString(36).toUpperCase();

        const payload = {
            reference,
            trip: trip.slug,
            title: trip.title,
            destination: destination?.name,
            dates,
            travelers,
            addons: selectedAddons.map((id) => addOns.find((a) => a.id === id)?.label),
            total,
            name: form.name,
            email: form.email,
            phone: form.phone,
            notes: form.notes
        };
        localStorage.setItem('ht_booking', JSON.stringify(payload));
        navigate(`/booking/success?ref=${reference}`);
    };

    return (
        <section className="min-h-screen bg-surface text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Trips', to: '/trips' }, { label: trip.title, to: `/trips/${trip.slug}` }, { label: 'Booking' }]} />

                <h1 className="mt-6 font-serif text-4xl sm:text-5xl text-white">Booking</h1>
                <p className="mt-3 font-sans text-white/60 max-w-xl">
                    Almost there. Review your trip, add any extras, and leave your details — we'll confirm everything personally within 24 hours.
                </p>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Trip */}
                        <div className="rounded-2xl border border-white/10 bg-surface-raised overflow-hidden">
                            <div className="flex flex-col sm:flex-row">
                                <img src={trip.image} alt={trip.title} className="h-40 w-full sm:w-44 object-cover" />
                                <div className="flex-1 p-6">
                                    <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-travel-gold">{destination?.name}, {destination?.country}</p>
                                    <h2 className="mt-1 font-serif text-2xl text-white">{trip.title}</h2>
                                    <p className="mt-1 font-sans text-sm text-white/55">{trip.days} days · {trip.nights} nights · {formatPrice(trip.price)}/person</p>
                                </div>
                            </div>
                        </div>

                        {/* Dates + travelers */}
                        <div className="rounded-2xl border border-white/10 bg-surface-raised p-6">
                            <h3 className="font-serif text-xl text-white mb-5">Dates & travelers</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/50">Travel dates</label>
                                    <input type="date" value={dates} onChange={(e) => setDates(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/80 focus:border-travel-gold transition-colors [color-scheme:dark]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/50">Travelers</label>
                                    <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-4 py-2.5">
                                        <button type="button" onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-8 h-8 rounded-full border border-white/15 text-white/70 hover:text-white" aria-label="Decrease">−</button>
                                        <span className="text-sm text-white font-semibold">{travelers}</span>
                                        <button type="button" onClick={() => setTravelers(Math.min(12, travelers + 1))} className="w-8 h-8 rounded-full border border-white/15 text-white/70 hover:text-white" aria-label="Increase">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add-ons */}
                        <div className="rounded-2xl border border-white/10 bg-surface-raised p-6">
                            <h3 className="font-serif text-xl text-white mb-5">Optional extras</h3>
                            <div className="space-y-3">
                                {addOns.map((a) => {
                                    const active = selectedAddons.includes(a.id);
                                    return (
                                        <button
                                            key={a.id}
                                            type="button"
                                            onClick={() => toggleAddon(a.id)}
                                            className={`flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-colors ${active ? 'border-travel-gold bg-travel-gold/5' : 'border-white/10 hover:border-white/25'}`}
                                        >
                                            <span className="flex items-center gap-4">
                                                <span className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs ${active ? 'bg-travel-gold border-travel-gold text-black' : 'border-white/25'}`}>
                                                    {active ? '✓' : ''}
                                                </span>
                                                <span className="font-sans text-sm text-white/80">{a.label}</span>
                                            </span>
                                            <span className="font-mono text-xs text-travel-gold">+{formatPrice(a.price)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Traveler info */}
                        <div className="rounded-2xl border border-white/10 bg-surface-raised p-6">
                            <h3 className="font-serif text-xl text-white mb-5">Traveler information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/50">Full name *</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-travel-gold transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/50">Email *</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-travel-gold transition-colors" />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/50">Phone</label>
                                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 1234" className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-travel-gold transition-colors" />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/50">Anything we should know?</label>
                                    <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" placeholder="Dietary needs, celebrations, preferences…" className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-travel-gold transition-colors resize-none" />
                                </div>
                            </div>
                        </div>

                        {error && <p className="font-sans text-sm text-red-400">{error}</p>}

                        <button type="submit" className="w-full py-4 rounded-full bg-white text-black font-sans text-sm font-semibold uppercase tracking-widest hover:bg-travel-gold transition-colors">
                            Request booking
                        </button>
                        <p className="text-center font-sans text-xs text-white/40">
                            No payment is taken at this stage. We confirm availability first.
                        </p>
                    </form>

                    {/* Summary */}
                    <aside className="rounded-2xl border border-white/10 bg-surface-raised p-6 lg:sticky lg:top-28">
                        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/40 mb-5">Your summary</p>
                        <dl className="space-y-3 font-sans text-sm">
                            <div className="flex justify-between"><dt className="text-white/55">Trip</dt><dd className="text-white text-right">{trip.title}</dd></div>
                            <div className="flex justify-between"><dt className="text-white/55">Travelers</dt><dd className="text-white">{travelers}</dd></div>
                            <div className="flex justify-between"><dt className="text-white/55">Base price</dt><dd className="text-white">{formatPrice(trip.price * travelers)}</dd></div>
                            {selectedAddons.length > 0 && (
                                <div className="flex justify-between"><dt className="text-white/55">Extras</dt><dd className="text-white">{formatPrice(addonsTotal)}</dd></div>
                            )}
                            <div className="flex justify-between border-t border-white/10 pt-3 mt-3">
                                <dt className="font-semibold text-white">Estimated total</dt>
                                <dd className="font-serif text-xl text-white">{formatPrice(total)}</dd>
                            </div>
                        </dl>
                    </aside>
                </div>
            </div>
        </section>
    );
}

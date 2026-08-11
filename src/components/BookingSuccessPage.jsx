import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTripBySlug } from '../data/trips';
import { formatPrice } from '../lib/format';


export default function BookingSuccessPage() {
    const [params] = useSearchParams();
    const ref = params.get('ref') || '';

    let booking = null;
    try {
        const raw = localStorage.getItem('ht_booking');
        if (raw) booking = JSON.parse(raw);
    } catch {
        booking = null;
    }

    const trip = booking?.trip ? getTripBySlug(booking.trip) : null;

    return (
        <section className="min-h-screen bg-surface text-white pt-36 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div className="mx-auto w-20 h-20 rounded-full bg-travel-gold/15 border border-travel-gold/40 flex items-center justify-center">
                        <svg className="text-travel-gold" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </div>
                    <h1 className="mt-8 font-serif text-4xl sm:text-5xl md:text-6xl leading-tight">
                        Your journey is <span className="italic text-travel-gold">confirmed.</span>
                    </h1>
                    <p className="mt-5 font-sans text-white/60 text-base md:text-lg max-w-xl mx-auto">
                        Thank you — our travel designers are reviewing your request and will be in touch within 24 hours to confirm availability and finalise the details.
                    </p>

                    {booking && (
                        <div className="mt-12 rounded-2xl border border-white/10 bg-surface-raised p-8 text-left">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/40">Booking reference</span>
                                <span className="font-mono text-lg text-travel-gold">{booking.reference || ref || 'HT-····'}</span>
                            </div>
                            <dl className="mt-5 space-y-3 font-sans text-sm">
                                <div className="flex justify-between"><dt className="text-white/55">Trip</dt><dd className="text-white">{booking.title}</dd></div>
                                <div className="flex justify-between"><dt className="text-white/55">Destination</dt><dd className="text-white">{booking.destination}</dd></div>
                                <div className="flex justify-between"><dt className="text-white/55">Dates</dt><dd className="text-white">{booking.dates}</dd></div>
                                <div className="flex justify-between"><dt className="text-white/55">Travelers</dt><dd className="text-white">{booking.travelers}</dd></div>
                                {booking.addons?.length > 0 && (
                                    <div className="flex justify-between"><dt className="text-white/55">Extras</dt><dd className="text-white text-right max-w-[60%]">{booking.addons.join(', ')}</dd></div>
                                )}
                                <div className="flex justify-between border-t border-white/10 pt-3 mt-3">
                                    <dt className="font-semibold text-white">Estimated total</dt>
                                    <dd className="font-serif text-xl text-white">{formatPrice(booking.total)}</dd>
                                </div>
                            </dl>
                            <p className="mt-4 font-sans text-xs text-white/40 border-t border-white/10 pt-4">
                                Payment status: <span className="text-travel-gold">Awaiting confirmation</span> — no charge has been made.
                            </p>
                        </div>
                    )}

                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <Link to={trip ? `/trips/${trip.slug}` : '/trips'} className="px-8 py-4 rounded-full bg-white text-black font-sans text-sm font-semibold uppercase tracking-widest hover:bg-travel-gold transition-colors">
                            Download itinerary
                        </Link>
                        <Link to="/contact" className="px-8 py-4 rounded-full bg-white/5 border border-white/15 text-white font-sans text-sm font-semibold uppercase tracking-widest hover:bg-white/10 transition-colors">
                            Contact support
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

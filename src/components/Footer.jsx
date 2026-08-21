import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [newsletterMsg, setNewsletterMsg] = useState(null);
    const [subscribing, setSubscribing] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubscribing(true);
        setNewsletterMsg(null);
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            setNewsletterMsg({ type: res.ok ? 'success' : 'error', text: data.message || data.error || 'Could not subscribe.' });
            if (res.ok) setEmail('');
        } catch (err) {
            console.error('Newsletter subscribe error:', err);
            setNewsletterMsg({ type: 'error', text: 'Could not subscribe. Please try again.' });
        } finally {
            setSubscribing(false);
            setTimeout(() => setNewsletterMsg(null), 5000);
        }
    };

    return (
        <footer className="relative w-full bg-black text-white pt-32 pb-10 px-6 md:px-12 border-t border-white/10">
            <div className="max-w-[1920px] mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-40">
                    {/* SERVICES */}
                    <div>
                        <h4 className="font-sans font-bold text-[10px] tracking-[0.2em] text-white/40 mb-8 uppercase">Services</h4>
                        <ul className="space-y-4 font-sans text-sm text-white/80">
                            <li><Link to="/private-jets" className="hover:text-white cursor-pointer transition-colors">Private Jets</Link></li>
                            <li><Link to="/villas" className="hover:text-white cursor-pointer transition-colors">Villa Stays</Link></li>
                            <li><Link to="/experiences" className="hover:text-white cursor-pointer transition-colors">Experiences</Link></li>
                            <li><Link to="/concierge" className="hover:text-white cursor-pointer transition-colors">Concierge</Link></li>
                        </ul>
                    </div>

                    {/* GET IN TOUCH */}
                    <div>
                        <h4 className="font-sans font-bold text-[10px] tracking-[0.2em] text-white/40 mb-8 uppercase">Get in Touch</h4>
                        <ul className="space-y-4 font-sans text-sm text-white/80">
                            <li><Link to="/contact" className="hover:text-white cursor-pointer transition-colors">Contact</Link></li>
                            <li><Link to="/careers" className="hover:text-white cursor-pointer transition-colors">Careers</Link></li>
                            <li><Link to="/press" className="hover:text-white cursor-pointer transition-colors">Press</Link></li>
                        </ul>
                    </div>

                    {/* CONNECT */}
                    <div>
                        <h4 className="font-sans font-bold text-[10px] tracking-[0.2em] text-white/40 mb-8 uppercase">Connect</h4>
                        <ul className="space-y-4 font-sans text-sm text-white/80">
                            <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white cursor-pointer transition-colors">Instagram</a></li>
                            <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white cursor-pointer transition-colors">LinkedIn</a></li>
                            <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white cursor-pointer transition-colors">Twitter</a></li>
                        </ul>
                    </div>

                    {/* PAY SAFELY */}
                    <div>
                        <h4 className="font-sans font-bold text-[10px] tracking-[0.2em] text-white/40 mb-8 uppercase">Pay Safely</h4>
                        <div className="flex gap-2">
                            <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded-sm">VISA</div>
                            <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded-sm">MC</div>
                            <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded-sm">AMEX</div>
                            <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded-sm">PAYPAL</div>
                        </div>
                    </div>
                </div>



                {/* NEWSLETTER BAND */}
                <div className="relative mb-24 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#141417] via-[#0f0f11] to-black p-8 sm:p-12">
                    <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="max-w-md">
                            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.3em] block mb-2">
                                The Horizon Dispatch
                            </span>
                            <h3 className="font-serif text-3xl sm:text-4xl text-white leading-tight">
                                Escape Plans, Delivered.
                            </h3>
                            <p className="text-white/50 text-sm mt-3 leading-relaxed">
                                Private-jet flash sales, villa openings, and curated itineraries — straight to your inbox.
                            </p>
                        </div>

                        <form onSubmit={handleSubscribe} className="w-full lg:w-auto lg:min-w-[380px] space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="flex-1 bg-black/50 border border-white/15 rounded-full px-5 py-3.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-brand-gold transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={subscribing}
                                    className="px-7 py-3.5 rounded-full bg-brand-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                                >
                                    {subscribing ? 'Joining...' : 'Subscribe'}
                                </button>
                            </div>
                            {newsletterMsg && (
                                <p className={`text-xs font-mono ${newsletterMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {newsletterMsg.type === 'success' ? '✓ ' : '⚠️ '}{newsletterMsg.text}
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                {/* BOTTOM UTILS */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-10 text-[10px] text-white/40 font-sans uppercase tracking-widest">
                    <p>© 2026</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

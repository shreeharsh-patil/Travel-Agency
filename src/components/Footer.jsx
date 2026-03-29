import { Link } from 'react-router-dom';

export default function Footer() {
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
                            <li className="hover:text-white cursor-pointer">Contact</li>
                            <li className="hover:text-white cursor-pointer">Careers</li>
                            <li className="hover:text-white cursor-pointer">Press</li>
                        </ul>
                    </div>

                    {/* CONNECT */}
                    <div>
                        <h4 className="font-sans font-bold text-[10px] tracking-[0.2em] text-white/40 mb-8 uppercase">Connect</h4>
                        <ul className="space-y-4 font-sans text-sm text-white/80">
                            <li className="hover:text-white cursor-pointer">Instagram</li>
                            <li className="hover:text-white cursor-pointer">LinkedIn</li>
                            <li className="hover:text-white cursor-pointer">Twitter</li>
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



                {/* BOTTOM UTILS */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-10 text-[10px] text-white/40 font-sans uppercase tracking-widest">
                    <p>© 2026</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <span className="cursor-pointer hover:text-white">Privacy Policy</span>
                        <span className="cursor-pointer hover:text-white">Terms</span>
                        <span className="cursor-pointer hover:text-white">Sitemap</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

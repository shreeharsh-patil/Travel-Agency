import React from 'react';
import { motion } from 'framer-motion';

export default function ReservationForm({ destination, onClose }) {
    // Default values for General Inquiry
    const displayInfo = destination || {
        title: "Plan Your Journey",
        price: "Tailored Experience",
        image: "https://images.unsplash.com/photo-1476900543704-4312b78632f8?q=80&w=2670&auto=format&fit=crop" // Elegant hero image
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header Image */}
                <div className="h-40 w-full relative">
                    <img
                        src={displayInfo.image}
                        alt={displayInfo.title}
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        ✕
                    </button>
                    <div className="absolute bottom-4 left-6">
                        <h3 className="font-serif text-3xl text-white">{displayInfo.title}</h3>
                        <p className="text-brand-gold text-sm font-mono uppercase tracking-widest">{displayInfo.price}</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/60">First Name</label>
                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/60">Last Name</label>
                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" placeholder="Doe" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/60">Email Address</label>
                        <input type="email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" placeholder="john@example.com" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/60">Guests</label>
                            <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors">
                                <option>1 Guest</option>
                                <option>2 Guests</option>
                                <option>3-4 Guests</option>
                                <option>5+ Guests</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/60">Dates</label>
                            <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/80 focus:outline-none focus:border-brand-gold transition-colors" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="w-full py-4 bg-brand-gold text-black font-sans font-bold uppercase tracking-widest rounded-lg hover:bg-white transition-colors duration-300">
                            Confirm Reservation
                        </button>
                        <p className="text-center text-white/40 text-[10px] mt-3 uppercase tracking-wider">
                            Our concierge will contact you within 24 hours.
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

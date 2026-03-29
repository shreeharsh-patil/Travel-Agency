import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle submission logic here
        alert("Thank you for your message. We will be in touch shortly.");
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <section className="min-h-screen bg-[#0c0c0c] text-white pt-32 pb-20 relative overflow-hidden">
            {/* Background Ambient */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">

                {/* Left: Info */}
                <div className="mt-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="font-sans text-brand-gold text-sm tracking-[0.3em] uppercase mb-6">
                            Contact Us
                        </p>
                        <h1 className="font-serif text-6xl md:text-8xl mb-8 leading-tight">
                            Let's start the <br /> conversation.
                        </h1>
                        <p className="font-sans text-white/60 text-lg leading-relaxed max-w-md mb-12">
                            Whether you are planning a sabbatical, a honeymoon, or a corporate retreat, our experts are ready to craft your perfect itinerary.
                        </p>

                        <div className="space-y-8 font-sans">
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Email</h3>
                                <p className="text-white/80 text-xl font-light">concierge@horizontravels.com</p>
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Phone</h3>
                                <p className="text-white/80 text-xl font-light">+91 98765 43210</p>
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Office</h3>
                                <p className="text-white/80 text-xl font-light">
                                    123, Marine Drive<br />Nariman Point, Mumbai, India 400021
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Form */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-3xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/50">Name</label>
                                <input
                                    required
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/50">Email</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/50">Subject</label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none"
                            >
                                <option value="" className="bg-black text-white/50">Select a topic</option>
                                <option value="plan" className="bg-black text-white">Plan a Trip</option>
                                <option value="media" className="bg-black text-white">Media Inquiry</option>
                                <option value="other" className="bg-black text-white">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/50">Message</label>
                            <textarea
                                required
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="4"
                                className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors resize-none"
                                placeholder="Tell us about your dream trip..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white text-black font-sans font-bold uppercase tracking-widest py-4 rounded-full hover:bg-brand-gold transition-colors mt-4"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

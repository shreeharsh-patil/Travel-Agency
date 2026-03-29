import React from 'react';
import { motion } from 'framer-motion';
import { blogData } from '../data/blogData';

export default function JournalPage() {
    return (
        <section className="min-h-screen bg-[#0c0c0c] text-white pt-32 pb-20 px-6 md:px-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-24 py-10 border-b border-white/10">
                    <h1 className="font-serif text-[clamp(4rem,10vw,8rem)] leading-none mb-6">
                        The Journal.
                    </h1>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <p className="max-w-xl font-sans text-lg text-white/60 leading-relaxed">
                            Stories from the road, curations of the finest hotels, and expert advice on traversing the globe in style.
                        </p>
                        <p className="font-mono text-xs text-brand-gold uppercase tracking-widest">
                            READ TIME: VARIES
                        </p>
                    </div>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 gap-20">
                    {blogData.map((post) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="group cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-10 items-start border-b border-white/5 pb-20 last:border-0"
                        >
                            {/* Image */}
                            <div className="md:col-span-5 overflow-hidden rounded-xl">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>

                            {/* Content */}
                            <div className="md:col-span-7 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center gap-4 text-xs font-mono text-white/40 uppercase tracking-widest mb-6">
                                        <span>{post.date}</span>
                                        <span className="w-8 h-[1px] bg-white/20" />
                                        <span>{post.readTime}</span>
                                    </div>
                                    <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-6 group-hover:text-brand-gold transition-colors duration-300">
                                        {post.title}
                                    </h2>
                                    <p className="font-sans text-white/60 text-lg leading-relaxed mb-8">
                                        {post.content.substring(0, 200)}...
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold group-hover:gap-4 transition-all duration-300">
                                    Read Article <span className="text-brand-gold">→</span>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}

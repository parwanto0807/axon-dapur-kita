'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const slides = [
    {
        id: 1,
        title: "Sayur Segar, Langsung dari Kebun",
        subtitle: "FRESH & LOCAL",
        description: "Nikmati kesegaran alam setiap hari dengan pilihan sayuran organik terbaik dari petani lokal.",
        image: "/hero/vegetables.png",
        position: "bg-center",
        cta: "Belanja Sekarang",
        ctaLink: "/category/sayur-segar",
        color: "from-green-900",
        accent: "bg-green-500"
    },
    {
        id: 2,
        title: "Masakan Rumah, Hangat & Nikmat",
        subtitle: "HOME COOKING",
        description: "Rindu masakan ibu? Pesan menu matang autentik dari tetangga di sekitarmu.",
        image: "/hero/meals.png",
        position: "bg-center",
        cta: "Lihat Menu",
        ctaLink: "/category/makanan-berat",
        color: "from-orange-900",
        accent: "bg-orange-500"
    },
    {
        id: 3,
        title: "Sehat Alami dengan Jamu Tradisional",
        subtitle: "WELLNESS",
        description: "Jaga imunitas tubuh dengan racikan jamu warisan leluhur yang higienis.",
        image: "/hero/jamu.png",
        position: "bg-[center_90%]",
        cta: "Cari Jamu",
        ctaLink: "/category/jamu",
        color: "from-yellow-900",
        accent: "bg-yellow-500"
    }
];

export default function HeroSlider() {
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const nextSlide = () => {
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (!isHovered) {
            const timer = setInterval(nextSlide, 6000);
            return () => clearInterval(timer);
        }
    }, [isHovered]);

    return (
        <div
            className="relative h-[120px] sm:h-[300px] md:h-[380px] w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === current ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                        }`}
                >
                    {/* Background Image */}
                    <div
                        className={`absolute inset-0 bg-cover ${slide.position} transition-transform duration-[8000ms] ease-linear ${index === current && !isHovered ? 'scale-110' : 'scale-100'
                            }`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    />

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} via-black/40 to-transparent opacity-90`} />

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center px-4 sm:px-12 md:px-20">
                        <div className={`max-w-xl text-white transform transition-all duration-1000 delay-300 ${index === current ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                            }`}>
                            <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-4">
                                <span className={`h-4 sm:h-8 w-0.5 sm:w-1 ${slide.accent} rounded-full`}></span>
                                <span className="text-[8px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-white/80">
                                    {slide.subtitle}
                                </span>
                            </div>

                            <h1 className="text-sm sm:text-4xl md:text-5xl font-black mb-1.5 sm:mb-5 leading-tight tracking-tight drop-shadow-lg">
                                {slide.title}
                            </h1>

                            <p className="hidden sm:block text-xs sm:text-base md:text-lg text-white/90 mb-6 sm:mb-8 font-medium max-w-md leading-relaxed drop-shadow-md">
                                {slide.description}
                            </p>

                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <Link href={slide.ctaLink || "#"} passHref>
                                    <button className="group relative bg-white text-gray-900 px-3 py-1.5 sm:px-8 sm:py-3.5 rounded-full text-[9px] sm:text-sm font-bold shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all active:scale-95 flex items-center overflow-hidden">
                                        <span className="relative z-10">{slide.cta}</span>
                                        <ArrowRight className="h-2.5 w-2.5 sm:h-4 sm:w-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                                        <div className="absolute inset-0 bg-gray-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
                                    </button>
                                </Link>

                                <button className="hidden sm:block p-2.5 sm:p-3.5 rounded-full border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all">
                                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Buttons (Hidden on mobile, visible on hover desktop) */}
            <div className="absolute bottom-8 right-8 z-20 hidden md:flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={prevSlide} className="p-3 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all border border-white/10">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={nextSlide} className="p-3 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all border border-white/10">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-2.5 sm:bottom-6 left-4 sm:left-12 z-20 flex space-x-1.5 sm:space-x-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ease-out ${index === current ? 'w-5 sm:w-8 bg-white' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/60'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Glass Effect Decorative Blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none z-10 mix-blend-overlay"></div>
        </div>
    );
}

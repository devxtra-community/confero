'use client';

import { useState, useEffect } from 'react';
import { Video, Sparkles, Zap, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function FindMatchPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    "Connecting minds, one conversation at a time...",
    "Every conversation is a new opportunity...",
    "Share knowledge, grow together...",
    "Your next great connection awaits..."
  ];

  useEffect(() => {
    if (isSearching) {
      const quoteInterval = setInterval(() => {
        setCurrentQuote(prev => (prev + 1) % quotes.length);
      }, 2500);

      const matchTimer = setTimeout(() => {
        setMatchFound(true);
        setIsSearching(false);
      }, 5000);

      return () => {
        clearInterval(quoteInterval);
        clearTimeout(matchTimer);
      };
    }
  }, [isSearching]);

  const handleStartSearch = () => {
    setIsSearching(true);
    setMatchFound(false);
    setCurrentQuote(0);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-slate-50 via-white to-teal-50">


      <div className="absolute top-20 right-0 sm:right-10 w-56 sm:w-72 h-56 sm:h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-0 sm:left-10 w-64 sm:w-96 h-64 sm:h-96 bg-favor/10 rounded-full blur-3xl" />


      {!isSearching && !matchFound && (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Ready to Connect</span>
              </div>

              <h1 className="font-sans text-5xl md:text-7xl font-bold text-foreground leading-tight">
                Find Your
                <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary to-favor">
                  Perfect Match
                </span>
              </h1>

              <p className="text-xl text-primary">
                {quotes[1]}
              </p>

              <button
                onClick={handleStartSearch}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-primary to-favor text-white rounded-full font-semibold text-lg cursor-pointer transition-all transform hover:scale-105"
              >
                <span>Start Matching</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="hidden md:block lg:relative">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-favor/20 rounded-[3rem] blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative h-64 rounded-3xl overflow-hidden  transform hover:scale-105 transition-transform">
                    <Image src="/auth/img1.jpg" fill alt="User" className="object-cover" />
                  </div>
                  <div className="relative h-48 rounded-3xl overflow-hidden  transform hover:scale-105 transition-transform">
                    <Image src="/auth/img3.jpg" fill alt="User" className="object-cover" />
                  </div>
                </div>
                <div className="space-y-4 pt-12">
                  <div className="relative h-48 rounded-3xl overflow-hidden  transform hover:scale-105 transition-transform">
                    <Image src="/auth/young.jpg" fill alt="User" className="object-cover" />
                  </div>
                  <div className="relative h-64 rounded-3xl overflow-hidden  transform hover:scale-105 transition-transform">
                    <Image src="/auth/smartphone.jpg" fill alt="User" className="object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSearching && (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
          <div className="w-full max-w-md text-center space-y-8">

            <div className="space-y-2">
              <h2 className="font-sans text-2xl sm:text-5xl font-bold text-foreground">
                Finding your match
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground italic">
                “{quotes[currentQuote]}”
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative w-full h-3 rounded-full bg-muted overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-linear-to-r from-primary to-favor animate-loading-fill" />
              </div>

              <p className="text-xs text-muted-foreground">
                Matching based on interests, availability & skills
              </p>
            </div>

            <div className="pt-4">
              <p className="text-xs text-muted-foreground mb-3">
                Scanning active users
              </p>

              <div className="flex items-center justify-center gap-3">
                {[
                  "/auth/img1.jpg",
                  "/auth/young.jpg",
                  "/auth/home.jpg",
                  "/auth/girl.jpg",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="
                relative w-15 h-15
                rounded-full overflow-hidden
                ring-2 ring-primary/20
                animate-fade-slide
              "
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <Image src={src} fill alt="User" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}



      {matchFound && (
        <div className="relative flex items-center justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-6xl mx-auto">

            <div className="text-center mb-10 md:mb-16 space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-linear-to-r from-primary to-favor text-white rounded-full">
                <Zap className="w-5 h-5" />
                <span className="font-semibold text-sm md:text-lg">Match Found!</span>
              </div>

              <h2 className="font-sans text-3xl md:text-5xl font-bold text-foreground">
                Meet Your New Connection
              </h2>

              <p className="text-base md:text-xl text-primary italic">
                “Every conversation is a new opportunity”
              </p>
            </div>

            <div className="grid gap-10 md:gap-12 lg:grid-cols-2 items-center">

              <div className="relative flex justify-center">

                <div className="
            relative w-full max-w-sm md:max-w-md lg:max-w-lg
            aspect-3/2
            rounded-3xl overflow-hidden
          ">
                  <Image
                    src="/auth/young.jpg"
                    fill
                    alt="Match"
                    className="object-cover"
                  />

                </div>
              </div>

              <div className="space-y-6 md:space-y-8 text-center lg:text-left">

                <div>
                  <h3 className="font-sans text-2xl md:text-4xl font-bold text-foreground">
                    Alex Morgan
                  </h3>
                  <p className="text-base md:text-xl text-primary">
                    Full Stack Developer
                  </p>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <span className="px-4 py-1.5 bg-teal-200 text-primary rounded-full text-sm font-medium">
                    Programming
                  </span>
                  <span className="px-4 py-1.5 bg-green-200 text-primary rounded-full text-sm font-medium">
                    Design
                  </span>
                  <span className="px-4 py-1.5 bg-blue-200 text-primary rounded-full text-sm font-medium">
                    Teaching
                  </span>
                </div>

                <div className="space-y-4">
                  <button className="
              w-full flex items-center justify-center gap-3
              px-6 py-4
              bg-linear-to-r from-primary to-favor
              text-white rounded-2xl
              font-semibold text-base md:text-lg
              transition-transform hover:scale-105
              cursor-pointer
            ">
                    <Video className="w-5 h-5" />
                    Start Video Call
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleStartSearch}
                    className="
                w-full px-6 py-4
                bg-glass hover:bg-glassHover
                border
                text-foreground
                rounded-2xl
                font-semibold text-base md:text-lg
                transition-transform hover:scale-105
                cursor-pointer
              "
                  >
                    Find Another Match
                  </button>
                </div>


              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
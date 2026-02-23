'use client';
import { useState, useEffect } from 'react';
import { Video, Sparkles, Zap, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { socket, connectSocket, resetSocket } from '@/lib/socket';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Loading from '@/components/CenterLoader';
import ProfileHover from '@/components/ProfileIcon';

export default function FindMatchPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);

  const [peerProfile, setPeerProfile] = useState<PeerProfile | null>(null);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isDuplicateTab, setIsDuplicateTab] = useState(false);

  const router = useRouter();

  type Skills = {
    _id: string;
    key: string;
    label: string;
    level: string;
  };

  type PeerProfile = {
    id: string;
    name: string;
    jobTitle: string;
    image?: string;
    skills: Skills[];
  };

  interface MatchFoundPayload {
    sessionId: string;
    peerId: string;
  }

  interface skill {
    key: string;
  }

  const quotes = [
    'Connecting minds, one conversation at a time...',
    'Every conversation is a new opportunity...',
    'Share knowledge, grow together...',
    'Your next great connection awaits...',
  ];

  useEffect(() => {
    resetSocket();
    connectSocket().catch((err: Error) => {
      if (err.message === 'ALREADY_CONNECTED') {
        setIsDuplicateTab(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!peerId) return;

    const fetchPeerProfile = async () => {
      try {
        const res = await axiosInstance.get(`/users/peer/${peerId}`);
        setPeerProfile(res.data);
      } catch {
        toast.warning('Failed to fetch user profile details');
      }
    };

    fetchPeerProfile();
  }, [peerId]);

  useEffect(() => {
    if (!isSearching) return;

    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % quotes.length);
    }, 2500);

    return () => {
      clearInterval(quoteInterval);
    };
  }, [isSearching, quotes.length]);

  const handleStartSearch = async () => {
    if (isSearching) return;

    setIsSearching(true);
    setMatchFound(false);
    setSessionId(null);
    setPeerId(null);
    setCurrentQuote(0);

    try {
      const res = await axiosInstance.get('/users/me');

      const skills = res.data.user.skills.map((s: skill) => s.key);

      if (!skills.length) {
        toast.warning('Please add skills to your profile');
        setIsSearching(false);
        return;
      }

      console.log('Starting match with skills:', skills);

      socket.emit('match:start', { skills });
    } catch {
      toast.error('Unable to start matching');
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onMatchFound = ({ sessionId, peerId }: MatchFoundPayload) => {
      setSessionId(sessionId);
      setPeerId(peerId);
      setIsSearching(false);
      setMatchFound(true);
    };

    socket.on('match:found', onMatchFound);

    return () => {
      socket.off('match:found', onMatchFound);
    };
  }, []);

  const cancelMatch = () => {
    socket.emit('match:cancel');
    setIsSearching(false);
  };

  useEffect(() => {
    return () => {
      if (isSearching) {
        socket.emit('match:cancel');
      }
    };
  }, [isSearching]);

  const handleStartCall = () => {
    if (!sessionId || !peerId) return;
    router.push(`/session?callId=${sessionId}&peerId=${peerId}`);
  };

  useEffect(() => {
    const init = async () => {
      await Promise.resolve();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <Loading />;

  // ── Duplicate tab modal — shown instead of normal UI ────────────────────
  if (isDuplicateTab) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-teal-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Session Already Active
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You already have an active session open in another tab. Only one
              tab can be connected at a time to prevent disrupting your ongoing
              match.
            </p>
            <p className="text-muted-foreground text-xs pt-1">
              If your other tab is closed or crashed, please wait a moment and
              then refresh this page.
            </p>
          </div>

          <button
            onClick={() => {
              socket.disconnect();
              window.close();
              // Fallback: window.close() is blocked when tab was manually opened
              setTimeout(() => router.push('/login'), 300);
            }}
            className="w-full py-3 px-6 bg-linear-to-r from-primary to-favor text-white rounded-full font-semibold transition-all hover:scale-105"
          >
            Close This Tab
          </button>
        </div>
      </div>
    );
  }
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-slate-50 via-white to-teal-50">
      <ProfileHover />

      {/* 2. BACKGROUND DECORATIONS */}
      <div className="absolute top-20 right-0 sm:right-10 w-56 sm:w-72 h-56 sm:h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-0 sm:left-10 w-64 sm:w-96 h-64 sm:h-96 bg-favor/10 rounded-full blur-3xl pointer-events-none" />

      {!isSearching && !matchFound && (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Ready to Connect
                </span>
              </div>
              <h1 className="font-sans text-5xl md:text-7xl font-bold text-foreground leading-tight">
                Find Your
                <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary to-favor">
                  Perfect Match
                </span>
              </h1>

              <p className="text-xl text-primary">{quotes[1]}</p>

              <button
                onClick={handleStartSearch}
                disabled={isSearching}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-primary to-favor text-white rounded-full font-semibold text-lg cursor-pointer transition-all transform hover:scale-105 disabled:opacity-50"
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
                    <Image
                      src="/auth/img1.jpg"
                      fill
                      alt="User"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-48 rounded-3xl overflow-hidden  transform hover:scale-105 transition-transform">
                    <Image
                      src="/auth/img3.jpg"
                      fill
                      alt="User"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-12">
                  <div className="relative h-48 rounded-3xl overflow-hidden  transform hover:scale-105 transition-transform">
                    <Image
                      src="/auth/young.jpg"
                      fill
                      alt="User"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-64 rounded-3xl overflow-hidden  transform hover:scale-105 transition-transform">
                    <Image
                      src="/auth/smartphone.jpg"
                      fill
                      alt="User"
                      className="object-cover"
                    />
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
                {quotes[currentQuote]}
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative w-full h-3 rounded-full bg-muted overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-linear-to-r from-primary to-favor animate-loading-fill" />
              </div>

              <p className="text-xs text-muted-foreground">
                Matching based on interests, availability &amp; skills
              </p>
            </div>

            <div className="pt-4">
              <p className="text-xs text-muted-foreground mb-3">
                Scanning active users
              </p>

              <div className="flex items-center justify-center gap-3">
                {[
                  '/auth/img1.jpg',
                  '/auth/young.jpg',
                  '/auth/home.jpg',
                  '/auth/girl.jpg',
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
            <button
              onClick={cancelMatch}
              className="mt-6 text-sm text-muted-foreground underline"
            >
              Cancel Search
            </button>
          </div>
        </div>
      )}

      {matchFound && (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-14 sm:py-16 md:py-6">
          <div className="w-full max-w-4xl mx-auto text-center space-y-8 sm:space-y-5">
            {/* Header */}
            <div className="space-y-3 sm:space-y-3">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6  py-1.5 sm:py-2 bg-linear-to-r from-primary to-favor text-white rounded-full shadow-md sm:shadow-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base md:text-lg">
                  Match Found
                </span>
              </div>

              <h2 className="font-sans text-2xl sm:text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Meet Your New Connection
              </h2>

              <p className="text-sm sm:text-lg md:text-xl text-primary italic -mt-2">
                Every conversation is a new opportunity
              </p>
            </div>

            {/* Avatar Section */}
            <div className="relative flex justify-center pt-4 sm:pt-3">
              {/* Glow Background */}
              <div className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-linear-to-br from-primary/20 to-favor/20 rounded-full blur-2xl sm:blur-3xl" />

              {/* Circle Avatar */}
              <div
                className="
            relative 
            w-40 h-40 
            sm:w-56 sm:h-56 
            md:w-72 md:h-72
            rounded-full 
            overflow-hidden
            ring-2 sm:ring-4 ring-white/40
            shadow-xl sm:shadow-2xl
            transition-transform duration-500
            hover:scale-105
          "
              >
                <Image
                  src={peerProfile?.image || '/auth/young.jpg'}
                  fill
                  alt="Match"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Name & Role */}
            <div className="space-y-1 sm:space-y-2">
              {peerProfile ? (
                <>
                  <h3 className="font-sans text-xl sm:text-2xl md:text-4xl font-bold text-foreground">
                    {peerProfile.name}
                  </h3>
                  <p className="text-sm sm:text-lg md:text-xl text-primary font-medium">
                    {peerProfile.jobTitle}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Loading profile...
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-xl mx-auto">
              {peerProfile?.skills?.map(skill => (
                <span
                  key={skill._id}
                  className="
              px-3 sm:px-4 py-1
              bg-white/60 
              backdrop-blur-md
              border border-white/40
              text-primary 
              rounded-full 
              text-xs sm:text-sm
              font-medium
              shadow-sm
            "
                >
                  {skill.label}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 pt-2 sm:pt-4 -m-1">
              <button
                onClick={handleStartCall}
                className="
            flex items-center gap-2 sm:gap-3
            px-6 sm:px-8 py-3 sm:py-4
            bg-linear-to-r from-primary to-favor
            text-white rounded-full
            font-semibold text-sm sm:text-lg
            shadow-md sm:shadow-lg
            transition-all hover:scale-105
            cursor-pointer
          "
              >
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                Start Video Call
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={handleStartSearch}
                className="
            px-6 sm:px-8 py-3 sm:py-4
            bg-white/60
            backdrop-blur-md
            border border-white/40
            text-foreground
            rounded-full
            font-semibold text-sm sm:text-lg
            shadow-sm
            transition-all hover:scale-105
            cursor-pointer
          "
              >
                Find Another Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

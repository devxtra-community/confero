import Navbar from '@/components/Navbar';
import HeroContentImages from '@/components/HeroContentImages';
import Background from '@/components/Background';
import StepsToStart from '@/components/StepsToStart';
import GetStarted from '@/components/GetStarted';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="lg:h-155 relative ">
        <Background />
        <Navbar />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-23">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1 font-sans">
              <div className="inline-block bg-teal-800/40 backdrop-blur-sm border border-white/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
                <span className="text-white text-xs sm:text-sm font-sans">
                  Designed for Serious Career Growth
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl  text-white">
                Confidence Begins When Your{' '}
                <span className="text-favor">Skills</span> Meet The Right{' '}
                <span className="text-favor">Expectations.</span>
              </h1>

              <GetStarted />
            </div>

            <div className="order-1 lg:order-2">
              <HeroContentImages />
            </div>
          </div>
        </div>
      </div>

      <StepsToStart />
    </div>
  );
}

'use client';
import { useState } from 'react';
import { User, Monitor, PlayCircle, MessageCircle } from 'lucide-react';

export default function StepsToStart() {
  const [activeStep, setActiveStep] = useState(1);
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-center text-3xl md:text-4xl text-foreground mb-2 font-sans leading-10">
          Just Few Steps Needed To Get{' '}
          <span className="text-favor">Started !</span>
        </h2>

        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <div
            className="text-center space-y-3 cursor-pointer transform transition hover:scale-105"
            onClick={() => setActiveStep(1)}
          >
            <div
              className={`inline-block px-5 py-1.5 rounded-full text-md font-semibold ${
                activeStep === 1
                  ? 'bg-buttonBg text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Step-1
            </div>
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                activeStep === 1 ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              <User
                className={`w-10 h-10 ${activeStep === 1 ? 'text-buttonBg' : 'text-gray-400'}`}
              />
            </div>
            <h3 className="font-sans text-foreground text-md">
              Create your <span className="text-buttonBg">Profile</span>
            </h3>
          </div>

          <div
            className="text-center space-y-3 cursor-pointer transform transition hover:scale-105"
            onClick={() => setActiveStep(2)}
          >
            <div
              className={`inline-block px-5 py-1.5 rounded-full text-md font-semibold ${
                activeStep === 2
                  ? 'bg-buttonBg text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Step-2
            </div>
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                activeStep === 2 ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              <Monitor
                className={`w-10 h-10 ${activeStep === 2 ? 'text-buttonBg' : 'text-gray-400'}`}
              />
            </div>
            <h3 className="font-sans text-foreground text-md">
              Find your <span className="text-buttonBg">Match</span>
            </h3>
          </div>

          <div
            className="text-center space-y-3 cursor-pointer transform transition hover:scale-105"
            onClick={() => setActiveStep(3)}
          >
            <div
              className={`inline-block px-5 py-1.5 rounded-full text-md font-semibold ${
                activeStep === 3
                  ? 'bg-buttonBg text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Step-3
            </div>
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                activeStep === 3 ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              <PlayCircle
                className={`w-10 h-10 ${activeStep === 3 ? 'text-buttonBg' : 'text-gray-400'}`}
              />
            </div>
            <h3 className="font-sans text-foreground text-md">
              Share your <span className="text-buttonBg">Knowledge</span>
            </h3>
          </div>

          <div
            className="text-center space-y-3 cursor-pointer transform transition hover:scale-105"
            onClick={() => setActiveStep(4)}
          >
            <div
              className={`inline-block px-5 py-1.5 rounded-full text-md font-semibold ${
                activeStep === 4
                  ? 'bg-buttonBg text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Step-4
            </div>
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                activeStep === 4 ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              <MessageCircle
                className={`w-10 h-10 ${activeStep === 4 ? 'text-buttonBg' : 'text-gray-400'}`}
              />
            </div>
            <h3 className="font-sans text-foreground text-md">
              Anytime <span className="text-buttonBg">Connected</span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

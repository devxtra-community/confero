import posthog from 'posthog-js';

export const initPostHog = () => {
  if (typeof window === 'undefined') return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    capture_pageview: false,
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,
    },
  });
};

export { posthog };

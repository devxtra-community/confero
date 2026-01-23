import Link from 'next/link';

export default function GetStarted() {
  return (
    <Link
      href="/dashboard"
      className="bg-buttonBg hover:bg-havorBg text-white text-sm sm:text-base px-10 mt-2  py-2.5 sm:py-3 rounded-full transition transform hover:scale-105 w-full cursor-pointer sm:w-auto"
    >
      <button>Get Started</button>
    </Link>
  );
}

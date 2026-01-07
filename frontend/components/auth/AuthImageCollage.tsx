import Image from 'next/image';

export function AuthImageCollage() {
  return (
    <div className="relative hidden lg:block w-full h-full bg-white">
      {/* Top main image */}
      <div className="absolute top-10 right-84 -rotate-3 rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src="/auth/img1.jpg"
          alt="Video call"
          width={360}
          height={240}
          className="object-cover"
        />
      </div>

      {/* Right side image */}
      <div className="absolute top-50 right-30 rotate-[5deg] rounded-2xl overflow-hidden shadow-xl">
        <Image
          src="/auth/img2.jpg"
          alt="Remote professional"
          width={300}
          height={220}
          className="object-cover"
        />
      </div>

      {/* Center bottom image */}
      <div className="absolute top-88 right-88 rotate-2 rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src="/auth/img3.jpg"
          alt="Online meeting"
          width={380}
          height={260}
          className="object-cover"
        />
      </div>

      {/* Bottom right image */}
      <div className="absolute bottom-10 right-32 -rotate-6 rounded-2xl overflow-hidden shadow-xl">
        <Image
          src="/auth/img4.jpg"
          alt="Job search"
          width={320}
          height={220}
          className="object-cover"
        />
      </div>
    </div>
  );
}

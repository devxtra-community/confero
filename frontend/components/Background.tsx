import Image from 'next/image';

export default function Background() {
  return (
    <div className="absolute inset-0 w-full lg:h-155">
      <Image
        src="/auth/bg3.png"
        fill
        alt="background"
        className="object-cover"
        priority
      />
    </div>
  );
}

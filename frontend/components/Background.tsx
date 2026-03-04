import Image from 'next/image';

export default function Background() {
  return (
    <div className="absolute inset-0 w-full lg:h-155">
      <Image
        src="/auth/greenbg.png"
        fill
        alt="background"
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}

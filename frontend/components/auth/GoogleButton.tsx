import { FcGoogle } from 'react-icons/fc';

export default function GoogleButton() {
  return (
    <button className="w-full h-11 rounded-md border font-semibold border-border flex items-center justify-center gap-2 text-sm">
      <FcGoogle size={25} className="pt-1" />
      Sign in with Google
    </button>
  );
}

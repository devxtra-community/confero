'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface Props {
  password: string;
  setPassword: (val: string) => void;
}

export default function PasswordInput({ password, setPassword }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2 block ml-1">
        New Password
      </label>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full h-11 px-4 rounded-md border border-input"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-3 right-3 text-primary"
        >
          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
    </div>
  );
}

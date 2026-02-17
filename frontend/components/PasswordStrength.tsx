interface Props {
  strength: number;
}

export default function PasswordStrength({ strength }: Props) {
  return (
    <div>
      <div className="mt-3 flex gap-1.5 px-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i < strength ? 'bg-favor' : 'bg-slate-100'
            }`}
          />
        ))}
      </div>

      <p className="text-[11px] text-slate-400 mt-2 ml-1">
        {strength === 1 && 'Too short...'}
        {strength === 2 && 'Getting better...'}
        {strength === 3 && "That's a strong one!"}
      </p>
    </div>
  );
}

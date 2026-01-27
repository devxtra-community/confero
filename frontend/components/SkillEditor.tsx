'use client';

import { useState, useRef } from 'react';

import { SKILL_SUGGESTIONS } from '@/lib/skills';
import {
  SkillInput,
  SkillLevel,
  updateUserSkills,
} from '@/services/userService';

interface Props {
  initialSkills: SkillInput[];
}

export default function SkillEditor({ initialSkills }: Props) {
  const [skills, setSkills] = useState<SkillInput[]>(initialSkills);
  const [input, setInput] = useState('');
  const [level, setLevel] = useState<SkillLevel>('beginner');
  const [loading, setLoading] = useState(false);

  // snapshot to prevent accidental wipe
  const initialSnapshot = useRef(initialSkills);

  const suggestions = input
    ? SKILL_SUGGESTIONS.filter(
        s =>
          s.toLowerCase().includes(input.toLowerCase()) &&
          !skills.some(k => k.name.toLowerCase() === s.toLowerCase())
      )
    : [];

  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setInput('');
      return;
    }

    setSkills(prev => [...prev, { name: trimmed, level }]);
    setInput(''); // ✅ clear only AFTER add
  };

  const removeSkill = (name: string) => {
    setSkills(prev => prev.filter(s => s.name !== name));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(input);
    }
  };

  const saveSkills = async () => {
    // 🔒 Prevent accidental wipe
    if (skills.length === 0 && initialSnapshot.current.length > 0) {
      alert('You cannot remove all skills accidentally');
      return;
    }

    try {
      setLoading(true);
      await updateUserSkills(skills);
      initialSnapshot.current = skills; // update snapshot after success
    } catch {
      setSkills(initialSnapshot.current);
      alert('Failed to update skills');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      {/* SKILLS */}
      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <div
            key={skill.name}
            className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-full text-sm"
          >
            <span>{skill.name}</span>
            <span className="text-xs text-gray-600">({skill.level})</span>
            <button
              onClick={() => removeSkill(skill.name)}
              className="text-red-500 font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add a skill"
          className="border rounded px-3 py-2 w-full"
        />

        <select
          value={level}
          onChange={e => setLevel(e.target.value as SkillLevel)}
          className="border rounded px-2"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* AUTOCOMPLETE */}
      {suggestions.length > 0 && (
        <div className="border rounded bg-white shadow">
          {suggestions.map(skill => (
            <div
              key={skill}
              onClick={() => addSkill(skill)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              {skill}
            </div>
          ))}
        </div>
      )}

      {/* SAVE */}
      <button
        onClick={saveSkills}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Skills'}
      </button>
    </div>
  );
}

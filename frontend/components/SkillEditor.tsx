'use client';

import { SKILL_SUGGESTIONS } from '@/lib/skills';
import {
  SkillInput,
  SkillLevel,
  updateUserSkills,
} from '@/services/userService';
import { useEffect, useState } from 'react';

interface Props {
  initialSkills?: SkillInput[];
  editable?: boolean;
  onSkillsChange?: (skills: SkillInput[]) => void;
}

export default function SkillEditor({
  initialSkills = [],
  editable = false,
}: Props) {
  const [skills, setSkills] = useState<SkillInput[]>([]);
  const [draftName, setDraftName] = useState('');
  const [draftLevel, setDraftLevel] = useState<SkillLevel>('beginner');
  const [loading, setLoading] = useState(false);

  /* 🔥 keep skills in sync after save / prop change */
  useEffect(() => {
    setSkills(
      Array.isArray(initialSkills)
        ? initialSkills.filter(s => typeof s?.label === 'string')
        : []
    );
  }, [initialSkills]);

  const suggestions = draftName
    ? SKILL_SUGGESTIONS.filter(
        s =>
          s.toLowerCase().includes(draftName.toLowerCase()) &&
          !skills.some(
            k =>
              typeof k?.label === 'string' &&
              k.label.toLowerCase() === s.toLowerCase()
          )
      )
    : [];

  const addDraftSkill = () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;

    const exists = skills.some(
      s =>
        typeof s?.label === 'string' &&
        s.label.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      alert('Skill already added');
      return;
    }

    setSkills(prev => [...prev, { label: trimmed, level: draftLevel }]);

    setDraftName('');
    setDraftLevel('beginner');
  };

  const removeSkill = (name: string) => {
    setSkills(prev => prev.filter(s => s.label !== name));
  };

  const saveSkills = async () => {
    try {
      setLoading(true);
      await updateUserSkills(skills);
    } catch {
      alert('Failed to save skills');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      {/* SAVED SKILLS (VIEW + EDIT) */}
      {skills.length === 0 ? (
        <p className="text-sm text-gray-500">No skills added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map(skill => (
            <div
              key={`${skill.label}-${skill.level}`}
              className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-full text-sm"
            >
              <span>{skill.label}</span>
              <span className="text-xs text-gray-600">({skill.level})</span>
              {editable && (
                <button
                  onClick={() => removeSkill(skill.label)}
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODE ONLY */}
      {editable && (
        <>
          {/* INPUT */}
          <div className="flex gap-2">
            <input
              value={draftName}
              onChange={e => setDraftName(e.target.value)}
              placeholder="Select or type a skill"
              className="border rounded px-3 py-2 w-full"
            />

            <select
              value={draftLevel}
              onChange={e => setDraftLevel(e.target.value as SkillLevel)}
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
                  onClick={() => setDraftName(skill)}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {skill}
                </div>
              ))}
            </div>
          )}

          {/* ACTIONS */}
          <button
            onClick={addDraftSkill}
            className="border px-4 py-2 rounded w-full"
          >
            Add Skill
          </button>

          <button
            onClick={saveSkills}
            disabled={loading || skills.length === 0}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Skills'}
          </button>
        </>
      )}
    </div>
  );
}

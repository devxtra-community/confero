'use client';

import { SKILL_SUGGESTIONS } from '@/lib/skills';
import { useEffect, useState } from 'react';
import { Skill } from './ProfilePage';
import { motion, AnimatePresence } from 'framer-motion';
import { addSkill, removeSkill, SkillLevel } from '@/services/userService';
import { toast } from 'sonner';

interface Props {
  initialSkills?: Skill[];
  editable?: boolean;
  onSkillsChange?: (skills: Skill[]) => void;
}

const chipMotion = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const dropdownMotion = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0 },
};

export default function SkillEditor({
  initialSkills = [],
  editable = false,
  onSkillsChange,
}: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [draftName, setDraftName] = useState('');
  const [draftLevel, setDraftLevel] = useState<SkillLevel>('beginner');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setSkills(initialSkills);
  }, [initialSkills]);

  const suggestions = draftName
    ? SKILL_SUGGESTIONS.filter(
        s =>
          s.toLowerCase().includes(draftName.toLowerCase()) &&
          !skills.some(k => k.label.toLowerCase() === s.toLowerCase())
      )
    : [];

  const handleAdd = async () => {
    if (!draftName.trim()) return;

    try {
      setLoading(true);
      const updated = await addSkill(draftName, draftLevel);
      setSkills(updated);
      onSkillsChange?.(updated);
      setDraftName('');
      setDraftLevel('beginner');
      setShowSuggestions(false);
    } catch {
      toast.warning('Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (key: string) => {
    try {
      const updated = await removeSkill(key);
      setSkills(updated);
      onSkillsChange?.(updated);
    } catch {
      toast.warning('Failed to delete skill');
    }
  };

  const levelColor = (level: SkillLevel) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-orange-100 text-orange-700';
    }
  };

  const levelIcon = (level: SkillLevel) =>
    level === 'beginner' ? '🌱' : level === 'intermediate' ? '⚡' : '🏆';

  return (
    <div className="space-y-3">
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {skills.map((skill, index) => (
              <motion.div
                key={skill.key}
                variants={chipMotion}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ delay: index * 0.03 }}
                className={`
                  flex items-center gap-1.5
                  px-3 py-1.5 text-xs font-medium
                  rounded-full ${levelColor(skill.level)}
                `}
              >
                <span>{levelIcon(skill.level)}</span>
                {skill.label}

                {editable && (
                  <button
                    onClick={() => handleRemove(skill.key)}
                    className="ml-1 text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {skills.length === 0 && (
        <p className="text-sm text-gray-400">No skills added yet</p>
      )}

      {editable && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="
            flex flex-col sm:flex-row gap-2
            items-stretch sm:items-center
            pt-2
          "
        >
          <div className="relative flex">
            <input
              value={draftName}
              onChange={e => {
                setDraftName(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              placeholder="Add skill…"
              className="
                w-full px-3 py-2 text-sm
                border rounded-lg
                focus:ring-2 focus:ring-primary/30
              "
            />

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  variants={dropdownMotion}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="
                    absolute -top-10 z-10 mt-1 w-full
                    bg-white border rounded-lg shadow-md
                    max-h-36 overflow-y-auto
                  "
                >
                  {suggestions.slice(0, 6).map(skill => (
                    <div
                      key={skill}
                      onClick={() => {
                        setDraftName(skill);
                        setShowSuggestions(false);
                      }}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {skill}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <select
            value={draftLevel}
            onChange={e => setDraftLevel(e.target.value as SkillLevel)}
            className="px-3 py-2 text-sm border rounded-lg bg-white"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button
            onClick={handleAdd}
            disabled={loading || !draftName.trim()}
            className="
              px-4 py-2 text-sm font-medium
              rounded-lg bg-primary text-white
              hover:bg-primary/90
              disabled:opacity-50
            "
          >
            {loading ? 'Adding…' : 'Add'}
          </button>
        </motion.div>
      )}
    </div>
  );
}

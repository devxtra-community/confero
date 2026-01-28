'use client';

import { useState } from 'react';
import SkillEditor from '@/components/SkillEditor';
import { updateProfile } from '@/services/userService';
import { toast } from 'sonner';
import Image from 'next/image';

export interface Skill {
  label: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Connection {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface UserProfile {
  user: string;
  fullName: string;
  email: string;
  jobTitle?: string;
  linkedinId?: string;
  age?: number;
  sex?: string;
  profilePicture?: string;
  skills?: Skill[];
  connections?: Connection[];
}

interface ProfilePageProps {
  user: UserProfile;
}

interface InputProps {
  label: string;
  value?: string | number;
  editable?: boolean;
  onChange?: (v: string) => void;
}

/* ================= COMPONENT ================= */

export default function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftUser, setDraftUser] = useState<UserProfile>(user);
  const [skills, setSkills] = useState<Skill[]>(user.skills ?? []);

  const handleSave = async () => {
    try {
      const updatedUser = await updateProfile({
        jobTitle: draftUser.jobTitle,
        linkedinId: draftUser.linkedinId,
        age: draftUser.age,
        sex: draftUser.sex,
      });
      setDraftUser(prev => ({
        ...prev,
        ...updatedUser,
        skills: prev.skills,
      }));

      setIsEditing(false);
    } catch {
      toast.warning('something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="rounded-2xl bg-linear-to-r from-blue-100 to-orange-50 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={user.profilePicture ?? "/auth/girl.jpg"}
            alt="avatar"
            className="h-16 w-16 rounded-full object-cover"
          />

          {/* <Image src={user.profilePicture ?? '/auth/girl.jpg'} width={25} height={25} alt='avatar' className="h-16 w-16 rounded-full object-cover" /> */}
          <div>
            <h2 className="text-xl font-semibold">{user.fullName}</h2>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-orange-400 px-4 py-2 text-white"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setDraftUser(user); // reset changes
                  setIsEditing(false);
                }}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="rounded-lg bg-green-600 px-4 py-2 text-white"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* PROFILE DETAILS */}
          <div className="grid grid-cols-2 gap-4 bg-white rounded-2xl p-6">
            {/* NOT EDITABLE */}
            <Input label="Full Name" value={draftUser.fullName} />
            <Input label="Email" value={draftUser.email} />

            {/* EDITABLE */}

            <Input
              label="Job Title"
              value={draftUser.jobTitle}
              editable={isEditing}
              onChange={v => setDraftUser(prev => ({ ...prev, jobTitle: v }))}
            />

            <Input
              label="LinkedIn ID"
              value={draftUser.linkedinId}
              editable={isEditing}
              onChange={v => setDraftUser(prev => ({ ...prev, linkedinId: v }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Age"
                value={draftUser.age}
                editable={isEditing}
                onChange={v =>
                  setDraftUser(prev => ({
                    ...prev,
                    age: Number(v),
                  }))
                }
              />

              <div>
                <label className="text-xs text-gray-500">Sex</label>

                {isEditing ? (
                  <select
                    value={draftUser.sex ?? ''}
                    onChange={e =>
                      setDraftUser(prev => ({ ...prev, sex: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <input
                    value={draftUser.sex ?? ''}
                    disabled
                    className="mt-1 w-full rounded-lg bg-gray-100 px-3 py-2 text-sm"
                  />
                )}
              </div>
            </div>
          </div>

          {!isEditing && skills.length > 0 && (
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <div
                    key={`${skill.label}-${skill.level}`}
                    className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                  >
                    {skill.label} ({skill.level})
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEditing && (
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Skills</h3>
              <SkillEditor
                initialSkills={skills}
                editable={true}
                onSkillsChange={setSkills}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, editable, onChange }: InputProps) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        value={value ?? ''}
        disabled={!editable}
        onChange={e => onChange?.(e.target.value)}
        className={`mt-1 w-full rounded-lg px-3 py-2 text-sm ${editable ? 'border bg-white' : 'bg-gray-100'
          }`}
      />
    </div>
  );
}

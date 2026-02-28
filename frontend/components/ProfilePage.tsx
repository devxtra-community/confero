'use client';

import { useEffect, useState } from 'react';
import SkillEditor from '@/components/SkillEditor';
import { updateProfile } from '@/services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, slideIn } from '@/lib/motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { axiosInstance } from '@/lib/axiosInstance';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Mail,
  Briefcase,
  Linkedin,
  Calendar,
  User,
  Edit3,
  Check,
  LogOut,
  Lightbulb,
  Users,
  Star,
  Plus,
  X,
  ChevronLeft,
} from 'lucide-react';
import BannerCropModal from '@/components/BannerCropModal';
import AvatarEditModal from '@/components/AvatarEditModal';
import Link from 'next/link';
import axios from 'axios';

export interface Skill {
  key: string;
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
  bannerPicture?: string;
}

interface ProfilePageProps {
  user: UserProfile;
}

interface InputProps {
  label: string;
  value?: string | number;
  editable?: boolean;
  onChange?: (v: string) => void;
  icon?: React.ReactNode;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftUser, setDraftUser] = useState<UserProfile>(user);
  const [skills, setSkills] = useState<Skill[]>(user.skills ?? []);
  const [savedUser, setSavedUser] = useState<UserProfile>(user);
  const [savedSkills, setSavedSkills] = useState<Skill[]>(user.skills ?? []);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const [bannerCropOpen, setBannerCropOpen] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarEditOpen, setAvatarEditOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [callCount, setCallCount] = useState(0); // ← add this

  useEffect(() => {
    axiosInstance
      .get('/users/me/call-count')
      .then(res => setCallCount(res.data.count))
      .catch(() => {});
  }, []);
  const router = useRouter();

  function safeImage(src: string | null | undefined, fallback: string) {
    if (typeof src !== 'string') return fallback;
    if (src.length === 0) return fallback;
    return src;
  }
  /* ---------------- avatar upload only ---------------- */

  const handleAvatarChange = async (file: File) => {
    try {
      setAvatarUploading(true);

      // 1. get signed upload url
      const { data } = await axiosInstance.post('/users/me/avatar/upload-url', {
        contentType: file.type,
      });
      // console.log(data);

      const { uploadUrl, key } = data;

      // 2. upload directly to R2
      const uploadRes = await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        withCredentials: false,
      });

      if (uploadRes.status !== 200) {
        throw new Error('Direct upload failed');
      }

      // 3. finalize upload
      const finalize = await axiosInstance.post('/users/me/avatar/complete', {
        key,
      });

      const updatedUser = finalize.data.user;

      setDraftUser(p => ({
        ...p,
        profilePicture: updatedUser.profilePicture,
      }));

      setSavedUser(p => ({
        ...p,
        profilePicture: updatedUser.profilePicture,
      }));

      toast.success('Profile picture updated');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  /* ---------------- banner ---------------- */

  const handleBannerChange = async (file: File) => {
    try {
      setBannerUploading(true);

      // 1. get signed upload url
      const { data } = await axiosInstance.post('/users/me/banner/upload-url', {
        contentType: file.type,
      });

      const { uploadUrl, key } = data;

      // 2. upload directly to R2
      const uploadRes = await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        withCredentials: false,
      });

      if (uploadRes.status !== 200) {
        throw new Error('Direct upload failed');
      }

      // 3. finalize upload
      const finalize = await axiosInstance.post('/users/me/banner/complete', {
        key,
      });

      const updatedUser = finalize.data.user;

      setDraftUser(p => ({
        ...p,
        bannerPicture: updatedUser.bannerPicture,
      }));

      setSavedUser(p => ({
        ...p,
        bannerPicture: updatedUser.bannerPicture,
      }));

      toast.success('Banner updated');
    } catch (err) {
      console.error(err);
      toast.error('Banner upload failed');
    } finally {
      setBannerUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      toast.success('Logged out');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const handleSave = async () => {
    try {
      const res = await updateProfile({
        jobTitle: draftUser.jobTitle,
        linkedinId: draftUser.linkedinId,
        age: draftUser.age,
        sex: draftUser.sex,
      });

      // IMPORTANT: only use backend user
      const newSavedUser = {
        ...draftUser,
        ...res,
        skills,
      };

      // console.log(newSavedUser);

      setDraftUser(newSavedUser);
      setSavedUser(newSavedUser);
      setSavedSkills(skills);

      setIsEditing(false);
      toast.success('Your profile has been updated');
    } catch {
      toast.warning('Something went wrong');
    }
  };

  const handleCancel = () => {
    setDraftUser(savedUser);
    setSkills(savedSkills);
    setIsEditing(false);
  };

  const completion = calculateProfileCompletion(savedUser, savedSkills);
  const avatarSrc = safeImage(
    draftUser.profilePicture,
    '/profile/default-avatar.png'
  );
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-emerald-50/20 to-slate-50 px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">
      <Link
        href="/home"
        className="absolute top-7 left-10 flex  font-semibold text-primary"
      >
        {' '}
        <ChevronLeft size={23} className="mt-0.5" />
        Go Back
      </Link>
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 md:mb-12"
        >
          <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            {/* banner */}
            <div className="relative w-full overflow-hidden group aspect-4/1 rounded-t-2xl">
              <Image
                src={safeImage(
                  draftUser.bannerPicture,
                  '/profile/default-banner.jpg'
                )}
                alt="Profile banner"
                fill
                className="object-cover"
                loading="eager"
                unoptimized
              />

              {isEditing && (
                <label className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow cursor-pointer transition">
                  <Camera className="w-4 h-4 text-slate-800" />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const url = URL.createObjectURL(file);
                      setBannerPreview(url);
                      setBannerCropOpen(true);
                    }}
                  />
                </label>
              )}

              {bannerUploading && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="relative px-5 sm:px-6 md:px-8 pb-6 md:pb-8">
              {/* avatar */}
              <div className="relative -mt-14 sm:-mt-16 md:-mt-20 lg:-mt-24 mb-4 md:mb-6">
                <div className="relative inline-block group">
                  <div className="relative">
                    <Image
                      src={avatarSrc}
                      unoptimized
                      width={128}
                      height={128}
                      alt="avatar"
                      className="h-28 w-28 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-44 lg:w-44
           rounded-full object-cover border-4 border-white shadow-lg
           ring-1 ring-slate-200/50"
                    />

                    {isEditing && (
                      <label className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Camera className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1" />
                          <p className="text-[10px] md:text-xs font-medium">
                            Change
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const url = URL.createObjectURL(file);
                            setAvatarPreview(url);
                            setAvatarEditOpen(true);
                          }}
                        />
                      </label>
                    )}

                    {avatarUploading && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />
                </div>
              </div>

              {/* user info + actions */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-900 mb-1 truncate">
                    {draftUser.fullName}
                  </h1>

                  <p className="text-base md:text-lg text-slate-600 mb-3 md:mb-4 truncate">
                    {draftUser.jobTitle || 'Professional'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate max-w-50 sm:max-w-none">
                        {draftUser.email}
                      </span>
                    </div>

                    {draftUser.linkedinId && (
                      <div className="flex items-center gap-1.5">
                        <Linkedin className="w-4 h-4 text-slate-400" />
                        <span>LinkedIn</span>
                      </div>
                    )}

                    {draftUser.age && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{draftUser.age} years</span>
                      </div>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-slate-700">
                      {completion}% Complete
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <AnimatePresence mode="wait">
                    {!isEditing ? (
                      <motion.div
                        key="view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <button
                          onClick={handleLogout}
                          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                        </button>

                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm rounded-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2.5 border rounded-lg"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>

                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* main content is unchanged */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* personal info */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm"
            >
              <h2 className="text-lg md:text-xl font-semibold mb-6">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                <Input
                  label="Full Name"
                  value={draftUser.fullName}
                  icon={<User className="w-4 h-4 text-slate-400" />}
                />
                <Input
                  label="Email"
                  value={draftUser.email}
                  icon={<Mail className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="Job Title"
                  value={draftUser.jobTitle}
                  editable={isEditing}
                  onChange={v => setDraftUser(p => ({ ...p, jobTitle: v }))}
                  icon={<Briefcase className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="LinkedIn"
                  value={draftUser.linkedinId}
                  editable={isEditing}
                  onChange={v => setDraftUser(p => ({ ...p, linkedinId: v }))}
                  icon={<Linkedin className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="Age"
                  value={draftUser.age}
                  editable={isEditing}
                  onChange={v => setDraftUser(p => ({ ...p, age: Number(v) }))}
                  icon={<Calendar className="w-4 h-4 text-slate-400" />}
                />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      value={draftUser.sex ?? ''}
                      onChange={e =>
                        setDraftUser(p => ({ ...p, sex: e.target.value }))
                      }
                      className="w-full rounded-lg border px-4 py-2.5"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <input
                      disabled
                      value={draftUser.sex ?? 'Not specified'}
                      className="w-full rounded-lg border px-4 py-2.5 bg-slate-50"
                    />
                  )}
                </div>
              </div>
            </motion.div>

            {/* skills */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold">
                    Skills & Expertise
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {skills.length} skill{skills.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {!isEditing && skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <div
                      key={skill.key}
                      className={`px-3 py-1.5 rounded-lg text-sm border ${getSkillStyle(skill.level)}`}
                    >
                      {skill.label}
                    </div>
                  ))}
                </div>
              )}

              {isEditing && (
                <SkillEditor
                  initialSkills={skills}
                  editable={isEditing}
                  onSkillsChange={setSkills}
                />
              )}

              {!isEditing && skills.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Plus className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-600">No skills added</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* right column */}
          <div className="space-y-6 md:space-y-8">
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="bg-white border rounded-2xl p-6 shadow-sm"
            >
              <h3 className="font-semibold mb-5">Overview</h3>

              <StatRow
                label="Skills"
                value={savedSkills.length}
                icon={<Lightbulb className="w-4 h-4 text-emerald-600" />}
              />
              <StatRow
                label="Connections"
                value={callCount}
                icon={<Users className="w-4 h-4 text-blue-600" />}
              />
              <StatRow
                label="Advanced"
                value={savedSkills.filter(s => s.level === 'advanced').length}
                icon={<Star className="w-4 h-4 text-amber-500" />}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {bannerPreview && (
        <BannerCropModal
          open={bannerCropOpen}
          image={bannerPreview}
          onClose={() => {
            setBannerCropOpen(false);
            setBannerPreview(null);
          }}
          onSave={async blob => {
            setBannerCropOpen(false);
            setBannerPreview(null);

            const file = new File([blob], 'banner.jpg', { type: 'image/jpeg' });
            await handleBannerChange(file);
          }}
        />
      )}
      {avatarPreview && (
        <AvatarEditModal
          open={avatarEditOpen}
          image={avatarPreview}
          onClose={() => {
            setAvatarEditOpen(false);
            setAvatarPreview(null);
          }}
          onDelete={async () => {
            try {
              setAvatarEditOpen(false);
              setAvatarPreview(null);

              await axiosInstance.delete('/users/me/avatar');

              setDraftUser(p => ({ ...p, profilePicture: undefined }));
              setSavedUser(p => ({ ...p, profilePicture: undefined }));

              toast.success('Avatar removed');
            } catch {
              toast.error('Failed to remove avatar');
            }
          }}
          onChangePhoto={() => {
            setAvatarEditOpen(false);
            setAvatarPreview(null);

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = e => {
              const f = (e.target as HTMLInputElement).files?.[0];
              if (!f) return;

              const url = URL.createObjectURL(f);
              setAvatarPreview(url);
              setAvatarEditOpen(true);
            };
            input.click();
          }}
          onSave={async blob => {
            setAvatarEditOpen(false);
            setAvatarPreview(null);

            const file = new File([blob], 'avatar.png', {
              type: 'image/png',
            });

            await handleAvatarChange(file);
          }}
        />
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function Input({ label, value, editable, onChange, icon }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
        )}
        <input
          value={value ?? ''}
          disabled={!editable}
          onChange={e => onChange?.(e.target.value)}
          className={`w-full rounded-lg ${icon ? 'pl-10' : 'px-4'} py-2.5 border`}
        />
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function getSkillStyle(level: Skill['level']) {
  switch (level) {
    case 'beginner':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'intermediate':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'advanced':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function calculateProfileCompletion(
  user: UserProfile,
  skills: Skill[]
): number {
  let completion = 0;

  const fields = [
    user.fullName,
    user.email,
    user.jobTitle,
    user.linkedinId,
    user.age,
    user.sex,
    user.profilePicture,
  ];

  fields.forEach(f => {
    if (f) completion += 10;
  });

  if (skills.length > 0) completion += 15;
  if (skills.length >= 3) completion += 15;

  return Math.min(completion, 100);
}

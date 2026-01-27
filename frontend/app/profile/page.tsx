import SkillEditor from '@/components/SkillEditor';
import { SkillInput } from '@/services/userService';

export default async function ProfilePage() {
  // assume fetched from backend
  const skills: SkillInput[] = [
    { name: 'React', level: 'advanced' },
    { name: 'WebRTC', level: 'intermediate' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Your Skills</h1>
      <SkillEditor initialSkills={skills} />
    </div>
  );
}

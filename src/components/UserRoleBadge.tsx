import React from 'react';
import { Shield, Edit3, User } from 'lucide-react';

interface UserRoleBadgeProps {
  role: 'admin' | 'editor' | 'user';
}

const ROLE_CONFIG = {
  admin: {
    icon: Shield,
    text: 'Administrator',
    className: 'bg-[#2c3b67]/10 text-[#2c3b67]'
  },
  editor: {
    icon: Edit3,
    text: 'Edytor',
    className: 'bg-[#34C759]/10 text-[#34C759]'
  },
  user: {
    icon: User,
    text: 'Użytkownik',
    className: 'bg-[#0066CC]/10 text-[#0066CC]'
  }
};

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.text}
    </span>
  );
};
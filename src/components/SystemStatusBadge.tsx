import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { SystemStatus } from '../types/system';

interface SystemStatusBadgeProps {
  status: SystemStatus;
}

const STATUS_CONFIG = {
  draft: {
    icon: Clock,
    text: 'Szkic',
    className: 'bg-[#F5F5F7] text-[#86868b]'
  },
  pending: {
    icon: AlertCircle,
    text: 'Oczekuje na przegląd',
    className: 'bg-[#FF9500]/10 text-[#FF9500]'
  },
  published: {
    icon: CheckCircle2,
    text: 'Opublikowany',
    className: 'bg-[#34C759]/10 text-[#34C759]'
  },
  rejected: {
    icon: XCircle,
    text: 'Odrzucony',
    className: 'bg-[#FF3B30]/10 text-[#FF3B30]'
  }
};

export const SystemStatusBadge: React.FC<SystemStatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.text}
    </span>
  );
};
import { BadgeCheck, Crown } from 'lucide-react';

interface IconProps {
  className?: string;
}

export function VerifiedTickIcon({ className = 'w-3 h-3' }: IconProps) {
  return <BadgeCheck aria-hidden="true" className={`text-sky-400 ${className}`} strokeWidth={2.2} />;
}

export function CrownBadgeIcon({ className = 'w-3 h-3' }: IconProps) {
  return <Crown aria-hidden="true" className={`text-amber-400 ${className}`} strokeWidth={2.2} />;
}

// frontend/components/ui/verified-badge.tsx
import { CheckCircle } from 'lucide-react';

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 ml-2 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
      <CheckCircle className="h-3 w-3" />
      Verified
    </span>
  );
}

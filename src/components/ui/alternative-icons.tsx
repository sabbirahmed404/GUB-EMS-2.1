import { LucideProps } from 'lucide-react';
import { forwardRef } from 'react';

// This is an alternative to the Fingerprint icon that won't be blocked by ad blockers
export const CustomFingerprint = forwardRef<SVGSVGElement, LucideProps>(
  ({ color = 'currentColor', size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 0 1 7.4 16.7" />
      <path d="M12 2a10 10 0 0 0-7.4 16.7" />
      <path d="M12 6a6 6 0 0 1 4.8 9.5" />
      <path d="M12 6a6 6 0 0 0-4.8 9.5" />
      <path d="M12 10c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Z" />
    </svg>
  )
);

CustomFingerprint.displayName = 'CustomFingerprint'; 
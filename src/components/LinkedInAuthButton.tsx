import React from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase } from '../config/supabase';

interface LinkedInAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const LinkedInAuthButton: React.FC<LinkedInAuthButtonProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const handleLinkedInLogin = async () => {
    try {
      console.log('Starting LinkedIn login...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'openid profile email',
        },
      });

      if (error) {
        console.error('LinkedIn auth error:', error);
        onError?.(error);
        return;
      }

      if (data) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('LinkedIn auth error:', error);
      onError?.(error as Error);
    }
  };

  return (
    <button
      onClick={handleLinkedInLogin}
      className={`sf-button flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg transition-colors ${className}`}
      type="button"
    >
      <ExternalLink className="w-5 h-5" />
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
      <span className="font-medium">Kontynuuj przez LinkedIn</span>
    </button>
  );
};

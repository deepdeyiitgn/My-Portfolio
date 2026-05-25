import { ReactNode } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleIdentity } from '../hooks/useGoogleIdentity';

export default function GoogleAuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, refreshFromCredential } = useGoogleIdentity();

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 space-y-6">
      <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Google Login Required</h1>
      <p className="text-zinc-400">Please sign in with Google to access this private channel.</p>
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 inline-block">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (!credentialResponse.credential) return;
            refreshFromCredential(credentialResponse.credential);
            window.location.reload();
          }}
          onError={() => { /* ignore */ }}
          text="signin_with"
          useOneTap={false}
        />
      </div>
    </div>
  );
}

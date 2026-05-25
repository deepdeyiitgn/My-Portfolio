import { useCallback, useEffect, useState } from 'react';
import type { CommunityPost } from '../types/community';
import type { GoogleIdentity } from './useGoogleIdentity';

export function useCommunityFeed(identity: GoogleIdentity | null) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const credential = identity?.credential ? `&credential=${encodeURIComponent(identity.credential)}` : '';
      const response = await fetch(`/api/journal?action=community-feed${credential}`);
      const payload = await response.json();
      if (!payload?.ok) throw new Error(payload?.message || 'Failed to load feed');
      setPosts(Array.isArray(payload.posts) ? payload.posts : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [identity?.credential]);

  const react = useCallback(async (postId: string, emoji: string) => {
    if (!identity?.credential) return;
    const response = await fetch('/api/journal?action=community-react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: identity.credential, postId, emoji }),
    });
    const payload = await response.json().catch(() => ({}));
    if (payload?.ok) {
      setPosts((prev) => prev.map((item) => (item._id === postId
        ? { ...item, reactions: Array.isArray(payload.reactions) ? payload.reactions : item.reactions }
        : item)));
    }
  }, [identity?.credential]);

  const votePoll = useCallback(async (postId: string, pollId: string, optionId: string) => {
    if (!identity?.credential) return;
    const response = await fetch('/api/journal?action=community-poll-vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: identity.credential, postId, pollId, optionId }),
    });
    const payload = await response.json().catch(() => ({}));
    if (payload?.ok) {
      setPosts((prev) => prev.map((item) => (item._id === postId ? { ...item, poll: payload.poll || item.poll } : item)));
    }
  }, [identity?.credential]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return {
    posts,
    loading,
    error,
    fetchFeed,
    react,
    votePoll,
    setPosts,
  };
}

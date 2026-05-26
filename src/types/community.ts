export type CommunityAttachmentKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'location'
  | 'youtube'
  | 'link-preview';

export interface CommunityAttachment {
  id: string;
  kind: CommunityAttachmentKind;
  name?: string;
  url?: string;
  size?: number;
  mimeType?: string;
  durationSec?: number;
  thumbnailUrl?: string;
  proxyUrl?: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface CommunityPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface CommunityPoll {
  id: string;
  question: string;
  options: CommunityPollOption[];
  votedOptionByUser?: string | null;
}

export interface CommunityReactionSummary {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface CommunityPost {
  _id: string;
  text: string;
  attachments: CommunityAttachment[];
  poll: CommunityPoll | null;
  reactions: CommunityReactionSummary[];
  createdAt: string;
  createdAtIST?: string;
  createdBy: {
    userId: string;
    userName: string;
    userPic?: string;
    isOwner?: boolean;
  };
  pinned?: boolean;
}

export interface CommunityFeedResponse {
  ok: boolean;
  posts: CommunityPost[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type UpdateKind = 'system' | 'admin';

export interface UpdateItem {
  _id: string;
  kind: UpdateKind;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  createdAt: string;
  createdAtIST?: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  userName?: string;
  userPic?: string;
  userProfileLink?: string;
  title: string;
  message: string;
  type: 'reply' | 'pinned' | 'admin' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface LinkAnalyticsRow {
  _id?: string;
  targetUrl: string;
  targetHost: string;
  sourcePage: string;
  ip: string;
  userId: string | null;
  loggedIn: boolean;
  createdAt: string;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export interface FeedbackSubSubject {
  id: string;
  slug: string;
  name: string;
}

export interface FeedbackSubject {
  id: string;
  slug: string;
  name: string;
  source: 'auto' | 'manual';
  linkedProjectId?: string;
  subSubjects: FeedbackSubSubject[];
}

export interface FeedbackEntry {
  _id: string;
  sourceKey: string;
  userId: string;
  userName: string;
  userPic: string;
  subjectSlug: string;
  subjectName: string;
  subSubjectId: string;
  subSubjectSlug: string;
  subSubjectName: string;
  rating: number;
  headline: string;
  message: string;
  createdAt: string;
  createdAtIST: string;
  isPinned: boolean;
}

export interface FeedbackSummaryBucket {
  rating: number;
  count: number;
}

export interface FeedbackSummary {
  total: number;
  average: number;
  distribution: FeedbackSummaryBucket[];
}

export interface FeedbackMetrics {
  totalFeedbacks: number;
  pinnedFeedbacks: number;
  totalSubjects: number;
  totalSubSubjects: number;
}

export interface FeedbackPublicPayload {
  subjects: FeedbackSubject[];
  feedbacks: FeedbackEntry[];
  pinnedFeedbacks: FeedbackEntry[];
  summary: FeedbackSummary;
  userSubmissionKeys: string[];
  metrics: FeedbackMetrics;
}

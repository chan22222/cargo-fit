export type FeedbackType = 'feedback' | 'suggestion' | 'bug' | 'feature' | 'question' | 'partnership' | 'other';

export interface Feedback {
  id: string;
  name: string;
  email: string;
  contact?: string;
  organization?: string;
  message: string;
  type: FeedbackType;
  created_at: string;
  read: boolean;
}

export interface FeedbackFormData {
  name: string;
  email: string;
  contact?: string;
  organization?: string;
  message: string;
  type: FeedbackType;
}
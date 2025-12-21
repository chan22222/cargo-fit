// Feedback API client for Edge Function
import { FeedbackFormData } from '../types/feedback';

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-feedback`
  : '';

export interface FeedbackResponse {
  success?: boolean;
  message?: string;
  error?: string;
  cooldown?: number;
  retryAfter?: number;
}

export const submitFeedbackViaEdgeFunction = async (
  feedbackData: FeedbackFormData
): Promise<FeedbackResponse> => {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify(feedbackData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'Failed to submit feedback',
        cooldown: data.cooldown,
        retryAfter: data.retryAfter,
      };
    }

    return {
      success: true,
      message: data.message || 'Feedback submitted successfully',
    };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return {
      error: 'Network error. Please check your connection and try again.',
    };
  }
};
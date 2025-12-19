export interface Insight {
  id: string;
  tag: 'Logistics' | 'Tech' | 'Sustainability' | 'Market' | 'Policy' | 'Innovation';
  title: string;
  date: string;
  imageUrl: string;
  content?: string;
  author?: string;
  published: boolean;
  viewCount?: number;
}

export interface InsightFormData {
  tag: Insight['tag'];
  title: string;
  date: string;
  imageUrl: string;
  content: string;
  author: string;
  published: boolean;
}
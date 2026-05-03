export interface SocialPost {
  id: string;
  source: string;
  source_id?: string;
  author?: string;
  content: string;
  url?: string;
  hashtags: string[];
  keywords: string[];
  sentiment?: number;
  engagement: number;
  region: string;
  posted_at?: string;
  collected_at: string;
}

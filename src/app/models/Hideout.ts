import { HideoutChangelogHistory } from './HideoutChangelogHistory';
import { HideoutImage } from './HideoutImage';

export interface Hideout {
  guid: string;
  name: string;
  poeVersion: '1' | '2';
  rating: number;
  map: string;
  images: HideoutImage[];
  publishedAt: string;
  lastUpdatedAt: string;
  authorUsername: string;
  timesDownloaded: number;
  commentCount: number;
  timesFavorited: number;
  music: string | null;
  description: string | null;
  tags: string[];
  hasMTX: boolean;
  changelogHistory: HideoutChangelogHistory[];
}

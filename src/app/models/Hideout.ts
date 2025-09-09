import { HideoutChangelogHistory } from './HideoutChangelogHistory';

export interface Hideout {
  guid: string;
  name: string;
  poeVersion: '1' | '2';
  rating: number;
  map: string;
  imgUrl: string;
  imgAlt?: string;
  publishedAt: string;
  lastUpdatedAt: string;
  authorUsername: string;
  timesDownloaded: number;
  commentCount: number;
  timesFavorited: number;
  hasMTX: boolean;
  music: string | null;
  description: string | null;
  tags: string[];
  decorations: any[];
  changelogHistory: HideoutChangelogHistory[];
}

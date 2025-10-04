import { HideoutChangelogHistory } from './HideoutChangelogHistory';
import { HideoutImage } from './HideoutImage';
import { PoeVersion } from './PoeVersion';

export interface Hideout {
  guid: string;
  name: string;
  poeVersion: PoeVersion;
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

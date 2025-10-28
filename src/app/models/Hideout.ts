import { HideoutChangelogHistory } from './HideoutChangelogHistory';
import { HideoutImage } from './HideoutImage';
import { HideoutMap } from './HideoutMap';
import { HideoutTag } from './HideoutTag';
import { PoeVersion } from './PoeVersion';

export interface Hideout {
  id: string;
  name: string;
  poeVersion: PoeVersion;
  rating: number;
  map: HideoutMap;
  images: HideoutImage[];
  createdAt: string;
  updatedAt: string;
  author: string;
  timesDownloaded: number;
  commentCount: number;
  timesFavorited: number;
  description: string | null;
  tags: HideoutTag[];
  hasMTX: boolean;
  changelogHistory: HideoutChangelogHistory[];
}

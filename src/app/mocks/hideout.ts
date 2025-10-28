import { Hideout } from '../models/Hideout';
import { PoeVersion } from '../models/PoeVersion';
import { hideoutMaps } from './hideout-maps';
import { hideoutTags } from './hideout-tags';

export const mockedHideout: Hideout = {
  id: '0b8928d6-14d2-43c6-b759-3696325fff69',
  name: 'Primordial',
  rating: 4.7,
  poeVersion: PoeVersion.Two,
  map: hideoutMaps[0],
  images: [
    {
      url: '/hideout_example.png',
      alt: 'Example hideout image',
    },
  ],
  createdAt: '2025-09-05T12:51:58.405Z',
  updatedAt: '2025-09-05T14:51:58.405Z',
  author: 'Shinjoku',
  timesDownloaded: 225,
  commentCount: 25,
  timesFavorited: 3,
  hasMTX: false,
  description:
    "This is a lorem ipsum text for a Shrine Hideout upload.\n\nI have no idea what to say about it 'cause I don't know which hideout it is\nPoggers!",
  tags: hideoutTags,
  changelogHistory: [
    {
      version: '1.0',
      publishedAt: '2025-09-05T12:51:58.405Z',
      description: 'First release',
      fileURL: '/celestial-quarters.sample.hideout',
    },
    {
      version: '1.1',
      publishedAt: '2025-09-05T14:51:58.405Z',
      description: 'Added a thingie',
      fileURL: '/celestial-quarters.sample.hideout',
    },
  ],
};

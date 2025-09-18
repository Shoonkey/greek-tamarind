import { Hideout } from '../models/Hideout';

export const mockedHideout: Hideout = {
  guid: 'random-guid',
  name: 'Primordial',
  rating: 4.7,
  poeVersion: '2',
  map: 'Shrine Hideout',
  images: [{ src: '/example.png', alt: '' }],
  publishedAt: '2025-09-05T12:51:58.405Z',
  lastUpdatedAt: '2025-09-05T14:51:58.405Z',
  authorUsername: 'Shinjoku',
  timesDownloaded: 225,
  commentCount: 25,
  timesFavorited: 3,
  hasMTX: false,
  music: null,
  description:
    "This is a lorem ipsum text for a Shrine Hideout upload.\n\nI have no idea what to say about it 'cause I don't know which hideout it is\nPoggers!",
  tags: ['medieval', 'silly'],
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

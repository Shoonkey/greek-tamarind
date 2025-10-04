import { HideoutMetadata } from '../models/HideoutMetadata';
import { PoeVersion } from '../models/PoeVersion';

export const mockedHideoutMetadata: HideoutMetadata = {
  guid: 'random-guid',
  poeVersion: PoeVersion.Two,
  rating: 4.8,
  map: 'Shrine Hideout',
  hasMTX: false,
  images: [{ src: '/example.png', alt: '' }],
};

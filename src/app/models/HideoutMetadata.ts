import { Hideout } from './Hideout';

type MetadataProp = 'guid' | 'poeVersion' | 'hasMTX' | 'rating' | 'map' | 'images';

export type HideoutMetadata = Pick<Hideout, MetadataProp>;

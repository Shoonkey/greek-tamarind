import { Hideout } from './Hideout';

type MetadataProp = 'guid' | 'poeVersion' | 'hasMTX' | 'rating' | 'imgUrl' | 'imgAlt' | 'map';

export type HideoutMetadata = Pick<Hideout, MetadataProp>;

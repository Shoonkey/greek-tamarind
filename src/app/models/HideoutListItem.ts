import { Hideout } from './Hideout';

export type HideoutListItemProp =
  | 'id'
  | 'author'
  | 'hasMTX'
  | 'imageUrls'
  | 'map'
  | 'name'
  | 'rating'
  | 'tags'
  | 'poeVersion';

export type HideoutListItem = Pick<Hideout, HideoutListItemProp>;

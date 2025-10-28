import { Hideout } from './Hideout';

export type HideoutListItemProp =
  | 'id'
  | 'author'
  | 'hasMTX'
  | 'images'
  | 'map'
  | 'name'
  | 'rating'
  | 'tags'
  | 'poeVersion';

export type HideoutListItem = Pick<Hideout, HideoutListItemProp>;

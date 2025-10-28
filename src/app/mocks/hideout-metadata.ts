import { Hideout } from '../models/Hideout';
import { HideoutListItem, HideoutListItemProp } from '../models/HideoutListItem';

import { mockedHideout } from './hideout';

function getHideoutListItem(hideout: Hideout): HideoutListItem {
  const obj: any = {};

  const props: HideoutListItemProp[] = [
    'id',
    'author',
    'hasMTX',
    'images',
    'map',
    'name',
    'rating',
    'tags',
    'poeVersion',
  ];

  for (const prop of props) obj[prop] = hideout[prop];

  return obj;
}

export const mockedHideoutMetadata = getHideoutListItem(mockedHideout);

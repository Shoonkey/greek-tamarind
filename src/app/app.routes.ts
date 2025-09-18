import { Routes } from '@angular/router';

import { HideoutList } from './pages/hideout-list/hideout-list';

const appTitle = `PoEtential Hideout`;
const createTitle = (str: string) => `${str} | ${appTitle}`;

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HideoutList,
    title: createTitle('Search for hideouts'),
  },
  // {
  //   path: "/u/:username",
  //   component: ProfilePage
  // }
];

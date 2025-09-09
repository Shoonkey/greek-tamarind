import { Routes } from '@angular/router';

import { HideoutList } from './pages/hideout-list/hideout-list';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HideoutList,
  },
  // {
  //   path: "/account",
  //   component: AccountPage
  // }
];

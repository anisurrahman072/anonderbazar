import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CmsComponent } from './core/cms.component';

const routes: Routes = [
  {
    path: '' /* /dashboard/ */,
    component: CmsComponent,
    children: [
      {
        path: 'home' /* /dashboard/cms/advertisement   */,
        loadChildren: './cms-home/cms-home.module#CmsHomeModule'
      },
      {
        path: 'layout',
        loadChildren: './cms-layout/cms-layout.module#CmsLayoutModule'
      },
      {
        path: 'advertise',
        loadChildren: './cms-add/cms-add.module#CmsAddModule'
      },
      {
        path: 'post',
        loadChildren: './cms-post/cms-post.module#CmsPostModule'
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard/cms/home' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CmsRoutingModule {}

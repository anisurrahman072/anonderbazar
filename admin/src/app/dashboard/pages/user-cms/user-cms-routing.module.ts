import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserCmsComponent } from './core/user-cms.component';

const routes: Routes = [
  {
    path: '' /* /dashboard/ */,
    component: UserCmsComponent,
    children: [
      {
        path: 'post',
        loadChildren: './user-cms-post/user-cms-post.module#UserCmsPostModule'
      } //cms-working.module
    ]
  },
  { path: '**', redirectTo: '/dashboard/usercms/post' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CmsRoutingModule {}

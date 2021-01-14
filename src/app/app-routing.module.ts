import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TranslatorComponent } from './translator/translator.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'translator',
    pathMatch: 'full'
  },

  {
    path: 'translator',
    component: TranslatorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

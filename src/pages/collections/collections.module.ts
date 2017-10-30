import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { cListPage,CollectionsPage } from './collections';

@NgModule({
  declarations: [
    CollectionsPage,
    cListPage
  ],
  imports: [
    IonicPageModule.forChild(CollectionsPage),
  ],
  entryComponents: [
    cListPage,
  ] 
})
export class CollectionsPageModule {}

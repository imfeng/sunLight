import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { cListPage,CollectionsPage } from './collections';
import { CollectionsModule } from '../../providers/collections-data/collections-data.module';
@NgModule({
  declarations: [
    CollectionsPage,
    cListPage
  ],
  imports: [
    CollectionsModule,
    IonicPageModule.forChild(CollectionsPage),
  ],
  entryComponents: [
    cListPage,
  ] 
})
export class CollectionsPageModule {}

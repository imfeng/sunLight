import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { CollectionsDataProvider,collectionNamePipe } from './collections-data';

@NgModule({
  declarations: [
    collectionNamePipe,
  ],
  exports: [
    collectionNamePipe,
  ],
    imports: [CommonModule],
  providers: [
    CollectionsDataProvider
  ],
})
export class CollectionsModule {

}

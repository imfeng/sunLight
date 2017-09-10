import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { NativeStorage } from '@ionic-native/native-storage';
const __REF_BASE_SECTIONS = 'sectionsArr-'; // 'patternsArr-_GID_-_PID_'
/*
  Generated class for the SectionsDataProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
export interface sectioDataType {
  "mode":number,
  "time":string,
  "time_num":Array<number>,  // [ HOUR , MIN ]
  "multiple":number,
}
@Injectable()
export class SectionsDataProvider {

  constructor(
    private storage:NativeStorage,
    ) {
    console.log('Hello SectionsDataProvider Provider');
  }
  createNew(){
    let sub = Observable.fromPromise(this.storage.setItem(__REF_BASE_SECTIONS,{}));
    return sub;
  }
  add(sid){
    let sub = Observable.fromPromise(this.storage.setItem(__REF_BASE_SECTIONS+sid,{}));
    return sub;
  }

}

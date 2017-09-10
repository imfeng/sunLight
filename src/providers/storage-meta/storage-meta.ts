import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the StorageMetaProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class StorageMetaProvider {
  private meta = {
    "SECTIONS_CURSOR": 0
  }
  public 
  constructor(public http: Http) {
    
  }
  sectionsMetaAdd(){
    this.meta["SECTIONS_CURSOR"]++;
    return this.meta["SECTIONS_CURSOR"];
  }
  sectionsRemove(_sectionsId_:number){

  }

}

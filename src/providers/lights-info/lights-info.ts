import { Injectable } from '@angular/core';
//import { Http } from '@angular/http';
// public http: Http
import 'rxjs/add/operator/map';

/*
  Generated class for the LightsInfoProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/


@Injectable()
export class LightsInfoProvider {

  constructor() {
    console.log('Hello LightsInfoProvider Provider');
  }
  getTypes(index = 'all'){
    switch(index){
      default:{
        return li_types.map(obj => obj[index] );
      }
      case 'all':{
        return li_types;
      }
    }
  }

}
  const li_types : Array<object> =[{
    "value": 1,
    "name": "太陽光5m",
    "slug": "5m"
  },{
    "value": 2,
    "name": "太陽光10m",
    "slug": "10m"
  },{
    "value": 3,
    "name": "太陽光15m",
    "slug": "15m"
  },{
    "value": 4,
    "name": "太陽光20m",
    "slug": "20m"
  },{
    "value": 5,
    "name": "高演色性太陽光",
    "slug": "cri"
  },{
    "value": 6,
    "name": "藍光",
    "slug": "blue"
  }]
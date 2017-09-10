import { PipeTransform ,Pipe,Injectable } from '@angular/core';
//import { Http } from '@angular/http';
// public http: Http
import 'rxjs/add/operator/map';

/*
  Generated class for the LightsInfoProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
const li_types : Array<lightsType> =[{
  "value": 1,
  "name": "太陽光5m",
  "slug": "5m",
  "color": "rgb(54, 235, 186)",
},{
  "value": 2,
  "name": "太陽光10m",
  "slug": "10m",
  "color": "rgb(9, 230, 232)",
},{
  "value": 3,
  "name": "太陽光15m",
  "slug": "15m",
  "color": "rgb(9, 148, 232)",
},{
  "value": 4,
  "name": "太陽光20m",
  "slug": "20m",
  "color": "rgb(54, 92, 235)",
},{
  "value": 5,
  "name": "高演色性太陽光",
  "slug": "cri",
  "color": "rgb(86, 9, 232)",
},{
  "value": 6,
  "name": "藍光",
  "slug": "blue",
  "color": "rgb(9, 25, 232)",
}]
export interface lightsType {
  "value": number,
  "name": string,
  "slug": string,
  "color": string,
}

@Injectable()
export class LightsInfoProvider {

  constructor() {
    //console.log('Hello LightsInfoProvider Provider');
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
  
@Pipe({
  name: 'light',
  pure: false
})
export class lightsTypesPipe implements PipeTransform {
  constructor(private types:LightsInfoProvider){
  }
  transform(value, args) {
    let arr = li_types.map( data => data[args]);
    return arr[value];
  }
}
import { LightsInfoProvider } from '../../providers/lights-info/lights-info'

import { Injectable } from '@angular/core';
//import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NativeStorage } from '@ionic-native/native-storage';

const __defaultBgColorArr = Array.from(new Array(16) , () => 'rgb(0,0,0)' ) ; 
const __defaultDatasetArr = Array.from( new Array(16), ()=>0 ) ; 
//Array.from(new Array(16) , (val,idx) => (this.lightsColor[this.getRandomInt(0,5)]) )
//Array.from( new Array(16), ()=>(this.getRandomInt(0,100)) )
export interface lightsGroupsInfos {
  "gid": number,
  "name": string, // NAME
  "lastSended": string, // TIME
  "devicesTotal": number, //0
    "chartDatas": {
      "colors": 
        [{"backgroundColor": Array<string>}], // Array<number>   length = 16
      "datasets": 
        [{"data": Array<number> }] // [ {Array<number>} ]   length = 16
    }
}


@Injectable()
export class LightsGoupsProvider {
  infos: Observable<lightsGroupsInfos[]>;
  private _infos:BehaviorSubject<lightsGroupsInfos[]>;
  private baseUrl: string; 
  dataStore: {
    infos: lightsGroupsInfos[]
  };

  constructor(
    private lightsInfo:LightsInfoProvider,
    private storage:NativeStorage
  ) {
    this.baseUrl = '';// Strorage
    this.dataStore = { infos: [] };
    this._infos = <BehaviorSubject<lightsGroupsInfos[]>>new BehaviorSubject([]);
    this.infos = this._infos.asObservable();
  }
  loadAll() {
    let sub = Observable.fromPromise(this.storage.getItem('lightsGroupsInfosArr'));
    sub.subscribe(
      arr => {
        if(typeof arr != 'object') JSON.parse(arr);
        this.dataStore.infos = arr;
        this._infos.next(Object.assign({}, this.dataStore).infos);
      },
      err => {
        console.log('>>> Could not DO "loadAll()" ERR below <<<' );
        console.log(err);
      }
    );
  }
  selectGid(loadGid: number){
    let subTemp = Observable.create(
      observer =>{
        if(this.dataStore.infos){
          this.loadAll();
          this._infos.subscribe(
            arr => { observer.next(this.dataStore.infos.filter( obj => (obj.gid == loadGid) )); }
          )
        }else{
          observer.next(this.dataStore.infos.filter( obj => (obj.gid == loadGid) ));
        }
      }
    );
   return subTemp;
  }
  set(obj,trackFn){
    let sub = Observable.fromPromise(this.storage.setItem('lightsGroupsInfosArr',obj));
    sub.subscribe(
      res =>{trackFn(true,res)},
      err => {trackFn(false,err)}
    );
  }
  addNew(gid:number,name:string="無群組名",trackFn:Function) {

      this.dataStore.infos.unshift(
        {
          "gid": gid,
          "name": name, // NAME
          "lastSended": 'Command never sended', // TIME
          "devicesTotal": 0, //0
            "chartDatas": {
              "colors": 
                [{"backgroundColor": this.getRandomColorsArr() }], // Array<number>   length = 16 __defaultBgColorArr
              "datasets": 
                [{"data":  this.getRandomDatasetArr() }] // [ {Array<number>} ]   length = 16 __defaultDatasetArr
            }
        }
      );
      let sub = Observable.fromPromise(this.storage.setItem('lightsGroupsInfosArr',this.dataStore.infos));
      sub.subscribe(
        res =>{trackFn(true,res)},
        err => {trackFn(false,err)}
      );
  }
  lightsColor : any = this.lightsInfo.getTypes('color');
  getRandomDatasetArr(){
    return Array.from( new Array(16), ()=>(this.getRandomInt(0,100)) )
    
  }
  getRandomColorsArr(){
    return Array.from(new Array(16) , (val,idx) => (this.lightsColor[this.getRandomInt(0,5)]) )

  }
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


}
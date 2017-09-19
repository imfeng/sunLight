import { LightsInfoProvider } from '../../providers/lights-info/lights-info'
import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
//import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NativeStorage } from '@ionic-native/native-storage';
import { PatternsDataProvider } from '../patterns-data/patterns-data'
const __REF_BASE = 'lightsGroupsDataArr';


//const __defaultBgColorArr = Array.from(new Array(16) , () => 'rgb(0,0,0)' ) ; 
//const __defaultDatasetArr = Array.from( new Array(16), ()=>0 ) ; 
//Array.from(new Array(16) , (val,idx) => (this.lightsColor[this.getRandomInt(0,5)]) )
//Array.from( new Array(16), ()=>(this.getRandomInt(0,100)) )
export interface lightsGroupsData {
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
  infos: Observable<lightsGroupsData[]>;
  private _infos:BehaviorSubject<lightsGroupsData[]>;
  private baseUrl: string; 
  dataStore: {
    infos: lightsGroupsData[],
    groupsList: Array<object>
  };

  constructor(
    private platform: Platform,
    private PatternsDataProvider:PatternsDataProvider,
    private lightsInfo:LightsInfoProvider,
    private storage:NativeStorage
  ) {
    console.log('>>> LightsGoupsProvider constructor() !');
    this.baseUrl = '';// Strorage
    this.dataStore = { "infos": [], "groupsList":[] };
    this._infos = <BehaviorSubject<lightsGroupsData[]>>new BehaviorSubject([]);
    this.infos = this._infos.asObservable();
    this.platform.ready().then((readySource) => {
      this.loadAll();
      this.getGroups().subscribe(
        (arr)=>{
          this.dataStore.groupsList=arr;
        }
      );
    });
    

  }
  dedup(arr) {
    var hashTable = {};
  
    return arr.filter(function (el) {
      var key = JSON.stringify(el);
      var match = Boolean(hashTable[key]);
  
      return (match ? false : hashTable[key] = true);
    });
  }
  
  getGroups(){
    return Observable.create(
      observer => {
        this.infos.subscribe(
          arr => {
            let groupsList = arr.map(val=>({"id":val.gid,"name":val.name}));
            groupsList = this.dedup(groupsList);
            groupsList.push({'id':0,'name':'廣播'});
            console.log(groupsList);
            observer.next(groupsList);
            //observer.complete();
          }
        );
      }
    );

  }
  getList(){
    return this.dataStore.infos;
  }
  loadAll() {
    console.log('>>> LightsGoupsProvider.loadAll()');
    let sub = Observable.fromPromise(this.storage.getItem(__REF_BASE));
    sub.subscribe(
      arr => {
        if(typeof arr != 'object') JSON.parse(arr);
        this.dataStore.infos = arr;
        this._infos.next(Object.assign({}, this.dataStore).infos);
      },
      err => {
        if(err.code==2){
          console.log('>>> '+__REF_BASE + ' NULL!!!! ADDED array!');
          Observable.fromPromise(this.storage.setItem(__REF_BASE,[])).subscribe(
            arr=>{
              this.dataStore.infos = arr;
              this._infos.next(Object.assign({}, this.dataStore).infos);
            }
          );
        }else{
          console.log('>>> Could not DO "loadAll()" ERR below <<<' );
        }
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
    let sub = Observable.fromPromise(this.storage.setItem(__REF_BASE,obj));
    sub.subscribe(
      res =>{trackFn(true,res)},
      err => {trackFn(false,err)}
    );
  }
  addNew(gid:number,name:string="無群組名") {
    let tmpOb = Observable.create( observer => {
      
      
      // ADD *"lightsGroupsDataArr"*
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
      let sub = Observable.fromPromise(this.storage.setItem(__REF_BASE,this.dataStore.infos));
      // ADD *"patternsArr-_GID_"*
      let sub_2 =this.PatternsDataProvider.createNull(gid);
      sub.withLatestFrom( sub_2 ).subscribe(
        res =>{ this._infos.next(this.dataStore.infos); observer.next(true,res);observer.complete();},
        err =>{ observer.next(false,err);observer.complete();}
      );

    });
    return tmpOb;
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

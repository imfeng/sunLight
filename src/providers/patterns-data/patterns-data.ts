//import { LightsInfoProvider } from '../../providers/lights-info/lights-info'
//import { StorageMetaProvider } from '../../providers/storage-meta/storage-meta'
//import { SectionsDataProvider,sectioDataType } from '../../providers/sections-data/sections-data'

import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NativeStorage } from '@ionic-native/native-storage';

const __REF_BASE_PATTERNS = 'patternsArr-'; // 'patternsArr-_GID_'



//const __defaultBgColorArr = Array.from(new Array(16) , () => 'rgb(0,0,0)' ) ; 
//const __defaultDatasetArr = Array.from( new Array(16), ()=>0 ) ; 
//Array.from(new Array(16) , (val,idx) => (this.lightsColor[this.getRandomInt(0,5)]) )
//Array.from( new Array(16), ()=>(this.getRandomInt(0,100)) )
export interface PatternDataType {  // sql/"patternsArr-_GID_"
  "gid" : number,
  //"pid" : number,
  "p_name":string,
  "lastSendedTime" : number,
  "lastModified":number,
  "sections" : Array<any>,
  //"sectionsId" : number  // => sql/"sectionsArr-_sectionsId_"
}
export interface SectionDataType {  // sql/"sectionsArr-_sectionsId_"
  "mode": number, // 1~6
  "time": string, // 'hh:mm'
  "time_num":Array<number>, // [ hh,mm ]
  "multiple": number, //0~100
}



@Injectable()
export class PatternsDataProvider {
  
  infos: Observable<PatternDataType[]>;
  private _infos:BehaviorSubject<PatternDataType[]>;

  private dataStore: {
    infos: PatternDataType[]
  };

  constructor(
    //private meta:StorageMetaProvider,
    //private sectionsProvider: SectionsDataProvider,
    //private lightsInfo:LightsInfoProvider,
    private storage:NativeStorage
  ) {
    this._infos = <BehaviorSubject<PatternDataType[]>>new BehaviorSubject([]);
    this.infos = this._infos.asObservable();
    this.dataStore = {
      "infos":[]
    };
  }
  ionViewDidLoad(){
    
  }
  getPatternsList(){
    return this.dataStore.infos;
  }
  createNull(gid){
    let tempOb = Observable.create( observer => {
      let sub = Observable.fromPromise(this.storage.setItem(__REF_BASE_PATTERNS+gid,[]));
      sub.subscribe(
        arr => {
          observer.next(true);
          observer.complete();
        },
        err => {
          observer.next(false);
          observer.complete();
          /* DEBUG */
          console.log('>>> *PatternsDataProvider*.loadAll( '+gid+' ) : ' +err );
        }
      );
    });
    return tempOb;
  }
  loadAll(gid:number,times=1) {
    let tmpOb = Observable.create( observer=>{
      let sub = Observable.fromPromise(this.storage.getItem(__REF_BASE_PATTERNS+gid));
      sub.take(times).subscribe(
        arr => {
          if(typeof arr != 'object') JSON.parse(arr);
          console.log(this.dataStore);
          this.dataStore.infos = arr;
          this._infos.next(Object.assign({}, this.dataStore).infos);
          observer.next(true);
        },
        err => {
          /* DEBUG */
          observer.error(err);
          console.log('>>> *PatternsDataProvider*.loadAll( '+gid+' ) : ');
          console.log(err);
        }
      );
    });

    return tmpOb;
  }
  selectPattern(loadGid:number,loadPidx: number){
    let subTemp = Observable.create(
      observer =>{
        observer.next(this.dataStore.infos.filter( obj => (obj.gid==loadGid))[loadPidx]);
        observer.complete();
      }
    );
   return subTemp;
  }
  updateAll(setGid,obj,trackFn){
    let sub = Observable.fromPromise(this.storage.setItem(__REF_BASE_PATTERNS+setGid,obj));
    sub.subscribe(
      res =>{trackFn(true,res)},
      err => {trackFn(false,err)}
    );
  }
  addNewPattern(gid:number) {//,pid:number
    //this.loadAll(gid).subscribe();
    
    /* DEBUG */
    let sub = Observable.create(
      observer => {
        this.infos.take(1).subscribe(
          arr =>{
            arr.push({
              //"pid":pid,
              "gid" : gid,
              "sections":[],
              //"sectionsId":newSid,
              "p_name":"自訂排程",
              "lastSendedTime" : 0,
              "lastModified":0,
            });
            //let newSid = this.meta.sectionsMetaAdd();
            let tempSetOb = Observable.fromPromise(this.storage.setItem(__REF_BASE_PATTERNS+gid,arr));
            //this.sectionsProvider.createNew(newSid).withLatestFrom(sub).map( (arr)=> arr );
            tempSetOb.subscribe(
              scc => { this._infos.next(arr); observer.next(true,null)},
              err => observer.next(false,err)
            );
          },err => observer.next(false,err)
        )
      }
    );
    return sub;
  }

  updatePattern(pattern:PatternDataType,pidx:number,sended=false){
    /* DEBUG */
    let sub = Observable.create(
      observer => {
        this.infos.take(1).subscribe(
          arr => {
            if(sended)arr[pidx].lastSendedTime== new Date().getTime();
            arr[pidx] = pattern;
            arr[pidx].lastModified = new Date().getTime();
            console.log('save section @gid:'+arr[pidx].gid);
            let tempSetOb = Observable.fromPromise(this.storage.setItem(__REF_BASE_PATTERNS+pattern["gid"],arr));
            //this.sectionsProvider.createNew(newSid).withLatestFrom(sub).map( (arr)=> arr );
            tempSetOb.take(1).subscribe(
              scc => {
                observer.next(true,null);
                //this.loadAll(pattern["gid"]);
              },
              err => observer.next(false,err)
            );
          
          }
        )

      }
    );
    return sub;
  }


}

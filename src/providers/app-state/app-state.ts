import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NativeStorage } from '@ionic-native/native-storage';
const _STORAGE_APPSTATE_NAME = 'appstate';
const MODE_SCHE = 'sche';
const MODE_MANUAL = 'manual';
const SYNC = 'sync';
const meta = {
  'sche' : {
    name: '排程模式',
    slug: MODE_SCHE
  },
  'manual' : {
    name: '手動模式',
    slug: MODE_MANUAL
  },
}


export interface appStateType {
  "now_mode_name":string,
  "now_mode_slug":string,
  "isSync":boolean,
  "btnMessage":string
}

@Injectable()
export class AppStateProvider {
  info:Observable<appStateType>;
  private _info:BehaviorSubject<appStateType>;
  dataStore:{
    "appState": appStateType
  }

  constructor(
    private storage:NativeStorage
  ) {
    this._info = <BehaviorSubject<appStateType>>new BehaviorSubject({});
    this.info = this._info.asObservable();
    this.dataStore = {
      "appState": {
        "now_mode_name":'init...',
        "now_mode_slug":'init',
        "isSync":false,
        "btnMessage":'傳送指令(未同步)'
      }
    }
    this.broadcast(this.dataStore.appState);
    console.log('>>>> CollectionsDataProvider');
    this.loadAll();
  }
  action(action:{type:string,payload:any}){
    switch(action.type){
      case MODE_SCHE:
        this.stateModeSwitch(MODE_SCHE);
        this.dataStore.appState.btnMessage = '傳送指令(已同步)';
      break;
      case MODE_MANUAL:
        this.stateModeSwitch(MODE_MANUAL);
        this.dataStore.appState.btnMessage = '取消手動';
      break;
      case SYNC:
        this.dataStore.appState.isSync = action.payload;
        if(this.dataStore.appState.now_mode_slug == MODE_SCHE && !action.payload)
          this.dataStore.appState.btnMessage = '傳送指令(未同步)'
        else if(this.dataStore.appState.now_mode_slug == MODE_SCHE && action.payload)
          this.dataStore.appState.btnMessage = '傳送指令(已同步)'
        else {}
      break;
      default:
      break;
    }
    this.broadcast(this.dataStore.appState);
  }
  saveIng(){
    this.info.subscribe(
      state => {
        Observable
        .fromPromise(this.storage.setItem(_STORAGE_APPSTATE_NAME,state))
        .subscribe(
          (res)=>{}  
        );
      }
    );
  }

  loadAll(){
    Observable.fromPromise(this.storage.getItem(_STORAGE_APPSTATE_NAME)).subscribe(
      (obj)=>{
        if(typeof obj != 'object') JSON.parse(obj);
        this.broadcast(obj);
        this.saveIng();
      },
      (err)=>{
        if(err.code==2 || err.code.code==2){
          let temp = {
            "now_mode_name":'init...',
            "now_mode_slug":'init',
            "isSync":false,
            "btnMessage":'傳送指令(未同步)'
          }
          Observable.fromPromise(this.storage.setItem(_STORAGE_APPSTATE_NAME,temp))
            .take(1).subscribe();
          this.broadcast(temp);
          this.saveIng();
        }else{
          alert("錯誤" + JSON.stringify(err));
        }
      }
    );
  }


  broadcast(obj:appStateType){
    this.dataStore.appState = obj;
    this._info.next(Object.assign({}, this.dataStore).appState);
  }
  stateModeSwitch(mode){
    this.dataStore.appState.now_mode_name = meta[mode].name;
    this.dataStore.appState.now_mode_slug = meta[mode].slug;
    this.dataStore.appState.isSync = true;
    
  }


}

import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { NativeStorage } from '@ionic-native/native-storage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
const _STORAGE_DEVICES_NAME = "devicesList";
export interface lightDeviceType {
  "name":string,
  "o_name" :string,
  "id": string,
  "group":number,
  "last_sended": number
}
/*
  Generated class for the DevicesDataProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class DevicesDataProvider {
  list:Observable<lightDeviceType[]>;
  private _list:BehaviorSubject<lightDeviceType[]>;

  dataStore:{
    "device": lightDeviceType,
    "deviceList": Array<lightDeviceType>
  }
  constructor(
    private storage:NativeStorage) {
      this._list = <BehaviorSubject<lightDeviceType[]>>new BehaviorSubject([]);
      this.list = this._list.asObservable();

      console.log('>>>> DevicesDataProvider');
      this.loadAll();
    
  }
  loadAll(){
    Observable.fromPromise(this.storage.getItem(_STORAGE_DEVICES_NAME)).subscribe(
      (arr) =>{
        if(typeof arr != 'object') JSON.parse(arr);
        this.dataStore.deviceList = arr;
        this._list.next(this.dataStore.deviceList);
      },
      (error)=>{
        if(error.code.code=2){
          let temp = [{
            "name":"",
            "o_name" :"測試裝置1_o",
            "id": "11:22:33:44:55:66:77",
            "group":0,
            "last_sended": 0
          },{
            "name":"測試裝置2",
            "o_name" :"測試裝置2_o",
            "id": "22:44:66:88:AA:CC:FF",
            "group":2,
            "last_sended": 0
          }]
          Observable.fromPromise(this.storage.setItem(_STORAGE_DEVICES_NAME,temp)).subscribe();;
        }else{
          alert("錯誤" + JSON.stringify(error));
        }
      }
    );
  }
  add( dd:lightDeviceType ){
    this.dataStore.deviceList.push(dd);
    let sub = Observable.fromPromise(this.storage.setItem(_STORAGE_DEVICES_NAME,this.dataStore.deviceList));
    return sub;
  }
  modify(dd:lightDeviceType){
    console.log(this.dataStore.deviceList);
    this.dataStore.deviceList.forEach(
      (ele,idx) =>{
        if(ele.id == dd.id){
          this.dataStore.deviceList[idx].name = dd.name;
          this.dataStore.deviceList[idx].last_sended = dd.last_sended;
          let sub = Observable.fromPromise(this.storage.setItem(_STORAGE_DEVICES_NAME,this.dataStore.deviceList));
          sub.subscribe();
        }else{
          console.log(">>> DevicesDataProvider.modify() NOT FOUND device!");
        }
      }
    );
  }

}

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
  //"isGroupSync":boolean
  "last_sended": number
}
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
      this.dataStore = {
        "device": null,
        "deviceList": []
      }
      console.log('>>>> DevicesDataProvider');
      this.loadAll();
    
  }
  loadAll(){
    Observable.fromPromise(this.storage.getItem(_STORAGE_DEVICES_NAME)).subscribe(
      (arr) =>{
        if(typeof arr != 'object') JSON.parse(arr);
        this.dataStore.deviceList = arr;
        this._list.next(Object.assign({}, this.dataStore).deviceList);
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
  get(id:''){
    let tmpOb = Observable.create(
      observer => {
        this.list.subscribe(
          (list)=>{
            let finded = list.find(
              item => (item.id==id)
            );
            if(finded) observer.next(finded); else observer.error(false);
          }
        );
      }
    );
    return tmpOb;
  }
  check(device,toAdd=true){  //  bleCtrl use
    return Observable.create(
      observer => {
        this.list.subscribe(
          list =>{
            let finded = list.find(
              (val) =>{
                if(val.id==device.id)
                  return true;
                else
                  return false;
              }
            );
            if(!finded && toAdd){
              let newDevice = {
                "name": device.name,
                "o_name" :device.name,
                "id": device.id,
                "group":null,
                "last_sended": 0
              };
              this.add(newDevice);
              observer.next(newDevice);
            }else if(!finded && !toAdd){
              observer.next(device);
            }else observer.next(finded);
            observer.complete();
          }
        );
      }
    );

  }
  del(deviceId:string){
    // TODO
  }
  add( dd:lightDeviceType ){
    this.dataStore.deviceList.push(dd);
    let sub = Observable.fromPromise(this.storage.setItem(_STORAGE_DEVICES_NAME,this.dataStore.deviceList));
    sub.subscribe(
      (obj)=>{alert('ADD DEVICE!!');this._list.next(obj);}
    );
    //return sub;
  }
  modify(d_id,d_name,d_gid){
    console.log(this.dataStore.deviceList);
    let isNext = false;
    let tmpOb = Observable.create(
      observer => {
        this.dataStore.deviceList.forEach(
          (ele,idx) =>{
            if(ele.id == d_id){
              if(d_name)this.dataStore.deviceList[idx].name = d_name;
              if(d_gid)this.dataStore.deviceList[idx].group = d_gid;
              this.dataStore.deviceList[idx].last_sended = new Date().getDate();
              Observable
                .fromPromise(this.storage.setItem(_STORAGE_DEVICES_NAME,this.dataStore.deviceList))
                .subscribe(
                  (obj)=>{
                    this._list.next(obj);
                    observer.next(true);
                    observer.complete();
                    console.log('>>> modify成功!!');
                    //console.log(this.dataStore.deviceList);
                  },
                  ()=>{observer.error(false,'NO ITEM!');observer.complete();}
                );
              isNext =true;
            }else{
              if( !isNext && idx == this.dataStore.deviceList.length-1 ){
                console.log(">>> DevicesDataProvider.modify() NOT FOUND device!");
                observer.error(false,'NOT FOUND device!');
                observer.complete();
              }
            }
          }
        );
      }
    );
    return tmpOb;
  }
}

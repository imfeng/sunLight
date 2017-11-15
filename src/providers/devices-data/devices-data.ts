import { Injectable,PipeTransform,Pipe } from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { NativeStorage } from '@ionic-native/native-storage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
//import { BleCommandProvider } from '../ble-command/ble-command';

const _STORAGE_DEVICES_NAME = "devicesList";
export interface lightDeviceType {
  "name":string,
  "o_name" :string,
  "id": string,
  "group":number,
  //"isGroupSync":boolean
  "last_sended": number,
  "hadGroupSync":boolean,
  "collection": Array<number>, // 1~6 to A~F
  "fanSpeed":number,
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
    //private bleCmd: BleCommandProvider,
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
        if(error.code.code==2){
          let temp : Array<lightDeviceType> = [{
            "name":"",
            "o_name" :"測試裝置1_o",
            "id": "11:22:33:44:55:66:77",
            "group":1,
            "last_sended": 0,
            "collection": [],
            "hadGroupSync":false,
            "fanSpeed":60,
          },{
            "name":"測試裝置2",
            "o_name" :"測試裝置2_o",
            "id": "22:44:66:88:AA:CC:FF",
            "group":2,
            "last_sended": 0,
            "collection": [],
            "hadGroupSync":false,
            "fanSpeed":60,
          },{
            "name":"測試裝置3",
            "o_name" :"測試裝置3_o",
            "id": "33:44:66:88:AA:CC:FF",
            "group":3,
            "last_sended": 0,
            "collection": [],
            "hadGroupSync":false,
            "fanSpeed":60,
          },{
            "name":"測試裝置4",
            "o_name" :"測試裝置4_o",
            "id": "44:44:66:88:AA:CC:FF",
            "group":4,
            "last_sended": 0,
            "collection": [],
            "hadGroupSync":false,
            "fanSpeed":60,
          }]
          Observable.fromPromise(this.storage.setItem(_STORAGE_DEVICES_NAME,temp)).subscribe();
          this.dataStore.deviceList = temp;
          this._list.next(Object.assign({}, this.dataStore).deviceList);
        }else if(error.code==2){
          let temp = [];
          Observable.fromPromise(this.storage.setItem(_STORAGE_DEVICES_NAME,temp)).subscribe();
          this.dataStore.deviceList = temp;
          this._list.next(Object.assign({}, this.dataStore).deviceList);
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
            if(finded) observer.next(finded);
            else observer.error(false);
            observer.complete();
          }
        );
      }
    );
    return tmpOb;
  }
  check(device,toAdd=true){  //  bleCtrl use
    return Observable.create(
      observer => {
        if(device.name!='Sunlight'){
          observer.error(false);
          observer.complete();
        }else{
          this.list.take(1).subscribe(
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
                  "group":this.dataStore.deviceList.length+1,
                  "hadGroupSync":false,
                  "last_sended": 0,
                  "collection": [],
                  "fanSpeed":60,
                };
                this.add(newDevice).subscribe(
                  isAdd => {
                    //this.bleCmd.goSetGroup();
                    observer.next({"device":newDevice , "isNew":true});
                    observer.complete();
                  }
                );
              }else if(!finded && !toAdd){
                let tmpDevice = {
                  "name": device.name,
                  "o_name" :device.name,
                  "id": device.id,
                  "group":null,
                  "hadGroupSync":false,
                  "last_sended": 0,
                  "collection": [],
                };
                observer.next({"device":tmpDevice , "isNew":false});
                observer.complete();
              }else {
                observer.next({"device":finded , "isNew":false});
                observer.complete();
              }
              
            }
          );                                                                  
        }
        
      }
    );

  }
  del(deviceId:string){
    return Observable.create(
      observer => {

        let tmp = this.dataStore.deviceList.filter(
          v => v.id !== deviceId
        );
        let sub = Observable.fromPromise(this.storage.setItem(_STORAGE_DEVICES_NAME,tmp));
        sub.subscribe(
          (obj)=>{
            alert('裝置刪除成功！');
            
            this.dataStore.deviceList=obj;
            this._list.next(Object.assign({}, this.dataStore).deviceList);
            //this.bleCmd.goSetGroup( this.dataStore.deviceList.length );

            observer.next(true);
            observer.complete();
          },
          err => {
            alert('發生錯誤！');
            observer.next(true);
            observer.complete();
          }
        );
      }
    );
  }
  add( dd:lightDeviceType ){
    return Observable.create(
      observer => {
        this.dataStore.deviceList.push(dd);
        let sub = Observable.fromPromise(this.storage.setItem(_STORAGE_DEVICES_NAME,this.dataStore.deviceList));
        sub.subscribe(
          (obj)=>{
            alert('裝置新增成功！');
            
            this.dataStore.deviceList=obj;
            this._list.next(Object.assign({}, this.dataStore).deviceList);
            //this.bleCmd.goSetGroup( this.dataStore.deviceList.length );

            observer.next(true);
            observer.complete();
          }
        );
      }
    );
    
    //return sub;
  }
  modifyFanSpeed(fanSpeed:number,idxs:Array<number>){
    return Observable.create(
      observer => {
        this.list.take(1).subscribe(
          list => {
            idxs.map(
              idx => {
                list[idx].fanSpeed = fanSpeed;
              });
            Observable
              .fromPromise(this.storage.setItem(_STORAGE_DEVICES_NAME,list))
              .subscribe(
                (obj)=>{
                  //this.dataStore.deviceList = obj;
                  //this._list.next(Object.assign({}, this.dataStore).deviceList);
                  console.log('>>> modifyFanSpeed成功!!');
                  observer.next(true);
                  observer.complete();
                },
                ()=>{observer.error(false);observer.complete();}
              );
          }
        );
        
      }
    )
  }
  modify(d_id:string,d_name:string,d_gid:number,hadGroupSync:boolean=false,collection:Array<number>=null){
    console.log('>>> Device "'+ d_id + '" modifying!');
    let isNext = false;
    let tmpOb = Observable.create(
      observer => {
        this.dataStore.deviceList.forEach(
          (ele,idx) =>{
            if(ele.id == d_id){
              if(collection){
                this.dataStore.deviceList[idx].collection = collection;}
              if(d_name){this.dataStore.deviceList[idx].name = d_name;}
              if(d_gid){
                this.dataStore.deviceList[idx].group = d_gid;
                this.dataStore.deviceList[idx].hadGroupSync = hadGroupSync;
              }      
              if(hadGroupSync)
              {
                this.dataStore.deviceList[idx].hadGroupSync = hadGroupSync;
                this.dataStore.deviceList[idx].last_sended = new Date().getDate();
              };
              console.log('DEBUG');
              console.log(this.dataStore.deviceList[idx]);
              Observable
                .fromPromise(this.storage.setItem(_STORAGE_DEVICES_NAME,this.dataStore.deviceList))
                .subscribe(
                  (obj)=>{
                    this.dataStore.deviceList = obj;
                    this._list.next(Object.assign({}, this.dataStore).deviceList);
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
@Pipe({
  name: 'devicesString',
  pure: false
})
export class devicesToStringPipe implements PipeTransform {
  constructor(private dProv:DevicesDataProvider){
  }
  transform(value:Array<number>, args) {
    return Observable.create(
      observer => {
        this.dProv.list.subscribe(
          dList => {
            let resualt = dList
              .filter(h=>value.indexOf(h.group)>=0)
              .map(v=>(v.name+'-'+v.group));
            observer.next(
              (resualt.length<1)?['空']:resualt
            );
            //dListFindSameInGids(dList,value).map(v=>(v.name+'-'+v.group))
          }
        );
      }
    );
  }
}
/*
function dListFindSameInGids(haystack:Array<lightDeviceType>, arr:Array<any>) {
  return haystack.filter(
    h=> arr.indexOf(h.group)>=0
  )
};*/
import { Injectable } from '@angular/core';

import { BleCtrlProvider } from '../ble-ctrl/ble-ctrl'
import { DevicesDataProvider } from '../devices-data/devices-data'
import { SectionDataType } from '../../providers/patterns-data/patterns-data';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

const _START = 0xFA;
const _END = 0xFF;
/** */
const _CMD_TIME = 0xA0;  // s,cmd, HOUR,MIN,SEC ,e
const _CMD_SET_GROUP = 0xA1;// s,cmd, GROUP, ,e
const _CMD_MANUAL_MODE = 0xAA;// s,cmd, MULTIPLE,TYPE,GROUP ,e

const _CMD_SCHEDULE_MODE = 0xAB;// s,cmd, MULTIPLE,TYPE,GROUP,HOUR,MIN,KEY ,e

const _CMD_DEV_MODE = 0xAC; // s,cmd, MULTIPLE,GROUP, L1~L12, e
const _CMD_FAN_SPEED = 0xAD; // s,cmd, fan, e

/*
  Generated class for the BleCommandProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class BleCommandProvider {
  //devicesList:any;//lightDeviceType[]
  constructor(
    private devicesData: DevicesDataProvider,
    public bleCtrl: BleCtrlProvider) {
    //this.devicesList = this.devicesData.list;
    console.log('Hello BleCommandProvider Provider');
  }
  goSyncTime(){
    let time = new Date();
    let data = new Uint8Array([_START,_CMD_TIME,time.getHours(),time.getMinutes(),time.getSeconds(),_END]);
    this.bleCtrl.write(data,()=>{},()=>{},true);
  }
  goSetGroupOther(gid,deviceId){
    gid = parseInt(gid);
    let data = new Uint8Array([_START,_CMD_SET_GROUP,gid,_END]);

    return Observable.create(
      observer => {
        gid = parseInt(gid);
        let data = new Uint8Array([_START,_CMD_SET_GROUP,gid,_END]);
        this.bleCtrl.forceWriteOnce(data,deviceId).subscribe(
          isScc=>{
            if(isScc){
              this.devicesData.modify(deviceId,null,gid,true).subscribe();
              alert('修改群組成功！');
            }else{
              this.devicesData.modify(deviceId,null,gid,false).subscribe();
              alert('無法連接至裝置，但仍會在APP顯示方才所更改的群組值');
            }
          }
        );
      }
    );
  }
  goSetGroup(gid){
    return Observable.create(
      observer => {
        gid = parseInt(gid);
        let data = new Uint8Array([_START,_CMD_SET_GROUP,gid,_END]);
        this.bleCtrl.write(data,
          (id)=>{
            this.devicesData.modify(id,null,gid,true).subscribe();
            observer.next(true);observer.complete();
          },
          (id)=>{
            this.devicesData.modify(id,null,gid,false).subscribe();
            observer.next(false);observer.complete();
          },true
        );
      }
    );


    /*this.bleCtrl.write(data).subscribe(
      (id)=>{
        this.devicesData.modify(id,null,gid);
        alert('修改群組成功！');
      },
      (id)=>{ //失敗仍然修改 devicesData"的群組值
        this.devicesData.modify(id,null,gid);
        alert('修改該裝置群組失敗，但仍會在APP顯示方才所更改的群組值');
      }
    );*/
  }
  goManual(multi,type,gid){
    let data = new Uint8Array([_START,_CMD_MANUAL_MODE,multi,type,gid,_END]);
    this.bleCtrl.write_d(data).subscribe();
  }
  goManualMulti(multi,type,gidList:Array<any>){
    let cmds= gidList.map(gid=>new Uint8Array([_START,_CMD_MANUAL_MODE,multi,type,gid,_END]));

    this.bleCtrl.write_many(cmds,150).subscribe();
  }
  goSchedule(sectionsList:SectionDataType[],gid){
    //let time = new Date();
    //let timeArr = new Uint8Array([_START,_CMD_TIME,time.getHours(),time.getMinutes(),time.getSeconds(),_END]);
    //let data = new Uint8Array([_START,_CMD_SCHEDULE_MODE,0,0,gid,0,0,0xAA,_END]);
    //data = this._appendBuffer(timeArr,data);
    let cmds =[];
    let data = new Uint8Array([]);
    let cursor = 1;
    sectionsList.forEach(val => {
      cmds.push(
        new Uint8Array([
          _START,
          _CMD_SCHEDULE_MODE,
          val.multiple,
          val.mode,
          gid,
          val.time_num[0],
          val.time_num[1],
          cursor++,
          _END])
      );
    });/*
    for(let i=cursor;i<=30;i++){
      cmds.push(
        new Uint8Array([
          _START,
          _CMD_SCHEDULE_MODE,
          0,
          0,
          gid,
          0,
          0,
          i,
          _END])
      );
    }*/

    /*sectionsList.forEach(val => {
      data = this._appendBuffer(data,new Uint8Array([
        _START,
        _CMD_SCHEDULE_MODE,
        val.multiple,
        val.mode,
        gid,
        val.time_num[0],
        val.time_num[1],
        cursor++,
        _END])
      );
    });*/

    return this.bleCtrl.write_many(cmds);
     
    //this.bleCtrl.write(data);
  }
  private _appendBuffer (buffer1, buffer2) {
    let tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp;
  };
  goDev(multi,gid,arr){
    let data = new Uint8Array([_START,_CMD_DEV_MODE,multi,gid, ...arr ,_END]);
    //this.bleCtrl.write(data);
    this.bleCtrl.write_d(data).subscribe();
  }
  goFan(speed){
    let data = new Uint8Array([_START,_CMD_FAN_SPEED,speed ,_END]);
    this.bleCtrl.write(data);;
    
  }



}

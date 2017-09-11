import { Injectable } from '@angular/core';

import { BleCtrlProvider } from '../ble-ctrl/ble-ctrl'

import 'rxjs/add/operator/map';
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

  constructor(
    public bleCtrl: BleCtrlProvider) {
    console.log('Hello BleCommandProvider Provider');
  }
  goSyncTime(){
    let time = new Date();
    let data = new Uint8Array([_START,_CMD_TIME,time.getHours(),time.getMinutes(),time.getSeconds(),_END]);
    this.bleCtrl.write(data);
  }
  goSetGroup(group){
    let data = new Uint8Array([_START,_CMD_SET_GROUP,group,_END]);
    this.bleCtrl.write(data);
  }
  goManual(multi,type,group){
    let data = new Uint8Array([_START,_CMD_MANUAL_MODE,multi,type,group,_END]);
    this.bleCtrl.write(data);
  }
  goSchedule(arr){

  }
  goDev(multi,group,arr){
    let data = new Uint8Array([_START,_CMD_DEV_MODE,multi,group, ...arr ,_END]);
    this.bleCtrl.write(data);
  }
  goFan(speed){
    let data = new Uint8Array([_START,_CMD_FAN_SPEED,speed ,_END]);
    this.bleCtrl.write(data);
  }



}

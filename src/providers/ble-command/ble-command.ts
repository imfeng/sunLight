import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';

import { BleCtrlProvider } from '../ble-ctrl/ble-ctrl'
import { DevicesDataProvider } from '../devices-data/devices-data'
import { SectionDataType } from '../../providers/patterns-data/patterns-data';

import { ScheduleDataProvider,scheduleType } from '../../providers/schedule-data/schedule-data'
import { CollectionsDataProvider } from '../../providers/collections-data/collections-data'
/*
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/withLatestFrom';
import { Observable } from 'rxjs/Observable';*/
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
    private ScheduleProv: ScheduleDataProvider,
    private clProv: CollectionsDataProvider,
    private devicesData: DevicesDataProvider,
    public bleCtrl: BleCtrlProvider) {
    //this.devicesList = this.devicesData.list;
    console.log('Hello BleCommandProvider Provider');
  }
  goSyncSchedule(){
    let sendCmds = [];

    this.ScheduleProcessGo().subscribe(
      allCmds => {
        console.log(allCmds);
        allCmds.map(
          device => {
            sendCmds.push(
              new Uint8Array([
                _START,
                _CMD_SCHEDULE_MODE,
                0,
                0,
                device.gid,
                0,
                0,
                0xaa,
                _END])
            );
            /*scheduleCheckNow*/
            let nowHour = new Date().getHours();
            let detectNow = {
              "multiple":0,
              "mode":0,
              "time_num":[0,0]
            }
            /** */
            device.sections.map(
              (section,idx)=>{
                if(nowHour>=section.time_num[0]){
                  detectNow.multiple = section.multiple;
                  detectNow.mode = section.mode;
                  detectNow.time_num = section.time_num;
                  console.log('nowHour');
                }
                sendCmds.push(
                  new Uint8Array([
                    _START,
                    _CMD_SCHEDULE_MODE,
                    section.multiple,
                    section.mode,
                    device.gid,
                    section.time_num[0],
                    section.time_num[1],
                    idx,
                    _END])
                );
              }
            );
            //[_START,_CMD_MANUAL_MODE,multi,type,gid,_END
            sendCmds.push(
              new Uint8Array([
                _START,
                _CMD_MANUAL_MODE,
                detectNow.multiple,
                detectNow.mode,
                device.gid,
                _END])
            );
          }
        );
        console.log(sendCmds);
        this.ScheduleProv.saveSyncSchedule(sendCmds);
        this.bleCtrl.write_many(sendCmds).subscribe(
          (isOkList)=>{
            if(isOkList.find( val=>val==false )){
              alert('傳送排程過程中發生問題，請重新傳送QQ');
            }else{}
          }
        );
      }
    );
  }
  scheduleCheckNow(){
    let time = new Date();
  }
  ScheduleProcessGo(){
    return Observable.create(
      observer =>{
        this.ScheduleProcess1().subscribe(
          clId_sections => {
            this.ScheduleProcess2(clId_sections).subscribe(
              allCmds => {
                observer.next(allCmds);
                observer.complete();
              }
            );
          }
        );
      }
    );
  }
  ScheduleProcess1(){
    /**
     *  schedules -> **clList**, sections -> **clId**,sections
     */
    return Observable.create(
      observer => {
        let tmp_clId_sections = [ [],[],[],[],[],[] ];

        this.ScheduleProv.list.take(1).subscribe(
          schedules => {
            schedules.map(//   **clId** (key),  sections (merge)
              sche => {
                sche.checks.map(    
                  (sv,sidx)=>{
                    if(sv){ tmp_clId_sections[sidx]=tmp_clId_sections[sidx].concat(sche.sectionsList) }
                  }
                );
              }
            );
          }
        );
        observer.next(tmp_clId_sections);
        observer.complete();
      }
    );
  }
  ScheduleProcess2(clId_sections){
    return Observable.create(
      observer => {
        let allCmds = [];
        this.clProv.list.take(1).subscribe(
          clList => {
            
              clList.map(
                (cl,cidx) => {
                  cl.devices.map(
                    gid=>{
                      allCmds.push({
                        "gid":gid,
                        "sections":clId_sections[cidx]});
                    }
                  )
                }
              );
            
          }
        );
        observer.next(allCmds);
        observer.complete();
      }
    );

  }
  goSyncTime(){
    let time = new Date();
    let data = new Uint8Array([_START,_CMD_TIME,time.getHours(),time.getMinutes(),time.getSeconds(),_END]);
    this.bleCtrl.write(data,()=>{},()=>{},true);
  }
  goSetGroupOther(gid,deviceId){
    gid = parseInt(gid);
    let data = new Uint8Array([_START,_CMD_SET_GROUP,gid,_END]);
    this.bleCtrl.connectOnce(deviceId).subscribe(
      isScc=>{
        if(isScc){
          this.bleCtrl.write(data,
            (id)=>{
              this.devicesData.modify(id,null,gid).subscribe();
              alert('修改"編號"成功！');
            },
            (id)=>{
              this.devicesData.modify(id,null,gid).subscribe();
              alert('成功連接但傳送時失敗，但仍會在APP顯示方才所更改的"編號"值');
            },true,deviceId
          );
        }else{
          this.devicesData.modify(deviceId,null,gid).subscribe();
          alert('修改該裝置"編號"失敗(找不到裝置)，但仍會在APP顯示方才所更改的"編號"值');
        }
      }
    );
  }
  goSetGroup(gid){
    gid = parseInt(gid);
    let data = new Uint8Array([_START,_CMD_SET_GROUP,gid,_END]);
    this.bleCtrl.write(data,
      (id)=>{
        this.devicesData.modify(id,null,gid).subscribe();
        alert('修改"編號"成功！');
      },
      (id)=>{
        this.devicesData.modify(id,null,gid).subscribe();
        alert('成功連接但傳送時失敗，但仍會在APP顯示方才所更改的"編號"值');
      },true
    );

    /*this.bleCtrl.write(data).subscribe(
      (id)=>{
        this.devicesData.modify(id,null,gid);
        alert('修改"編號"成功！');
      },
      (id)=>{ //失敗仍然修改 devicesData"的"編號"值
        this.devicesData.modify(id,null,gid);
        alert('修改該裝置"編號"失敗，但仍會在APP顯示方才所更改的"編號"值');
      }
    );*/
  }
  disableManaul(){
    this.ScheduleProv.getSyncSchedule().subscribe(
      cmds => {
        this.bleCtrl.write_many(cmds).subscribe(
          (isOkList)=>{
            if(isOkList.find( val=>val==false )){
              alert('傳送排程過程中發生問題，請重新傳送QQ');
            }else{}
          }
        );
      }
    );
  }
  goManualMode(multi,type,gid){
    let cmds = 
      [
        new Uint8Array([_START,_CMD_SCHEDULE_MODE,0,0,gid,0,0,0xaa,_END]),
        new Uint8Array([_START,_CMD_MANUAL_MODE,multi,type,gid,_END])
      ];
    this.bleCtrl.write_many(cmds).subscribe(
      (isOkList)=>{
        if(isOkList.find( val=>val==false )){
          alert('傳送排程過程中發生問題，請重新傳送QQ');
        }else{}
      }
    );

  }
  goManual(multi,type,gid){
    let data = new Uint8Array([_START,_CMD_MANUAL_MODE,multi,type,gid,_END]);
    this.bleCtrl.write(data);
  }
  goSchedule(sectionsList:SectionDataType[],gid){
    //let time = new Date();
    //let timeArr = new Uint8Array([_START,_CMD_TIME,time.getHours(),time.getMinutes(),time.getSeconds(),_END]);
    //let data = new Uint8Array([_START,_CMD_SCHEDULE_MODE,0,0,gid,0,0,0xAA,_END]);
    //data = this._appendBuffer(timeArr,data);
    let cmds =[];
    let data = new Uint8Array([]);
    let cursor = 1;
    let lastVal = {
      multiple:0,
      mode:0,
      time_num:[]
    }
    sectionsList.forEach(val => {
      lastVal = val;
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
    });
    for(let i=cursor;i<=30;i++){
      cmds.push(
        new Uint8Array([
          _START,
          _CMD_SCHEDULE_MODE,
          lastVal.multiple,
          lastVal.mode,
          gid,
          lastVal.time_num[0],
          lastVal.time_num[1],
          i,
          _END])
      );
    }

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
    this.bleCtrl.write(data);;
  }
  goFan(speed){
    let data = new Uint8Array([_START,_CMD_FAN_SPEED,speed ,_END]);
    this.bleCtrl.write(data);;
  }



}

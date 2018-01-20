import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';

import { BleCtrlProvider } from '../ble-ctrl/ble-ctrl'
import { DevicesDataProvider } from '../devices-data/devices-data'


import { ScheduleDataProvider,scheduleType } from '../../providers/schedule-data/schedule-data'
import { CollectionsDataProvider } from '../../providers/collections-data/collections-data'
import { AppStateProvider } from  '../../providers/app-state/app-state';
import { ToastCtrlProvider } from  '../../providers/toast-ctrl/toast-ctrl';

const _START = 0xFA;
const _END = 0xFF;
/* */
const _CMD_TIME = 0xA0;  // s,cmd, HOUR,MIN,SEC ,e
const _CMD_SET_GROUP = 0xA1;// s,cmd, GROUP, ,e
const _CMD_MANUAL_MODE = 0xAA;// s,cmd, MULTIPLE,TYPE,GROUP ,e
const _CMD_SCHEDULE_MODE = 0xAB;// s,cmd, MULTIPLE,TYPE,GROUP,HOUR,MIN,KEY ,e
const _CMD_DISABLE_EYECEHCK = 0xAE;
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
    private toastCtrl:ToastCtrlProvider,
    private appStateProv: AppStateProvider,
    private ScheduleProv: ScheduleDataProvider,
    private clProv: CollectionsDataProvider,
    private devicesData: DevicesDataProvider,
    public bleCtrl: BleCtrlProvider) {
    //this.devicesList = this.devicesData.list;
    console.log('Hello BleCommandProvider Provider');
  }
  goSyncSchedule(){
    return Observable.create(
      observer => {
        let sendCmds = [];
        /* 清除所有群組內的排程 -> 寫入排程 -> 將目前光譜設定為當下排程的光譜  */
        let deviceRmScheduleList = [];
        let deviceScheduleList =[];
        let deviceSetCurrent = [];


        /** deviceRmScheduleList END */

        /*scheduleCheckNow*/
        let nowHour = new Date().getHours();

        /** */
        this.ScheduleProcess1().subscribe(
          deNor => {
            /** deviceRmScheduleList START
             *  清除所有群組內的排程
             * */
            this.devicesData.list.subscribe(
              dList => {
                dList.map(
                  dd => {
                    deviceRmScheduleList.push(
                      new Uint8Array([
                        _START,
                        _CMD_SCHEDULE_MODE,
                        0,
                        0,
                        dd.group,
                        0,
                        0,
                        0xaa,
                        _END])
                    );
                  }
                );
              }
            );
            /** deviceRmScheduleList END */

            // 排程模式指令 START
            console.log(deNor);
            for(let key in deNor){
              let detectNow = {
                "multiple":0,
                "mode":0,
                "time_num":[0,0]
              }

                let end = [];
                let list = deNor[key];
                list.map((v,idx) => {
                  let cnt = 1;

                  if(!list[idx+cnt]) return 0;
                  while(
                    (v.multiple === 0 && list[idx+cnt].multiple===0) ||
                    (v.multiple === list[idx+cnt].multiple && v.mode === list[idx+cnt].mode)
                  ) {
                    cnt++;
                    if(!list[idx+cnt]) {break;};
                	}

                  if(v.multiple ===0) {
                    end.push({
                      ...v,
                      end: v.hour + cnt-1,
                      mode: 0,
                    });
                  }else {
                    end.push({
                      ...v,
                      end: v.hour + cnt-1,
                    });
                  }

                  list.splice(idx, cnt-1);
                });


              deviceScheduleList = deviceScheduleList.concat(
                end.map((ss,sid) => {
                    if(nowHour>=ss.time_num[0]){
                      detectNow.multiple = ss.multiple;
                      detectNow.mode = ss.mode;
                      detectNow.time_num = ss.time_num;
                      console.log('nowHour');
                    }

                    return (new Uint8Array([
                        _START,
                        _CMD_SCHEDULE_MODE,
                        ss.multiple,
                        ss.mode,
                        key,
                        ss.time_num[0],
                        ss.time_num[1],
                        sid+1,
                        _END]) );
                  })
              );
              //[_START,_CMD_MANUAL_MODE,multi,type,gid,_END

              // 利用手動模式，讓裝置符合排程當下的模式
              deviceSetCurrent.push(
                new Uint8Array([
                  _START,
                  _CMD_MANUAL_MODE,
                  detectNow.multiple,
                  detectNow.mode,
                  parseInt(key),
                  _END])
              );
            }/*
            Object.keys(deNor).map(
              (key,idx) => {
              }
            );*/
            /*
            console.log('deviceScheduleList');
            console.log(deviceScheduleList);
            console.log('deviceSetCurrent');
            console.log(deviceSetCurrent);*/
            /*
                1 devices To N colletions 複雜啊！
                先刪除重複 -> 排序
            */
            /** deviceScheduleList SORT */
            /*deviceScheduleList.filter(
              (a,b) => {
                return 1;
              }
            );*/
            /** deviceSetCurrent SORT */

            observer.next({
              rmSchedule: deviceRmScheduleList,
              allSchedule: deviceScheduleList,
              currentSchedule: deviceSetCurrent,
            });
            observer.complete();
            /*
            sendCmds = sendCmds.concat(deviceRmScheduleList)
                                .concat(deviceScheduleList)
                                .concat(deviceSetCurrent);
            console.log('====SEND CMDS====');
            console.log(sendCmds);*/
            // sendCmds = sendCmds.concat(sendCmds);  // DOUBLE CMDS
            //this.ScheduleProv.saveSyncSchedule(sendCmds);  // 暫時不會用到

            /* 2018 eye
            this.bleCtrl.write_many(sendCmds,sendCmds.length*0.4, true).subscribe(
              (isOk)=>{
                this.appStateProv.action({type:'sche',payload:true});
                observer.next(isOk);observer.complete();
              }
            );*/

          }
        );
      }
    );
  }/*
  scheduleCheckDup(deNor, key, len, CurrentID = 0, noDup = true, isC =false, Cnum = 0,) {
    let dupIDs = [];
    if(CurrentID + 2 < len) {
      Cnum = (isC)?Cnum+1:0;
      return
        (deNor[key][CurrentID].multiple == deNor[key][CurrentID+1].multiple)?
          ( deNor[key][CurrentID].mode == deNor[key][CurrentID+1].mode )?
            this.scheduleCheckDup(deNor, key, len, CurrentID+1, n);
          : (true)
        : (true);
    }else {
      return {
        noDup: noDup,
        dupIDs: dupIDs,
      };
    }

    for(let key in deNor){
      let len = deNor[key].length;
        deNor[key].filter( (ss,sid) => {
          if ( sid + 2 < len) {
            ( ss.multiple == deNor[key][sid+1].multiple )?
              ( ss.mode == deNor[key][sid+1].mode )?
                  ( ss.multiple == deNor[key][sid+2].multiple )?
                    ( ss.mode == deNor[key][sid+2].mode )?

                    : (true)
                  : (true)
              : (true)
            : (true);
          }
        });
    }
  }*/
  scheduleCheckNow(){
    let time = new Date();
  }
  ScheduleProcessGo(){
    return Observable.create(
      observer =>{
        this.ScheduleProcess1().subscribe(
          deNor => {

          }
        );
      }
    );
  }
  collectionsToDeviceGid(checks:Array<boolean>){
    return Observable.create(
      observer => {
        this.clProv.list.take(1).subscribe(
          clList => {
            let allDevices:Array<number> = []; // [groupIds]
            clList.map(
              (cl,idx) => {
                if(checks[idx]){
                  allDevices = allDevices.concat(cl.devices);
                }
              }
            );
            allDevices = allDevices.filter(
              (ele,idx,self) => {
                return idx == self.indexOf(ele);
              }
            );
            console.log('>>> collectionsToDeviceGid');
            console.log(allDevices);
            observer.next(allDevices);
            observer.complete();
          }
        );
      }
    );
  }
  ScheduleProcess1(){
    return Observable.create(
      observer => {
        let deNormalization = {};

        this.ScheduleProv.list
        .take(1).subscribe(
          ssList=>{
            ssList.map(ss=>{
              this.collectionsToDeviceGid(ss.checks).take(1).subscribe(allDevices => {
                  allDevices.forEach(element => {
                    if(deNormalization[element])
                      deNormalization[element] = deNormalization[element].concat(ss.sectionsList);
                    else {
                      deNormalization[element] = [];
                      deNormalization[element] = deNormalization[element].concat(ss.sectionsList);
                    }
                  });
              });
            });
            console.log('>>> ScheduleProcess1 > deNormalization');
            console.log(deNormalization);

            observer.next(deNormalization);
            observer.complete();
          }
        );


      }
    );
  }
  goTimeChangeMulti(gids: Array<number>, hms: string) {
    return Observable.create(observer => {
      let timeArr = hms.split(':').map(v=>parseInt(v));
      if (gids.length>0) {
        let cmds = gids.map(gid=>new Uint8Array([_START,_CMD_TIME,timeArr[0],timeArr[1],timeArr[2],gid,_END]));
        cmds.concat(cmds);
        this.bleCtrl.write_many(cmds, null, true).subscribe(
          (isOk)=>{
            observer.next(isOk);
            observer.complete();
          }
        );
      }else{
        this.toastCtrl.showToast('無裝置！');
        observer.next(false);
        observer.complete();
      }
    });
  }
  goTimeChange(hms:string){
    return Observable.create(observer => {
      let timeArr = hms.split(':').map(v=>parseInt(v));
      let cmds = [new Uint8Array([_START,_CMD_TIME,timeArr[0],timeArr[1],timeArr[2],_END])];
      this.bleCtrl.write_many(cmds, null, true).subscribe(isOk=>{
        observer.next(isOk);
        observer.complete();
      });
    });
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
  }
  /** MANAUL MODE */
  disableManaul(){
    this.ScheduleProv.getSyncSchedule().subscribe(
      cmds => {
        this.bleCtrl.write_many(cmds).subscribe();
      }
    );
  }
  goManualModeMulti(multi,type,gids){
    return Observable.create(
      observer => {
        if(gids.length>0){

          /*let rm_cmds =
            gids.map( gid => new Uint8Array([_START,_CMD_SCHEDULE_MODE,0,0,gid,0,0,0xaa,_END]) );*/
          let ma_cmds =
            gids.map( gid => new Uint8Array([_START,_CMD_MANUAL_MODE,multi,type,gid,_END]) );

          let sendCmds = [].concat(ma_cmds); // .concat(rm_cmds)
          // sendCmds = sendCmds.concat(sendCmds);  //DOUBLE CMDS

          this.bleCtrl.write_many(sendCmds,sendCmds.length*0.2).subscribe(
            (isOk)=>{
              this.appStateProv.action({type:'manual',payload:true});
              observer.next(isOk);
              observer.complete();
            }
          );
        }else{
          this.toastCtrl.showToast('無裝置！');
          observer.next(false);
          observer.complete();
        }
      }
    );


  }
  goManualMode(multi,type,gid){
    let cmds =
      [
        new Uint8Array([_START,_CMD_SCHEDULE_MODE,0,0,gid,0,0,0xaa,_END]),
        new Uint8Array([_START,_CMD_MANUAL_MODE,multi,type,gid,_END])
      ];
    this.bleCtrl.write_many(cmds).subscribe();

  }
  /** */
  goManual(multi,type,gid){
    let data = new Uint8Array([_START,_CMD_MANUAL_MODE,multi,type,gid,_END]);
    this.bleCtrl.write(data);
  }
  private _appendBuffer (buffer1, buffer2) {
    let tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp;
  };
  goDevCollectionsMultiple(multi,checks,arr){
    return Observable.create(
      observer => {
        this.collectionsToDeviceGid(checks).take(1).subscribe(
          gids => {
            let cmds = gids.map(
              gid=>new Uint8Array([_START,_CMD_DEV_MODE,multi,gid, ...arr ,_END])
            );
            this.bleCtrl.write_many(cmds,cmds.length*0.5).subscribe(
              (isOk)=>{
                observer.next(isOk);observer.complete();
              }
            );
          }
        )
      }
    );
  }
  goDevMultiple(multi,gids,arr){
    return Observable.create(
      observer => {
        if (gids.length>0) {
          let cmds = gids.map(gid=>new Uint8Array([_START,_CMD_DEV_MODE,multi,gid, ...arr ,_END]));
          this.bleCtrl.write_many(cmds).subscribe(
            (isOk)=>{
              observer.next(isOk);
              observer.complete();
            }
          );
        }else{
          observer.next(true);
          observer.complete();
        }

      }
    );
  }
  goFanMultipleEye(gids:Array<number>,speed) {
    return Observable.create(
      observer => {
        if (gids.length>0) {
          let cmds = gids.map(gid=>new Uint8Array([_START,_CMD_FAN_SPEED,speed,gid,_END]));
          cmds.concat(cmds);
          observer.next(cmds);
        }else{
          this.toastCtrl.showToast('無裝置！');
          observer.next(false);
          observer.complete();
        }

      }
    );
  }
  goFanMultiple(gids:Array<number>,speed){
    return Observable.create(
      observer => {
        if (gids.length>0) {
          let cmds = gids.map(gid=>new Uint8Array([_START,_CMD_FAN_SPEED,speed,gid,_END]));
          cmds.concat(cmds);
          this.bleCtrl.write_many(cmds, null, true).subscribe(
            (isOk)=>{
              observer.next(isOk);
              observer.complete();
            }
          );
        }else{
          this.toastCtrl.showToast('無裝置！');
          observer.next(false);
          observer.complete();
        }

      }
    );
  }

  /// eyeSchedule(multiple=0, light=0, gid, hour, min, key) {
  eyeSchedule(cmd:Uint8Array) {
    // let data = new Uint8Array([_START,_CMD_SCHEDULE_MODE,multiple,light,gid,hour,min,key,_END]);
    this.bleCtrl.writeObs(cmd).subscribe(()=>{},()=>{});
  }
  eyeTime(times:Array<number>, gid:number){
    let data = new Uint8Array([_START,_CMD_TIME,times[0],times[1],times[2],gid,_END]);
    this.bleCtrl.writeObs(data).subscribe(()=>{},()=>{});
  }
  eyeFan(speed:number, gid:number) {
    let data = new Uint8Array([_START,_CMD_FAN_SPEED,speed,gid,_END]);
    this.bleCtrl.writeObs(data).subscribe(()=>{},()=>{});
  }
  eyeSetGroup(gid) {
    let data = new Uint8Array([_START,_CMD_SET_GROUP,gid,_END]);
    this.bleCtrl.writeObs(data).subscribe(
      (scc)=>{
        this.devicesData.modify(scc,null,gid).subscribe();
        this.toastCtrl.showToast('修改裝置編號成功！');
      },
      (err)=>{
        this.bleCtrl.disconnectCurrent().subscribe();
        this.toastCtrl.showToast('傳送失敗，請重新連結！');
      }
    );
  }
  eyeDisable() {
    let data = new Uint8Array([_START,_CMD_DISABLE_EYECEHCK,0x01,_END]);
    this.bleCtrl.writeObs(data).subscribe(()=>{},()=>{});
  }




  // 目檢功能
  /**
時間校正A0
定義群組 A1
設定排程AB
風扇轉速調整 AD
以上指令下達後，裝置接收正確會改成綠燈
使用者要在手動下達關閉指示燈AE指令
   *//*
  eyeCheck() {
    return Observable.create(observer => {

    });

  }*/

  /** */
}

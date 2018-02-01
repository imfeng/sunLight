
import { Injectable } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { EyeCheckPage } from './eye-check'
import { nowStatus,BleCtrlProvider } from '../../providers/ble-ctrl/ble-ctrl';
import { DevicesDataProvider,lightDeviceType } from '../../providers/devices-data/devices-data'
import { ToastCtrlProvider } from  '../../providers/toast-ctrl/toast-ctrl';
import { ActionNameEnum, ActionType } from './eye-check';
const _DEFAULT_MESSAGE
   = ['亮綠燈表這顆燈有接收到正確的指令',
    '若沒亮綠燈重複請按開啟綠燈按鈕',
    '綠燈亮後 3 秒會自動關閉'];
@Injectable()
export class EyeCheckControl {
  constructor(
    private toastCtrl:ToastCtrlProvider,
    private devicesData:DevicesDataProvider,
    private bleCtrl:BleCtrlProvider,
    public modalCtrl: ModalController,
  ) {

  }
  o() {
    let actions = [{
      type: ActionNameEnum.SCHEDULE_ALL,
          payload: {
            message:['寫除排程必須先清空裝置內所有排程紀錄才能寫入新的排程',..._DEFAULT_MESSAGE,],
            gid: 8,
            cmd: new Uint8Array([250,171,30,6,99,23,59,1,255]),
          }
    },{
      type: ActionNameEnum.SCHEDULE_REMOVE,
          payload: {
            message:['寫除排程必須先清空裝置內所有排程紀錄才能寫入新的排程',..._DEFAULT_MESSAGE,],
            gid: 8,
            cmd: new Uint8Array([250,171,30,6,99,23,59,0xaa,255]),
          }
    }, {
      type: ActionNameEnum.FIRST_ADD_GROUP,
      payload: {
        message:['發現新裝置時，會同步裝置的編號，為了確認裝置正確接收，此時會做目檢確認',
                '亮綠燈表這顆燈有接收到正確的指令',
                '若沒亮綠燈重複請按開啟綠燈按鈕',
                '綠燈亮後 3 秒會自動關閉'],
        macAddress: '12:34:56:67:67:34',
        groupID: 99,
      }
    }, {
      type: ActionNameEnum.TIME,
      payload: {
        message:['第一次加入裝置後，須作時間校正以同步裝置內部時間，確保排程能按時執行',
                '亮綠燈表這顆燈有接收到正確的指令',
                '若沒亮綠燈重複請按開啟綠燈按鈕',
                '綠燈亮後 3 秒會自動關閉'],
        cmd: null,
        gid: 2
      }
    }, {
      type: ActionNameEnum.FANSPEED,
      payload: {
        message:['風扇預設轉速為50%，如不需調整請按下一步',
                '風扇可調範圍為40% ~ 100%，可拉bar或按藍色方框調整，調整完成後請按傳送',
                '注意！風速越強，雖晶粒溫度較低（LED壽命越長），但聲音較大。',
                '按下確認後，確認裝置有亮綠燈即可進行下一步'],
        cmd: null,
        gid: 10,
      }
    }];
    this.open2(actions);
  }
  open(type: ActionNameEnum,cmds: Array<Uint8Array>) {
    let profileModal
     = this.modalCtrl
       .create(EyeCheckPage, { action: { type: type, cmds: cmds } },{
        showBackdrop: true,
        enableBackdropDismiss: false,
        cssClass: 'my-popup',
       });
    profileModal.present();
  }
  open2(actions:Array<ActionType>, scheduleListIdx = null) {
    if(actions.length<1) {
      this.toastCtrl.showToast('無排程指令需要寫入');
      return null;
    }else {
      let eyeModal
      = this.modalCtrl
        .create(EyeCheckPage, { actions: actions, scheduleListIdx: scheduleListIdx},{
         showBackdrop: true,
         enableBackdropDismiss: false,
         cssClass: 'my-popup',
        });
      eyeModal.present();

      return eyeModal;
    }
  }

  pConnectDevice(deviceId: string) {
    this.bleCtrl
    .connectDeviceObs(deviceId)
    .subscribe(p => {
      this.devicesData.check(p,true)
      .subscribe(checkData => {
        this.bleCtrl._change('device', checkData.device);
        if(checkData.isNew) {
          let actions = [{
            type: ActionNameEnum.FIRST_ADD_GROUP,
            payload: {
              message:['發現新裝置時，會同步裝置的編號，為了確認裝置正確接收，此時會做目檢確認',
                      ..._DEFAULT_MESSAGE],
              groupID: checkData.device.group,
              macAddress: checkData.device.id
            }
          }, {
            type: ActionNameEnum.TIME,
            payload: {
              message:['第一次加入裝置後，須作時間校正以同步裝置內部時間，確保排程能按時執行',
                      ..._DEFAULT_MESSAGE],
              gid: checkData.device.group,
            }
          }, {
            type: ActionNameEnum.FANSPEED,
            payload: {
              message:['風扇預設轉速為50%，如不需調整請按下一步',
                      '風扇可調範圍為40% ~ 100%，可拉bar或按藍色方框調整，調整完成後請按傳送',
                      '注意！風速越強，雖晶粒溫度較低（LED壽命越長），但聲音較大。',
                      '按下確認後，確認裝置有亮綠燈即可進行下一步'],
              gid: checkData.device.group,
            }
          }];
          this.open2(actions);
        }else {
        }
      });
    },()=>{});

  }
  pSetAllTime() {
    this.devicesData.list.take(1).subscribe(list => {
      let actions = list.map(v=>({
        type: ActionNameEnum.TIME,
          payload: {
            message:_DEFAULT_MESSAGE,
            gid: v.group,
          }
      }));
      this.open2(actions);
    });
  }
  pSetMultipleFan(gids:Array<number>, speed:number, idxs: Array<number>) {
    let actions = gids.map( gid => ({
      type: ActionNameEnum.FANSPEED,
          payload: {
            message:_DEFAULT_MESSAGE,
            gid: gid,
            fanSpeed: speed,
          }
    }));
    let modal = this.open2(actions);
    modal.onDidDismiss(data => {
      /*console.log(data);
      if(data) {
        this.devicesData.modifyFanSpeed(speed,idxs).subscribe();
      }*/
    });
  }
  pSetMultipleTime(gids:Array<number>, time:string) {
    let actions = gids.map( gid => ({
      type: ActionNameEnum.TIME,
          payload: {
            message:_DEFAULT_MESSAGE,
            gid: gid,
            time: time,
          }
    }));
    this.open2(actions);
  }
  pScheduleRemove(gids, idx) {
    let actions = gids.map( gid => ({
      type: ActionNameEnum.SCHEDULE_REMOVE_LIST,
          payload: {
            message:['刪除排程組合後必須清除裡面所有裝置的排程設定',..._DEFAULT_MESSAGE,],
            gid: gid,
          }
    }));
    this.open2(actions, idx);
  }
  pScheduleCurrent(list){
    let actions3 = list.currentSchedule.map( cmd => ({
      type: ActionNameEnum.SCHEDULE_CURRENT,
          payload: {
            message:_DEFAULT_MESSAGE,
            gid: cmd[4],
            cmd: cmd,
          }
    }));
    this.open2(actions3);
  }
  pSchedule(list) {
    let actions1 = list.rmSchedule.map( cmd => ({
      type: ActionNameEnum.SCHEDULE_REMOVE,
          payload: {
            message:['寫除排程必須先清空裝置內所有排程紀錄才能寫入新的排程',..._DEFAULT_MESSAGE,],
            gid: cmd[4],
            cmd: cmd,
          }
    }));
    let actions2 = list.allSchedule.map( item => ({
      type: ActionNameEnum.SCHEDULE_ALL,
          payload: {
            message:_DEFAULT_MESSAGE,
            gid: item.cmd[4],
            cmd: item.cmd,
            scheduleEnd: item.end,
          }
    }));
    let actions3 = list.currentSchedule.map( cmd => ({
      type: ActionNameEnum.SCHEDULE_CURRENT,
          payload: {
            message:_DEFAULT_MESSAGE,
            gid: cmd[4],
            cmd: cmd,
          }
    }));
    this.open2([...actions1,...actions2,...actions3,],list.scheduleListIdx);
  }
  pDisableSchedule(gids:Array<number>, idx:number, toggle = true) {
    let m = (toggle)?'收到指令後，此燈將會依照所設定的排程設定作動。':'收到指令後，此燈將不會再依照排程設定作動。';
    let actions = gids.map( gid => ({
      type: ActionNameEnum.SCHEDULE_DISABLE,
          payload: {
            message:[m, ..._DEFAULT_MESSAGE],
            gid: gid,
            toggleSchedule:toggle
          }
    }));
    this.open2(actions, idx);
  }

}

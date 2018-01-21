import { Component, Injectable } from '@angular/core';
import {
  IonicPage, NavController, NavParams, ViewController, ModalController,
  AlertController,
} from 'ionic-angular';
import { BleCommandProvider } from '../../providers/ble-command/ble-command';
import { BleCtrlProvider } from '../../providers/ble-ctrl/ble-ctrl';
import { Action } from 'rxjs/scheduler/Action';
import { ToastCtrlProvider } from  '../../providers/toast-ctrl/toast-ctrl';
import { lightsTypesPipe } from  '../../providers/lights-info/lights-info';
import { ScheduleDataProvider } from './../../providers/schedule-data/schedule-data';

export enum ActionNameEnum {
  NONE = 'NONE',
  FIRST_ADD_GROUP = 'FIRST_ADD_GROUP',
  TIME = 'TIME',
  FANSPEED = 'FANSPEED',
  SCHEDULE_REMOVE = 'SCHEDULE_REMOVE',
  SCHEDULE_ALL = 'SCHEDULE_ALL',
  SCHEDULE_CURRENT = 'SCHEDULE_CURRENT',
  SCHEDULE_DISABLE = 'SCHEDULE_DISABLE',
  SCHEDULE_REMOVE_LIST = 'SCHEDULE_REMOVE_LIST',
}
export interface ActionType {
  // type: ActionName;
  type: ActionNameEnum,
  payload: {
    message:Array<string>;
    cmd?: Uint8Array,

    macAddress?: string,
    gid?: number,
    groupID?: number,
    toggleSchedule?: boolean,
    scheduleEnd?: number,

    time?:string,
    fanSpeed?: number,  // '
  };
}
/*export enum ActionName {
   NONE = '',
   ADD_DEVICE = 'ADD_DEVICE',
   CLTNS_FAN = 'CLTNS_FAN',
   CLTNS_TIME = 'CLTNS_TIME',
   SCHEDULE = 'SCHEDULE',
}*/
@IonicPage()
@Component({
  selector: 'page-eye-check',
  templateUrl: 'eye-check.html',
  providers: [
    lightsTypesPipe,
  ]
})
export class EyeCheckPage {
  isSending: boolean = false;
  _state: {
    currentIdx: number,
    actionsLength: number,
    currentAction: ActionType,
    hadSended: boolean,
    finalMessages: Array<string>,
  } = {
    currentIdx: 0,
    actionsLength: 0,
    currentAction: null,
    hadSended: false,
    finalMessages: [],
  }
  uiControl= {
    name: true,
    timeWidget: false,
    fanWidget: false,
    groupInfo: false,
    scheduleRmInfo: false,
    scheduleAllInfo: false,
    scheduleCurrentInfo: false,
    scheduleDisableInfo: false,
  }
  fanWidgettValue = 40;
  timeWidgetValue = '00:00:00';
  actions: Array<ActionType> = [];
  constructor(
    private scheduleProv:ScheduleDataProvider,
    public scheData: ScheduleDataProvider,
    public L:lightsTypesPipe,
    private bleCmd: BleCommandProvider,
    private toastCtrl:ToastCtrlProvider,
    private alertCtrl: AlertController,
    public bleCtrl: BleCtrlProvider,
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    console.log('>>> constructor EyeCheckPage');
  }
  dismiss() {
    let idx = this.navParams.get('scheduleListIdx');
    if(typeof idx === 'number') {
      switch(this.actions[0].type) {
        case ActionNameEnum.SCHEDULE_DISABLE:
          this.scheData.modifyInScheduleMode(this.actions[0].payload.toggleSchedule, idx).subscribe(()=>{});;
          break;
        case ActionNameEnum.SCHEDULE_REMOVE_LIST:
        this.scheduleProv.remove(idx);
          break;
        default:
          this.scheData.sendedSchedule(idx).subscribe(()=>{});
          break;
      }

    }
    this.viewCtrl.dismiss();
  }
  ionViewDidLoad() {
    console.log('>>> ionViewDidLoad EyeCheckPage');
    if(!this.navParams.get('actions')) {
      alert('錯誤！');
    }else {
      this.actions = this.navParams.get('actions');
      console.log(this.actions);

      this._state.actionsLength = this.actions.length;
      if(this._state.actionsLength<1) {
        alert('無動作');
        this.dismiss();
        return;
      }
      this._state.finalMessages = [];
      this.processAction(0);

    }


  }

  processAction(idx: number) {
    Object.assign(this.uiControl, {
      name: true,
      timeWidget: false,
      fanWidget: false,
      groupInfo: false,
      scheduleAllInfo: false,
      scheduleRmInfo: false,
      scheduleCurrentInfo: false,
      scheduleDisableInfo: false,
    });
    this._state.currentIdx = idx;
    if(this._state.currentIdx>this._state.actionsLength-1) {
      this._state.currentAction = null;
      return;
    }
    this._state.currentAction = this.actions[idx];
    console.log(this._state.currentAction);

    switch(this._state.currentAction.type) {
      case ActionNameEnum.FIRST_ADD_GROUP:
        this.uiControl.name = false;
        this.uiControl.groupInfo = true;
        break;
      case ActionNameEnum.TIME:
        this.timeWidgetNow(this._state.currentAction.payload.time);
        this.uiControl.timeWidget = true;
        break;
      case ActionNameEnum.FANSPEED:
        if(this._state.currentAction.payload.fanSpeed) {
          this.fanWidgettValue = this._state.currentAction.payload.fanSpeed;
        }else {
          this.fanWidgettValue = 50;
        }

        this.uiControl.fanWidget = true;
        break;
      case ActionNameEnum.SCHEDULE_REMOVE:
        this.uiControl.scheduleRmInfo = true;
        break
      case ActionNameEnum.SCHEDULE_ALL:
        this.uiControl.scheduleAllInfo = true;
        break
      case ActionNameEnum.SCHEDULE_CURRENT:
        this.uiControl.scheduleCurrentInfo = true;
        break
      case ActionNameEnum.SCHEDULE_DISABLE:
        this.uiControl.scheduleDisableInfo = true;
        break
      case ActionNameEnum.SCHEDULE_REMOVE_LIST:
        this.uiControl.scheduleRmInfo = true;
        break
      default:

        break;
    }
    console.log(this.uiControl);
  }

  trigger() {
    console.log(this._state.currentIdx);
    console.log(this._state.currentAction);
    this._state.hadSended = true;
    let gid = this._state.currentAction.payload.gid;
    switch(this._state.currentAction.type) {
      case ActionNameEnum.NONE:
        break;
      case ActionNameEnum.FIRST_ADD_GROUP:
        this.bleCmd.eyeSetGroup(this._state.currentAction.payload.groupID);
        this._state.finalMessages.push(`${this._state.currentAction.payload.macAddress} 設置編號： ${this._state.currentAction.payload.groupID}`);
        break;
      case ActionNameEnum.TIME:
        console.log(this.timeWidgetValue);
        this.bleCmd.eyeTime(
          this.timeWidgetValue.split(':').map(v=>parseInt(v)),
          gid
        );
        this._state.finalMessages.push(`Sunlight-${gid} 設置時間： ${this.timeWidgetValue}`);
        break;
      case ActionNameEnum.FANSPEED:
        console.log(this.fanWidgettValue);
        this.bleCmd.eyeFan(this.fanWidgettValue, gid);
        this._state.finalMessages.push(`Sunlight-${gid} 設置風速： ${this.fanWidgettValue}%`);
        break;
      case ActionNameEnum.SCHEDULE_REMOVE:
        this.bleCmd.eyeSchedule(this._state.currentAction.payload.cmd);
        this._state.finalMessages.push(`Sunlight-${gid} 清除排程`);
        break;
      case ActionNameEnum.SCHEDULE_ALL:
        this.bleCmd.eyeSchedule(this._state.currentAction.payload.cmd);
        this._state.finalMessages.push(
          `Sunlight-${gid} 設置排程： ${this._dateFormat(this._state.currentAction.payload.cmd[5])}:00`+
          ((this._state.currentAction.payload.scheduleEnd)?('~'+this._dateFormat(this._state.currentAction.payload.scheduleEnd)+':00'):'') +
          `, 亮度${this._state.currentAction.payload.cmd[2]}, ${this.L.transform(this._state.currentAction.payload.cmd[3],'name')}`
        );
        break;
      case ActionNameEnum.SCHEDULE_CURRENT:
        this.bleCmd.eyeSchedule(this._state.currentAction.payload.cmd);
        this._state.finalMessages.push(`Sunlight-${gid} 目前排程： 亮度${this._state.currentAction.payload.cmd[2]}, ${this.L.transform(this._state.currentAction.payload.cmd[3],'name')}`);
        break;
      case ActionNameEnum.SCHEDULE_DISABLE:
        this.bleCmd.eyeDisableSchedule(gid, this._state.currentAction.payload.toggleSchedule);
        this._state.finalMessages.push(`Sunlight-${gid} ${(this._state.currentAction.payload.toggleSchedule)?'開啟':'關閉'}排程排程作動`);
        break
      case ActionNameEnum.SCHEDULE_REMOVE_LIST:
        this.bleCmd.eyeRmAllSchedule(gid);
        this._state.finalMessages.push(`Sunlight-${gid} 清除排程`);
        break
      default:
      break;
    }
    // this.bleCtrl.write(this.action.cmds[this._state.currentIdx]);
  }
  last() {
    if(this._state.currentIdx === 0) {
    }else{
      this._state.hadSended = false;
      this.processAction(this._state.currentIdx-1);
    }
  }
  next() {
    if(this._state.currentIdx === this._state.actionsLength) {
    }else{
      this._state.hadSended = false;
      this.bleCmd.eyeDisable();
      this.processAction(this._state.currentIdx+1);
    }
  }

  timeWidgetNow(defaultTime: string = null) {
    if(defaultTime) {
      this.timeWidgetValue = defaultTime;
    }else {
      let dd= new Date();
      this.timeWidgetValue =
        `${this._dateFormat(dd.getHours())}:${this._dateFormat(dd.getMinutes())}:${this._dateFormat(dd.getSeconds())}`;
    }
  }

  opneFanPrompt(){
    let prompt = this.alertCtrl.create({
      title: '風速',
      message: "輸入所需要的風速數值",
      inputs: [{
        name: 'fanSpeed',
        placeholder: '40~100'
      }],
      buttons: [{
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        }, {
          text: 'Save',
          handler: data => {
            let speed = parseInt(data['fanSpeed']) || 1;
            console.log(speed);
            if(speed<40 || speed>100){
              this.toastCtrl.showToast('錯誤！請輸入40~100數值！');
            }else{
              this.fanWidgettValue = speed;
            }
          }
      }]
    });
    prompt.present();
  }
  _dateFormat(num:number){
    return (num<10)?`0${num}`:`${num}`;
  }
}



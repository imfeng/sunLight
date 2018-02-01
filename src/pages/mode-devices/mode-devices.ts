import { Component, ViewChild } from '@angular/core';
import { Platform, AlertController,ModalController,IonicPage, NavController, NavParams, Toggle } from 'ionic-angular';
import { BleOperatorPage } from '../ble-operator/ble-operator';
import { DevicesDataProvider,lightDeviceType } from '../../providers/devices-data/devices-data';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import { BleCtrlProvider } from '../../providers/ble-ctrl/ble-ctrl';
import { BleCommandProvider } from '../../providers/ble-command/ble-command';
import { ToastCtrlProvider } from  '../../providers/toast-ctrl/toast-ctrl';

import { EyeCheckControl } from '../eye-check/eye-check.control';

@IonicPage()
@Component({
  selector: 'page-mode-devices',
  templateUrl: 'mode-devices.html',
})
export class ModeDevicesPage {

  nowDeviceId: string = '';
  timeCtrl = {
    isTimeCheckbox: false,
    time: '',
  }
  fanCtrl = {
    isFanCheckbox: false,
    currentFanSpeed: 40,
    checks:[]
  }


  devices_list:Observable<lightDeviceType[]>;
  wtfDevices:{
    "list":Array<lightDeviceType>
  }
  constructor(
    public eyeCheckCtrl: EyeCheckControl,
    public platform: Platform,
    private bleCtrl:BleCtrlProvider,
    private toastCtrl:ToastCtrlProvider,
    private alertCtrl: AlertController,
    private bleCmd: BleCommandProvider,
    private devicesProv:DevicesDataProvider,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
      this.bleCtrl.nowStatus.subscribe(state => {
        this.nowDeviceId = state.device.id;
      });
      this.devices_list = this.devicesProv.list;
      this.wtfDevices = {
        "list":[]
      };
      this.devices_list.subscribe(
        list => {
          this.fanCtrl.checks = Array.from(new Array(list.length), ()=>false);
          if(list.length>=6) {
            this.wtfDevices.list = list;
          }else {
            let tmp:Array<lightDeviceType> = Array.from({length: (list.length<=6)?(6-list.length):0},
            (v, i) => ({
              "name":'bulb'+(list.length+i+1),
              "o_name" :'bulb'+(list.length+i+1),
              "id": '空',
              "group":0,
              //"isGroupSync":boolean
              "last_sended": null,
              "hadGroupSync":null,
              "collection": [],
              "fanSpeed":null,
              })
            );
            //console.log(tmp);
            this.wtfDevices.list = tmp;
          }

        }
      );

  }
  _dateFormat(num:number){
    if(num<10){
      return `0${num}`
    }else{
      return `${num}`
    }
  }
  selectAll() {
    this.fanCtrl.checks.map((v,i) => {this.fanCtrl.checks[i]=true});
  }
  toggleTimeCheckbox(){
    this.fanCtrl.checks.map((v,idx) => {
      this.fanCtrl.checks[idx] = false;
    })
    let dd = new Date();

    this.timeCtrl.time =
    `${this._dateFormat(dd.getHours())}:${this._dateFormat(dd.getMinutes())}:${this._dateFormat(dd.getSeconds())}`;
    console.log(this.timeCtrl.time);
    this.timeCtrl.isTimeCheckbox = !this.timeCtrl.isTimeCheckbox;
    this.fanCtrl.isFanCheckbox = false;
  }
  timeTrigger(){
    console.log(this.timeCtrl.time);
    // this.bleCmd.goTimeChange(this.timeCtrl.time).subscribe();

    this.devices_list.take(1).subscribe(
      list => {
        let idxs = [];
        let gids = list.filter(
          (v,idx) => {
            if(this.fanCtrl.checks[idx]) {idxs.push(idx); return true; }
            else return false}
        ).map( (v)=>v.group );
        this.eyeCheckCtrl.pSetMultipleTime(gids, this.timeCtrl.time);
        /*this.bleCmd.goTimeChangeMulti(gids, this.timeCtrl.time).subscribe(isOk => {
          if(!isOk) alert('傳送時間校正過程中發生問題，請重新傳送。');
        });*/
      }
    );
  }
  timeChange(){
    //this.timeCtrl.time =new Date().toISOString();
    console.log( this.timeCtrl.time);
  }
  opneFanPrompt(){
      let prompt = this.alertCtrl.create({
        title: '風速',
        message: "輸入所需要的風速數值",
        inputs: [
          {
            name: 'fanSpeed',
            placeholder: '40~100'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Save',
            handler: data => {
              let speed = parseInt(data['fanSpeed']) || 1;
              console.log(speed);
              if(speed<40 || speed>100){
                this.toastCtrl.showToast('錯誤！請輸入40~100數值！');
              }else{
                this.fanCtrl.currentFanSpeed = speed;
                this.triggerFan();
                console.log('Saved clicked');
              }

            }
          }
        ]
      });
      prompt.present();
  }
  timeModify(){

  }
  triggerFan(){
    //console.log('triggerFan');
    //console.log(this.fanCtrl.checks);
    this.devices_list.take(1).subscribe(
      list => {
        let idxs = [];
        let gids = list.filter(
          (v,idx) => {
            if(this.fanCtrl.checks[idx]) {idxs.push(idx); return true; }
            else return false}
        ).map( (v)=>v.group );
        this.eyeCheckCtrl.pSetMultipleFan(gids, this.fanCtrl.currentFanSpeed, idxs);
        /*this.bleCmd
        .goFanMultipleEye(gids,this.fanCtrl.currentFanSpeed)
        .subscribe();*/
        /*this.bleCmd.goFanMultiple(gids,this.fanCtrl.currentFanSpeed).subscribe(
          isOk => {
            if(!isOk) alert('傳送排程過程中發生問題，請重新傳送QQ');
            else this.devicesProv.modifyFanSpeed(this.fanCtrl.currentFanSpeed,idxs).subscribe();
          }
        );*/
      }
    );
  }
  toggleFanCheckbox(){
    this.fanCtrl.checks.map((v,idx) => {
      this.fanCtrl.checks[idx] = false;
    })
    this.fanCtrl.isFanCheckbox = !this.fanCtrl.isFanCheckbox;
    this.timeCtrl.isTimeCheckbox = false;
  }
  editDevice(id:string){
    this.fanCtrl.isFanCheckbox = false;
    this.navCtrl.push(editDevicePage, { "id":id });
  }
  openBleModal(){
    this.navCtrl.push(BleOperatorPage);
   /* let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();*/
  }
  fastConnect(id: string) {  // TODO 要先搜尋才能連
    console.log(id);
    this.bleCtrl.fastConnect(id).subscribe(()=>{});
  }

  nowBluetoothEnable = false;
  @ViewChild('toggleble') ionToggle: Toggle;
  ionViewDidLoad() {
    console.log('ionViewDidLoad ModeDevicesPage');
    this.platform.ready().then(ready=>{
      this.bleCtrl.nowStatus.take(1).subscribe(state => {
        if(state["isEnabled"]){
          this.nowBluetoothEnable = true;
          this.ionToggle.checked = true;
        }else{
          alert('請開啟藍芽才能正常運作唷～');
          this.nowBluetoothEnable = false;
          this.ionToggle.checked = false;
        }
      });
    });
  }
  enableBle() {
    this.bleCtrl.enableBle().subscribe(
      ()=>{
        this.nowBluetoothEnable = true;
        this.ionToggle.checked = true;
      },
      ()=>{
        alert('請開啟權限');
        this.nowBluetoothEnable = false;
        this.ionToggle.checked = false;
      }
    );
  }
}

@Component({
  templateUrl: 'edit-device.html'
})
export class editDevicePage {

  deviceInfo :{"data":lightDeviceType}={
    "data":{
      "name":'',
      "o_name" :'',
      "id": '',
      "group":0,
      "last_sended": 0,
      "hadGroupSync":false,
      "collection":[],
      "fanSpeed":null,
    }
  };
  constructor(
    private bleCmd: BleCommandProvider,
    private devicesProv:DevicesDataProvider,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
  ){
    console.log(navParams);
    devicesProv.get(navParams.data["id"]).subscribe(
      (obj) => {
        this.deviceInfo.data = obj;
      },
      () => {
        alert('無此Device ID！');
      }
    );

  }

  delDevice(){
    this.devicesProv.del(this.deviceInfo.data.id).subscribe(
      isOk => {
        if(isOk) this.navCtrl.pop();
      }
    );
  }

  editName(){
    let alert = this.alertCtrl.create({
      title: '更改名稱',
      inputs: [
        {
          name: 'd_name',
          placeholder: '請輸入裝置名稱...'
        }
      ],
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '確定',
          handler: data => {
            this.deviceInfo.data.name = data.d_name;
            this.changeName();
          }
        }
      ]
    });
    alert.present();
  }
  editGroup(deviceId){
    let alert = this.alertCtrl.create({
      title: '調整編號',
      message: '數值"0"為無編號，如果裝置不在附近時，將無法正確地更改，但在此APP中會仍會顯示您更改的編號，建議使用右上角的「藍芽連結頁面」修改！',
      inputs: [
        {
          name: 'gid',
          type: 'number',
          placeholder: '請輸入編號1~255'
        }
      ],
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '修改',
          handler: data => {
            let gid = parseInt(data.gid);
            this.bleCmd.goSetGroupOther(gid,this.deviceInfo.data.id);

            console.log('傳送');
          }
        }
      ]
    });
    alert.present();
  }
  changeName(){
    console.log('changeName');
    this.devicesProv.modify(this.deviceInfo.data.id,this.deviceInfo.data.name,null).subscribe(
      ()=>{
        let alert = this.alertCtrl.create({
          title: '成功',
          message: '儲存成功！',
        });
      },
      (err,message)=>{
        let alert = this.alertCtrl.create({
          title: '錯誤！',
          message: JSON.stringify(err) +', ' +JSON.stringify(message),
        });
      }
    );
  }

}

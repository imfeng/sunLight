import { NgZone, ViewChild, Component } from '@angular/core';
import { Toggle, AlertController, Content, Refresher,NavController, Platform, IonicPage, NavParams,ViewController } from 'ionic-angular';
//import { BLE } from '@ionic-native/ble';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { DevicesDataProvider,lightDeviceType } from '../../providers/devices-data/devices-data';
import { nowStatus,BleCtrlProvider } from '../../providers/ble-ctrl/ble-ctrl';
import { BleCommandProvider } from '../../providers/ble-command/ble-command';
import { EyeCheckControl } from '../eye-check/eye-check.control';
import { ToastCtrlProvider } from  '../../providers/toast-ctrl/toast-ctrl';

@IonicPage()
@Component({
  selector: 'page-ble-operator',
  templateUrl: 'ble-operator.html',
})
export class BleOperatorPage {
  @ViewChild(Refresher) refresher: Refresher;
  @ViewChild(Content) content: Content;
  @ViewChild('toggleble') ionToggle: Toggle;
  blueInfo :{
    "details":Observable<nowStatus>,
    "nowStatus":{
      "hadConnected":boolean,
      "id":string,
      "name":string,
      "o_name":string,
      "group":number,
      "collection":number,
      device: any,
    },
    "devices":{
      "list": Array<object>
    }
    //"details":nowStatus
  } = {
    "details":this.bleCtrl.nowStatus,
    "nowStatus":{
      "hadConnected":false,
      "id":null,
      "name":null,
      "o_name":null,
      "group":null,
      "collection":null,
      device: {},
    },
    "devices":this.bleCtrl.scanedDevices
  };
  bleToggle :{
    "checked" :boolean
  }
  devices_list:Observable<lightDeviceType[]>;
  constructor(
    private toastCtrl: ToastCtrlProvider,
    private eye: EyeCheckControl,
    public platform: Platform,
    private ngZone: NgZone,
    private bleCmd: BleCommandProvider,
    private alertCtrl:AlertController,
    private devicesProv:DevicesDataProvider,
    private bleCtrl:BleCtrlProvider,
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams,) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>BleOperatorPage');
      /*
      this.bleCtrl.nowStatus.subscribe(
        data => {
          this.blueInfo= {
            "details":this.bleCtrl.dataStore
          };
        }
      );*/
      this.devices_list = this.devicesProv.list;
      this.bleToggle = {
        "checked": false
      };
      this.platform.ready().then(ready=>{
        //this.blueInfo = this.bleCtrl.dataStore;
        this.blueInfo.details.take(1).subscribe(
          obj => {
            if(obj["isEnabled"]){
              this.bleToggle.checked = true;
            }else{
              alert('請開啟藍芽才能正常運作唷～');
            }
          }
        );

      });

  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad BleOperatorPage');
    this.blueInfo.details.subscribe(
      obj=>{
        this.blueInfo.nowStatus.hadConnected = obj.hadConnected;
        this.blueInfo.nowStatus.device = obj.device;

        this.bleToggle.checked = obj.isEnabled;
        if(this.bleToggle.checked) this.ionToggle.checked = true;
        else this.ionToggle.checked = false;
      }
    );
  }
  ionViewDidEnter(){
    console.log('>>>>>>>>>>>>>>>>>>>>>>BleOperatorPage ionViewDidEnter');
  }
  doRefresh(e) {

    this.refresher._top = this.content.contentTop + 'px';
    this.refresher.state = 'ready';
    this.refresher._onEnd();
    this.bleCtrl.scan(12,false).subscribe(
      ()=>{
      this.refresher.complete();
      }
    );
  }
  connectDevice(deviceId){
    this.eye.pConnectDevice(deviceId);
    /*
    this.bleCtrl.connectDevice(deviceId,(p)=>{
      this.navCtrl.pop();
    });*/

  }
  //
  setBleInfo(s:boolean){
  }
  enableBle() {
    if(this.bleToggle.checked==true){
      //console.log(JSON.stringify(this.blueInfo));
      this.bleCtrl.enableBle().subscribe(
        ()=>{
          this.bleToggle.checked = true;
          this.ionToggle.checked = true;
        },
        ()=>{
          console.log('>>> BleOperatorPage.enableBle() FAILED!');
          this.ngZone.run(() => {
            this.bleToggle.checked = false;
            this.ionToggle.checked = false;
          });
        }
      );
      //console.log(this.bleToggle.checked);
      //setTimeout(()=>{console.log(this.bleToggle.checked)},2500);
      //this.bleToggle = false;
    }else{
      this.bleCtrl.disableBle();
      //this.bleToggle.checked = this.blueInfo.details.isEnabled;
    }

  }
  openBleListNav(item){
    this.navCtrl.push(bleListPage, { item: item });
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
  connectRecentDevice(deviceId){
    this.bleCtrl.scanAndConnect(deviceId);
    /*this.bleCtrl.scan();
    this.bleCtrl.connectDevice(deviceId,this.navCtrl.pop);*/
  }
  disconnectDevice(){
    this.bleCtrl.disconnectCurrent().subscribe();
  }
  modifyDeviceGroup(){
    if(this.blueInfo.nowStatus.hadConnected){
      let confirm = this.alertCtrl.create({
        title: '調整群組 1~255',
        message: '數值"0"為無群組，修改時只會更改目前連結中的裝置',
        inputs: [
          {
            name: 'gid',
            type: 'number',
            placeholder: '數值'
          },
        ],
        buttons: [
          {
            text: '取消',
            handler: () => {
              console.log('取消 clicked');
            }
          },
          {
            text: '修改',
            handler: data => {
              let gid = parseInt(data.gid);
              this.bleCmd.goSetGroup(gid);
              //console.log('傳送');
            }
          }
        ]
      });
      confirm.present();
    }else{
      alert('尚未連接');
    }
  }
}
@Component({
  templateUrl: 'ble-list.html',
})
export class bleListPage {
  item;
  devices: any;
  statusMessage: string;
  peripheral: any;
  blueInfo : object;
  @ViewChild(Content) content: Content;
  @ViewChild(Refresher) refresher: Refresher;

  constructor(
    private eye: EyeCheckControl,
    public navCtrl: NavController,
    private bleCtrl:BleCtrlProvider,
    //private ble: BLE,
    public platform: Platform,
    private params: NavParams) {
    this.item = this.params.data.item;
    this.platform.ready().then(ready=>{
      this.blueInfo = this.bleCtrl.dataStore;
      this.devices = this.bleCtrl.scanedDevices;
      if(this.blueInfo["isEnabled"]){ //TODO
        //this.doRefresh();
        /* HACK refresher EVENT */
        /*this.refresher._top = this.content.contentTop + 'px';
        this.refresher.state = 'ready';
        this.refresher._onEnd();*/
      }else{
        alert('請開啟藍芽才能正常運作唷～');
      }
    });

  }
  ionViewDidEnter() {
  }

  connectDevice(deviceId){
    //this.bleCtrl.connectDevice(deviceId,()=>{this.navCtrl.pop});
    this.eye.pConnectDevice(deviceId);
  }

  scan(){
    //console.log(JSON.stringify(this.blueInfo));
    //console.log(JSON.stringify(this.devices.list));
    this.bleCtrl.scan(8, false).subscribe(done => {
      console.log('Async operation has ended');
      this.refresher.complete();
    });
  }

  doRefresh() {
    this.scan();
    /*
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);*/
  }

}

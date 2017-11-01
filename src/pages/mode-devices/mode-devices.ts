import { Component } from '@angular/core';
import { AlertController,ModalController,IonicPage, NavController, NavParams } from 'ionic-angular';
import { BleOperatorPage } from '../ble-operator/ble-operator';
import { SyncPage } from '../sync/sync';
import { DevicesDataProvider,lightDeviceType } from '../../providers/devices-data/devices-data';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import { BleCtrlProvider } from '../../providers/ble-ctrl/ble-ctrl';
import { BleCommandProvider } from '../../providers/ble-command/ble-command';

@IonicPage()
@Component({
  selector: 'page-mode-devices',
  templateUrl: 'mode-devices.html',
})
export class ModeDevicesPage {
  devices_list:Observable<lightDeviceType[]>;
  wtfDevices:{
    "list":Array<lightDeviceType>
  }
  constructor(
    private devicesProv:DevicesDataProvider,    
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams) {
      this.devices_list = this.devicesProv.list;
      this.wtfDevices = {
        "list":[]
      };
      this.devices_list.subscribe(
        list => {
          let tmp = Array.from({length: (list.length<=6)?(6-list.length):0}, 
            (v, i) => ({
              "name":'bulb'+(list.length+i+1),
              "o_name" :'bulb'+(list.length+i+1),
              "id": '空',
              "group":0,
              //"isGroupSync":boolean
              "last_sended": null,
              "hadGroupSync":null,
              "collection": null,
              })
          );
          console.log(tmp);
          this.wtfDevices.list = tmp;
        }
      );

  }

  editDevice(id:string){
    this.navCtrl.push(editDevicePage, { "id":id });
  }
  openBleModal(){
    this.navCtrl.push(BleOperatorPage);
   /* let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();*/
  }
  openSyncPage(){
    this.navCtrl.push(SyncPage);
   /* let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();*/
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ModeDevicesPage');
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
      "collection":null,
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
        alert('錯誤');
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
      title: '調整群組5',
      message: '數值"0"為無群組，如果裝置不在附近時，將無法正確地更改，但在此APP中會仍會顯示您更改的群組，建議使用右上角的「藍芽連結頁面」修改！',
      inputs: [
        {
          name: 'gid',
          type: 'number',
          placeholder: '請輸入群組0~255'
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
      ()=>alert('成功！'),
      (err,message)=>alert('錯誤 : '+message)
    );
  }

}

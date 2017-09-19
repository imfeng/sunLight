import { Component } from '@angular/core';
import { ModalController, NavController,NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';  // LazyLoading
import { BleOperatorPage } from '../ble-operator/ble-operator';
import { BleCommandProvider } from  '../../providers/ble-command/ble-command'
import { LightsGoupsProvider } from '../../providers/lights-goups/lights-goups'


import { LightsInfoProvider } from  '../../providers/lights-info/lights-info'
@IonicPage()
@Component({
  selector: 'page-mode-manual',
  templateUrl: 'mode-manual.html',
})
export class ModeManual {
  deviceMeta :  {
    "groups" : Array<number>,
    "curType" : number,
    "curMultiple": number, 
    "groupsList": Array<object>
  };
  lightsType : Array<object>;
  lightsGroupsList : Array<object>;
  constructor(
    //private blePage: BleOperatorPage,
    private lightsGroups:LightsGoupsProvider,
    private bleCmd: BleCommandProvider,
    public modalCtrl: ModalController,
    private lightsInfo: LightsInfoProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl:ToastController) {

      this.deviceMeta = {
        "groups" : [0],
        "curType" : 1,
        "curMultiple":0, 
        "groupsList": this.lightsGroups.getGroups()
      };
      //this.deviceMeta.groupsList.push({'id':0,'name':'廣播'});
      //this.deviceMeta.groupsList.push({'id':1,'name':'測試1'});
    
  // 
  }
  ngOnInit() {
    this.lightsType = this.lightsInfo.getTypes();
  }
  sendManual(power:boolean){
    let type=this.deviceMeta.curType;
    let multi=this.deviceMeta.curMultiple;
    if(power){
      this.deviceMeta.groups.forEach((group,idx) => {
        setTimeout(()=>{
          this.bleCmd.goManual(
            multi,
            type,
            group,
          );
         }, 1000*idx)
      });
    }else{
      this.deviceMeta.groups.forEach((group,idx) => {
        setTimeout(()=>{
          this.bleCmd.goManual(
            multi,
            0,
            group,
          );
         }, 1000*idx)
      });
    }
  }
  openBleModal(){
    let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ModeManual');
  }
  test(){
    console.log(this.deviceMeta);
  }
}

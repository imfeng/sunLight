import { Component, ViewChildren, QueryList } from '@angular/core';
import { ModalController, NavController,NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { IonicPage, Checkbox } from 'ionic-angular';  // LazyLoading
import { BleOperatorPage } from '../ble-operator/ble-operator';
import { BleCommandProvider } from  '../../providers/ble-command/ble-command'
import { Observable } from 'rxjs/Observable';

import { ScheduleDataProvider,scheduleType } from '../../providers/schedule-data/schedule-data'
import { LightsInfoProvider,lightsTypesPipe } from  '../../providers/lights-info/lights-info'
import { CollectionsDataProvider,collectionType } from '../../providers/collections-data/collections-data';
import { appStateType,AppStateProvider } from  '../../providers/app-state/app-state';
import { EyeCheckControl } from '../eye-check/eye-check.control';


@IonicPage()
@Component({
  selector: 'page-mode-manual',
  templateUrl: 'mode-manual.html',
  providers:[lightsTypesPipe]
})
export class ModeManual {
  isEnableRangeBar = false;
  isRedTips: boolean = false;
  isManual: boolean = false;
  /** collectionsList ionCheckbox*/
  collectionsList:Observable<collectionType[]>;
  collectionsChecks:Array<boolean> = Array.from({length:12},v=>false);
  /** */


  appState:Observable<appStateType>;
  curType:number = -1;


  deviceMeta :  {
    "groups" : Array<number>,
    "curType" : number,
    "curMultiple": number,
    "groupsList": Array<object>,

    "multipleList": Array<number>
  };
  lightsType : Array<object>;
  lightsGroupsList : Array<object>;
  showDisableBtn: boolean;
  constructor(
    public eyeCheckCtrl: EyeCheckControl,
    private appStateProv: AppStateProvider,
    private ScheduleProv: ScheduleDataProvider,
    private clProv : CollectionsDataProvider,
    //private blePage: BleOperatorPage,

    private bleCmd: BleCommandProvider,
    public modalCtrl: ModalController,
    private lightsInfo: LightsInfoProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl:ToastController) {
      this.collectionsList = this.clProv.list;
      this.appStateProv.info.subscribe(
        state => {
          this.showDisableBtn = (state.now_mode_slug=='manual');
        }
      );

      this.deviceMeta = {
        "groups" : [0],
        "curType" : 1,
        "curMultiple":0,
        "groupsList": [],

        "multipleList": [0,0,0,0,0,0]
      };
      //this.deviceMeta.groupsList.push({'id':0,'name':'廣播'});
      //this.deviceMeta.groupsList.push({'id':1,'name':'測試1'});


  //
  }
  ngOnInit() {
    this.lightsType = this.lightsInfo.getTypes();
  }
  ionViewDidLoad() {
    let minutes = new Date().getMinutes();
    if(minutes>=50) {
      this.isRedTips = true;
    } else {
      this.isRedTips = false;
    }
  }
  enableRangeBar() {
    this.isEnableRangeBar = true;
  }
  s() {
    this.bleCmd.goSyncSchedule().subscribe( list => {
      this.eyeCheckCtrl.pSchedule(list);
    });
  }
  toggleMode() {
    this.isManual = !this.isManual;
  }
  disableManual(){
    this.bleCmd.goSyncSchedule().subscribe();
    this.curType = 0;
  }
  trigger(event,type:number){
/*
    for(let i=0;idx<this.deviceMeta.multipleList.length;i++){
      if(i != idx){
          this.deviceMeta.multipleList[i]=0;
      }
    }*/
    //this.sendManual(true);
    this.curType = (type);
    this.sendManual(true,type,this.deviceMeta.multipleList[type-1]);
    /*for(let i=0;i<6;i++){
      if(i != idx){
       this.deviceMeta.multipleList[i]=0;
      }else{
        this.sendManual(true,idx,this.deviceMeta.multipleList[i]);
      }
    }*/

  }
  sendManual(power:boolean,type=0,multi=0){
    //console.log(this.collectionsChecks);
    //let type=this.deviceMeta.curType;
    //let multi=this.deviceMeta.curMultiple;
    let sendList = [];



    if(power){
      this.bleCmd.collectionsToDeviceGid(this.collectionsChecks).subscribe(
        allDevices => {

          this.bleCmd.goManualModeMulti(multi,type,allDevices).subscribe(
            isOk=>{
              if(!isOk) this.curType = 0;
            }
          );
          /*allDevices.forEach((group,idx) => {
            setTimeout(()=>{
              this.bleCmd.goManualMode(
                multi,
                type,
                group,
              );
             }, 400*idx);
          });*/
        }
      );

    }else{
      this.bleCmd.collectionsToDeviceGid(this.collectionsChecks).subscribe(
        allDevices => {
          this.curType = 0;
          this.bleCmd.goManualModeMulti(0,0,allDevices).subscribe(
            isOk=>{
              if(!isOk) this.curType = 0;
            }
          );;
          /*allDevices.forEach((group,idx) => {
            setTimeout(()=>{
              this.bleCmd.goManualMode(
                0,
                0,
                group,
              );
             }, 400*idx);
          });*/
        }
      );

    }
  }
  openBleModal(){
    this.navCtrl.push(BleOperatorPage);
    /*let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();*/
  }

  test(){
    console.log(this.deviceMeta);
  }
}

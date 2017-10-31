import { Component } from '@angular/core';
import { AlertController ,ViewController, ModalController, NavController, NavParams } from 'ionic-angular';
import {  ScheduleDataProvider,scheduleType,sectionDataType } from '../../providers/schedule-data/schedule-data'
import { ToastCtrlProvider } from  '../../providers/toast-ctrl/toast-ctrl'
import { LightsInfoProvider,lightsTypesPipe } from  '../../providers/lights-info/lights-info'
import { CollectionsDataProvider,collectionType } from '../../providers/collections-data/collections-data';
import { Observable } from 'rxjs/Observable';
@Component({
  templateUrl: './edit-schedule.html'
})
export class editSchedulePage {
  collectionsList:Observable<collectionType[]>;


  data:{
    sections:Array < sectionDataType >,
    checks:Array<boolean>
  }= {
    sections:[],
    checks:[]
  }
  thisIdx: number;
  constructor(
    private clProv : CollectionsDataProvider,
    private scheduleProv: ScheduleDataProvider,
    private toastCtrl:ToastCtrlProvider,
    private modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.collectionsList = this.clProv.list;

    this.thisIdx = this.navParams.get("idx");
    this.scheduleProv.getSchedule(this.navParams.get("idx")).subscribe(
        arr => {
            this.data.sections = arr.sectionsList;
            this.data.checks = arr.checks;
            
        }
    );
    console.log('editSchedulePage: ' + this.thisIdx);
  }
  saveSections(isSended=false){
    this.scheduleProv.modifySchedule(this.thisIdx,this.data.sections,this.data.checks).subscribe(
        res => {
            this.toastCtrl.showToast('儲存成功！');
        }
    );
    //this.infos['lastModified'] = new Date().getTime();
    //console.log(this.infos['lastModified']);
  }
  delSection(idx) {
    this.data.sections.splice(idx, 1);
  }
  editSection(idx) {
    let modal = this.modalCtrl.create(modalSectionEdit, {
      "time": this.data.sections[idx].time,
      "multiple": this.data.sections[idx].multiple
    }, {
      cssClass: 'modal-section'
    });
    modal.onDidDismiss(data => {
      let repeated = this.detectRepeat(data)
      if (data && !repeated) {
        //this.data.sections.push(data);
        this.data.sections[idx].time = data.time;
        this.data.sections[idx].multiple = data.multiple;
        this.data.sections.sort(
          (a, b) =>
          ((a.time_num[0] == b.time_num[0]) ? (a.time_num[1] - b.time_num[1]) : (a.time_num[0] - b.time_num[0]))
        );
      } else if (repeated) {
        this.toastCtrl.showToast('「開始時間」重複，請試試別的時間唷');
      } else {

      }
      //console.log(this.data.sections);
    });
    modal.present();
  }
  addSection() {
      console.log(this.data.sections);
    if (this.data.sections.length >= 30) {
      alert('排程數量已經額滿(上限為30組)');
    } else {
      let modal = this.modalCtrl.create(modalSectionEdit, {
        "time": "00:00",
        "multiple": 0
      }, {
        cssClass: 'modal-section'
      });
      modal.onDidDismiss(data => {
        let repeated = this.detectRepeat(data)
        if (data && !repeated) {
          this.data.sections.push(data);
          this.data.sections.sort(
            (a, b) =>
            ((a.time_num[0] == b.time_num[0]) ? (a.time_num[1] - b.time_num[1]) : (a.time_num[0] - b.time_num[0]))
          );
        } else if (repeated) {
          this.toastCtrl.showToast('「開始時間」重複，請試試別的時間唷');
        } else {

        }
        //console.log(this.data.sections);
      });
      modal.present();
    }

  }
  detectRepeat(data) {
    if (this.data.sections.find((val, idx) => (val.time == data.time) ? true : false)) {
      return true;
    }
  }
}
@Component({
    templateUrl:'./nav-main/modal-section-edit.html',
    providers:[lightsTypesPipe]
})
export class modalSectionEdit{
    //param : object;
    settings:sectionDataType ;
    lightsTypes:Array<string>;
    constructor(
      
      private lightsType: LightsInfoProvider,
      public viewCtrl: ViewController,
      public navParams: NavParams) {
        this.lightsTypes = this.lightsType.getTypes();
        this.settings= {
          "mode":1,
          "time":this.navParams.data["time"],
          "time_num":[],
          "multiple":this.navParams.data["multiple"]
        }
      }
    add(){
      //this.settings["mode"] = parseInt(this.settings["mode"]);
      this.settings["time_num"] = 
        this.settings["time"].split(':').map( (val,idx)=>{ if(idx<2){return parseInt(val,10);} } )
      this.viewCtrl.dismiss(this.settings);
    }
    dismiss() {
      this.viewCtrl.dismiss(false);
    }
}
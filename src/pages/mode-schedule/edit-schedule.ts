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

  datePicker :{
    start:string,
    end:string,
    range:Array<number>
  }
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
    this.datePicker = {
      start:'',
      end:'',
      range:[null,null]
    }
    this.collectionsList = this.clProv.list;

    this.thisIdx = this.navParams.get("idx");
    
    console.log('editSchedulePage: ' + this.thisIdx);
  }
  ionViewDidLoad() {
    this.scheduleProv.getSchedule(this.navParams.get("idx")).subscribe(
        arr => {
            this.data.sections = arr.sectionsList;
            this.data.checks = arr.checks;
            this.datePicker.range = arr.dateRange;
            console.log('this.scheduleProv.dateRangeToStringObj(arr.dateRange)')
            console.log(this.scheduleProv.dateRangeToStringObj(arr.dateRange))
            let dateTmp = this.scheduleProv.dateRangeToStringObj(arr.dateRange);
            this.datePicker.start = dateTmp.start;
            this.datePicker.end = dateTmp.end;
        }
    );
  }
  dateChange(event){
    console.log(this.datePicker);
    
    if(this.datePicker.end === null){
      this.datePicker.end = '';
    }else if(this.datePicker.start === null){
      this.datePicker.start = '';
    }else if(this.datePicker.start === '' || this.datePicker.end ===''){
      return false;
    }else{
      if(this.datePicker.start > this.datePicker.end){
        this.datePicker.start = [this.datePicker.end , this.datePicker.end=this.datePicker.start][0];
      }else{}
      let dateTmp = [ 
        parseInt(this.datePicker.start.split(':')[0]),
        parseInt(this.datePicker.end.split(':')[0]),
      ];
      this.datePicker.range = dateTmp;
      this.data.sections = [];
  
      this.scheduleProv.detectDateRange(dateTmp,this.thisIdx).subscribe(
        isRepeat => {
          if(!isRepeat || this.datePicker.end=='00:00'){
            for( let i=dateTmp[0];i<=dateTmp[1];i++  ){
              this.data.sections.push({
                "mode":1,
                "time": ((i<10)?('0'+i):i)+':00',
                "time_num":[i,0],  // [ HOUR , MIN ]
                "multiple":0,
              });
            } 
          }else{
            setTimeout(
              ()=>{
                this.datePicker.range = [null,null];
                this.data.sections = [];
                this.datePicker.start = '';
                this.datePicker.end = '';
              },500
            );
            alert('時間重疊到其他排程！('+isRepeat.dateRange[0]+':00~'+isRepeat.dateRange[1]+':00)');
            
          }
        }
      );
    }
    
    
    //this.data.sections
  }
  saveSections(isSended=false){
    this.scheduleProv.modifySchedule(this.thisIdx,this.data.sections,this.data.checks,this.datePicker.range).subscribe(
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
      "mode": this.data.sections[idx].mode,
      "time": this.data.sections[idx].time,
      "multiple": this.data.sections[idx].multiple
    }, {
      cssClass: 'modal-section'
    });
    modal.onDidDismiss(data => {
      let repeated = this.detectRepeat(data)
      if (data && !repeated) {
        //this.data.sections.push(data);
        this.data.sections[idx].mode = data.mode;
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
    /*if (this.data.sections.find((val, idx) => (val.time == data.time) ? true : false)) {
      return true;
    }else{
      return false;
    }*/
    return false;
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
          "mode":this.navParams.data["mode"],
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
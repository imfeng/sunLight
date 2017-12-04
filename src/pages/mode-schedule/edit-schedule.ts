import { Renderer, ElementRef,ViewChild,Component, ViewChildren, QueryList } from '@angular/core';
import { Platform, Tabs, Select, AlertController ,ViewController, ModalController, NavController, NavParams,Checkbox } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { ChartsModule,BaseChartDirective } from 'ng2-charts';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import {  ScheduleDataProvider,scheduleType,sectionDataType } from '../../providers/schedule-data/schedule-data';
import { ToastCtrlProvider } from  '../../providers/toast-ctrl/toast-ctrl';
import { LightsInfoProvider,lightsTypesPipe } from  '../../providers/lights-info/lights-info';
import { collectsChecksToSting,CollectionsDataProvider,collectionType } from '../../providers/collections-data/collections-data';

import { AppStateProvider } from  '../../providers/app-state/app-state';
@Component({
  templateUrl: './edit-schedule.html',
})
export class editSchedulePage {
  /** TODO */
  @ViewChild('chartele') chartEle: ElementRef;
  @ViewChild('head') head: ElementRef;
  toggleFullScreen(){
    let body = this.ELE.nativeElement.getElementsByClassName('scroll-content')[0];
    let tabs = document.querySelector('.ion-page>.tabs>.tabbar');
    this.touchStatus.isFullScreen = !this.touchStatus.isFullScreen;
    if(this.touchStatus.isFullScreen){
      //this.RENDER.setElementStyle(this.chartEle.nativeElement, 'max-height', '250px');
      this.RENDER.setElementStyle(this.head.nativeElement, 'top', '-56px');
      this.RENDER.setElementStyle(body, 'margin-top', '0');
      this.RENDER.setElementStyle(body, 'margin-bottom', '0');
      this.RENDER.setElementStyle(tabs, 'bottom', '-70px');
      //this.RENDER.setElementStyle(tabs, 'bottom', '-51px');
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    }else{
      //this.RENDER.setElementStyle(this.chartEle.nativeElement, 'max-height', '180px');
      this.RENDER.setElementStyle(this.head.nativeElement, 'top', '0px');
      this.RENDER.setElementStyle(body, 'margin-top', '44px');
      this.RENDER.setElementStyle(body, 'margin-bottom', '50px');
      this.RENDER.setElementStyle(tabs, 'bottom', '0px');
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      /*this.ionCheckbox.forEach((e,i) => {
        console.log('GG');
        console.log(e);
        e._elementRef.nativeElement.lastChild.firstChild.innerHTML = String.fromCharCode(65+i);
      });*/
    }
  }

  /** */
  @ViewChildren(Checkbox) ionCheckbox :QueryList<Checkbox>;
  ionViewDidLoad(){
    /*this.ionCheckbox.forEach((e,i) => {
      e._elementRef.nativeElement.lastChild.firstChild.innerHTML = String.fromCharCode(65+i);
    });*/
  }
  collectionsListTest = Array.from({length: 12}, 
    (v, i) => ({
        "name":(i+1),
        "cid": (i+1),
        "devices":[]
      })
  );
  /** */
  @ViewChild(BaseChartDirective) chartDi;
  touchStatus = {
    "isFullScreen":false,
    "window_h":0,
    "window_w":0,
    "isSaved":true,
    "curItem":null,
    "curIndex":-1,
    "onTouched":false,
    "pos":{
      "x":0,
      "y":0
    },
    "canvas_h":0,
    "curCtrl_y":0,
    "curStep":0,

    "tmpLightType":1,
    "tmpMulti":0,
  }
  
  @ViewChild('typeselect') typeselect:any;
  lightsTypes:Array<string>;
  collectionsList:Observable<collectionType[]>;
  temp = {
    "data":Array.from( new Array(0), ()=>(0) ),
    "backgroundColor":Array.from( new Array(24), ()=>('#fff') )
  }
  chartDatas:{
    "type":string,
    "datasets":Array<any>,
    "labels": Array<string>,
    "options":{},
    "colors":{}
  } = {
    "type":'bar',
    "datasets": [
      this.gChartLineSet(this.temp.data),
      {"data":this.temp.data}
    ],
    "colors":[{"backgroundColor":'transparent'},{"backgroundColor":[]}],
    "labels": [],
    "options":{
      animation:{
        easing: 'easeOutExpo'
      },
      pan: {
        enabled: true,
        mode: 'x'
      },
      zoom: {
        enabled: true,
        mode: 'x',
        limits: {
          max: 5,
          min: 0.5
        }
      },
      tooltips:false,
      onHover:function($e){
        $e.preventDefault();
      },
      //onClick:this.testF(),
      layout: {
        padding: {
            left: 5,
            right: 5,
            top: 20,
            bottom: 10
        }
      },
      caleShowLabels:!1,
      scales:{xAxes:
        [{gridLines:{offsetGridLines:!0},
          barPercentage:0.4,
          categoryPercentage:0.9,
          ticks:{padding:10,backdropPaddingX:20}
        }],
        yAxes:[{ticks:{max:30,min:0,display:true,beginAtZero:!0,padding:0}}]
      },
      responsive:!0,
      onResize: (function(plat,fullSreen){
        console.log(fullSreen);
        if(fullSreen){
          return function(a,b){
            setTimeout(function(){
              console.log('HIGHT: ' + plat.height());
              a.height =  plat.height() - 70;
            },300);
          
          }
        }else{
          return function(){}
        }
        
      })(this.platform,this.touchStatus.isFullScreen),
    },
  }
  datePicker :{
    start:string,
    end:string,
    range:Array<number>
  }={
    start:'00:00',
    end:'23:00',
    range:[0,23]
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
    private platform: Platform,
    private screenOrientation: ScreenOrientation,
    private ELE: ElementRef,
    private RENDER: Renderer,
    private appStateProv: AppStateProvider,
    private alertCtrl: AlertController,
    private lightsType: LightsInfoProvider,
    private clProv : CollectionsDataProvider,
    private scheduleProv: ScheduleDataProvider,
    private toastCtrl:ToastCtrlProvider,
    private modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.platform.ready().then((readySource) => {
      console.log('Width: ' + this.platform.width());
      console.log('Height: ' + this.platform.height() );
      this.touchStatus.window_h = this.platform.height();
      this.touchStatus.window_w = this.platform.width();
    });
    this.lightsTypes = this.lightsType.getTypes();
    
    
    this.collectionsList = this.clProv.list;

    this.thisIdx = this.navParams.get("idx");
    //this.dateChange();

    console.log('editSchedulePage (schedule List Idx): ' + this.thisIdx);
    this.scheduleProv.getSchedule(this.navParams.get("idx")).subscribe(
      arr => {
        console.log('ionViewDidEnter')
        console.log(arr);
          this.data.sections.push(...arr.sectionsList);
          this.data.checks.push(...arr.checks);

          this.datePicker.range = arr.dateRange;
          let dateTmp = this.scheduleProv.dateRangeToStringObj(arr.dateRange);
          this.datePicker.start = dateTmp.start;
          this.datePicker.end = dateTmp.end;

        console.log(this.data);
          this.changeSectionsEvent();
          
      }
    );
  }

  ionViewDidEnter() {
  }
  ionViewWillLeave(){
    this.showConfirm();
  }
  /** CHARTJS */
  onTouchStart($e){
    console.log('touchstart');
    var item = this.chartDi.chart.getElementAtEvent($e)[0];
    if((item||false)?((item._model.pointStyle||false)?true:false):false){
      this.touchStatus.onTouched = true;
      this.touchStatus.curItem = item;
      this.touchStatus.curIndex = item._index;
      this.touchStatus.canvas_h = item._chart.height-70;
      this.touchStatus.curCtrl_y = $e.touches[0].pageY;
      this.touchStatus.curStep = this.data.sections[item._index].multiple;

      console.log(item);
      console.log(this.touchStatus);

    } 
  }
  countMoveRate(curY){
    console.log('curY: ' + curY);
    let nextStep = Math.round( this.touchStatus.curStep + ((this.touchStatus.curCtrl_y-curY)/this.touchStatus.canvas_h*30) );
    console.log('nextStep '+ nextStep);
    return (nextStep>30)?30:((nextStep<0)?0:nextStep);
  }
  onTouchMove($e){
    $e.preventDefault();
    if(this.touchStatus.onTouched){
      console.log($e);
      let tmp = this.countMoveRate($e.touches[0].pageY);
      this.touchStatus.curItem._chart.config.data.datasets[0].data[this.touchStatus.curIndex]
       = tmp;
      this.touchStatus.curItem._chart.update();
      this.data.sections[this.touchStatus.curIndex].multiple = tmp;
    }
  }
  onTouchEnd($e){
    console.log('touchend');
    if(this.touchStatus.onTouched){
      this.touchStatus.isSaved = false;
      this.touchStatus.onTouched = false;
      this.touchStatus.tmpLightType = this.data.sections[this.touchStatus.curIndex].mode;
      //this.typeselect.open();
    }
  }
  lightTypeChangeBtn(type:number){
    this.touchStatus.tmpLightType = type;
    this.data.sections[this.touchStatus.curIndex].mode = type;
    this.changeSectionsEvent();
  }
  typeselectChanged(){
    this.data.sections[this.touchStatus.curIndex].mode = this.touchStatus.tmpLightType;
    this.changeSectionsEvent();
  }
  chartClick($e){
    // DEBUG
    let crt = this.chartDi;
    console.log(crt);
    console.log();
    var item =crt.chart.getElementAtEvent($e);
    if (item) {
        var label = crt.data.labels[crt.datasets[0].data._index];
        var value = crt.data.datasets[item._datasetIndex].data[item._index];
    }
    console.log($e);
  }
  /** CHARTJS END */
  gChartLineSet(data){
    return {
      "type":'line',
      "data":data,
      borderWidth: 3,
      borderColor: 'rgba(0,0,255,0.2)',
      pointRadius:10 ,
      pointHoverRadius: 25,
      pointHoverBorderColor: 'rgba(0, 0, 255,0.8)',
      pointDotWidth: 5,
      pointBorderColor: 'rgba(0, 0, 255,0.5)',
      pointBackgroundColor: 'rgba(0,0,255,.1)',
      backgroundColor: 'rgba(0,0,0,0)',
    }
  }
  detectRepeatChecks(idx:number){
    this.touchStatus.isSaved = false;
    this.scheduleProv.detectDateRange(this.datePicker.range,this.thisIdx,this.data.checks).subscribe(
      isRepeat => {
        if(!isRepeat){
        }else{
          setTimeout(
            ()=>{
              this.data.checks[idx] =false;
            },500
          );
          
          alert(
            `
            "時間"或"群組"和其他排程衝突！
            ( ${ this.scheduleProv.dateRangeToString(isRepeat.dateRange)},群組${collectsChecksToSting(isRepeat.checks)}
               )
            `);
            
        }
      }
    );
  }
  dateChange(){
    console.log(this.datePicker);
    this.touchStatus.isSaved = false;
    if(this.datePicker.end === null){
      this.datePicker.end = '';
    }else if(this.datePicker.start === null){
      this.datePicker.start = '';
    }else if(this.datePicker.start === '' || this.datePicker.end ===''){
      return false;
    }else{
      if(this.datePicker.start > this.datePicker.end){
        let tmp = this.datePicker.start 
        this.datePicker.start = this.datePicker.end;
        this.datePicker.end = tmp;
      }else{}
      let dateTmp = [ 
        parseInt(this.datePicker.start.split(':')[0]),
        parseInt(this.datePicker.end.split(':')[0]),
      ];
      this.datePicker.range = dateTmp;
      this.data.sections = [];
  
      this.scheduleProv.detectDateRange(dateTmp,this.thisIdx,this.data.checks).subscribe(
        isRepeat => {
          if(!isRepeat){
            for( let i=dateTmp[0];i<=dateTmp[1];i++  ){
              this.data.sections.push({
                "mode":1,
                "time": ((i<10)?('0'+i):i)+':00',
                "time_num":[i,0],  // [ HOUR , MIN ]
                "multiple":0,
              });
            }
            this.changeSectionsEvent();
          }else{
            setTimeout(
              ()=>{
                this.datePicker.range = [null,null];
                this.data.sections = [];
                this.datePicker.start = '';
                this.datePicker.end = '';
              },500
            );
            alert(
              `
              "時間"或"群組"和其他排程衝突！
              ( ${ this.scheduleProv.dateRangeToString(isRepeat.dateRange)},群組${collectsChecksToSting(isRepeat.checks)}
                 )
              `);
              
          }
        }
      );
    }
  }
  changeSectionsEvent(){
    let chart = this.scheduleProv.sectionsToCharts(this.data.sections,this.datePicker.range,true);
    //this.temp.data.splice(0,this.temp.data.length).push.apply(this.temp.data,chart.data);
    //console.log(chart);
    this.chartDatas.datasets = [
      this.gChartLineSet(chart.data),
      {data:chart.data}
    ],
    this.chartDatas.colors = [
      {},
      {"backgroundColor": chart.backgroundColor}];
    this.chartDatas.labels = chart.labels;
  }

  showConfirm() {
    if(!this.touchStatus.isSaved){
      let confirm = this.alertCtrl.create({
        title: '尚未儲存',
        message: '您忘記儲存了，請問需要儲存方才的設定嗎？',
        buttons: [
          {
            text: '捨棄',
            handler: () => {}
          },
          {
            text: '儲存',
            handler: () => {
              this.saveSections();
            }
          }
        ]
      });
      confirm.present();
    }

  }
  saveSections(isSended=false){

    
    this.scheduleProv.modifySchedule(this.thisIdx,this.data.sections,this.data.checks,this.datePicker.range).subscribe(
        res => {
          this.touchStatus.isSaved = true;
          this.toastCtrl.showToast('儲存成功！');
          this.appStateProv.action({type:'sync',payload:false});
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
      /** DEPRECATED START*/
      let repeated = this.detectRepeat(data)
      /** DEPRECATED END*/
      
      if (data && !repeated) {
        this.touchStatus.isSaved = false;
        //this.data.sections.push(data);
        this.data.sections[idx].mode = data.mode;
        this.data.sections[idx].time = data.time;
        this.data.sections[idx].multiple = data.multiple;
        this.data.sections.sort(
          (a, b) =>
          ((a.time_num[0] == b.time_num[0]) ? (a.time_num[1] - b.time_num[1]) : (a.time_num[0] - b.time_num[0]))
        );
        this.changeSectionsEvent();
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
    return false;
    // 時間重複取消
    /*if (this.data.sections.find((val, idx) => (val.time == data.time) ? true : false)) {
      return true;
    }else{
      return false;
    }*/
    
  }

  openChartEdit(){
    let modal = this.modalCtrl.create(chartEditModal, {

    }, {
      cssClass: 'modal-chart'
    });
    modal.onDidDismiss(data => {
      console.log('chartEditModal DISMISS!');
    });
    modal.present();
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
@Component({
  templateUrl:'./nav-main/chart-edit.html'
})
export class chartEditModal{

  constructor(
    public viewCtrl: ViewController,
  ){
    
  }
  dismiss(){
    this.viewCtrl.dismiss(false);
  }
}
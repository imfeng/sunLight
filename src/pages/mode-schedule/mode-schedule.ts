import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LightsInfoProvider } from '../../providers/lights-info/lights-info'
import { ScheduleDataProvider,scheduleType } from '../../providers/schedule-data/schedule-data'
import { BleCommandProvider } from '../../providers/ble-command/ble-command';
import { editSchedulePage } from './edit-schedule';

import { Observable } from 'rxjs/Observable';
import { appStateType,AppStateProvider } from  '../../providers/app-state/app-state';


@IonicPage()
@Component({
  selector: 'page-mode-schedule',
  templateUrl: 'mode-schedule.html',
})
export class ModeSchedulePage{
  lightsColor : any = this.lightsInfo.getTypes('color');

  /** IONIC lifeCycle*/

  appState:Observable<appStateType>;
  btnSetting:{
    color:string,
    message:string
  }={
    color:'primary',
    message:'傳送指令(未同步)'
  };
  scheduleList:Observable<scheduleType[]>;

  constructor(
    private appStateProv: AppStateProvider,
    private bleCmd: BleCommandProvider,
    private scheduleProv:ScheduleDataProvider,

    private lightsInfo:LightsInfoProvider,
    public navCtrl: NavController,
    public navParams: NavParams) {
      this.appStateProv.info.subscribe(
        state => {
          console.log(state);
          this.btnSetting.color = (state.now_mode_slug=='sche'&&state.isSync)?'dark':'primary';
          this.btnSetting.message 
            = state.btnMessage;
            //(state.now_mode_slug=='sche')?((state.isSync)?'傳送指令(已同步)':'傳送指令(未同步)'):'取消手動';
        }
      );
      this.scheduleList = this.scheduleProv.list;
      //this.lightsGroups.loadAll();
  }
  onChartClick(event) {
    console.log(event);
  }

  getDateRangeTitle(dateRange:[number,number]){
    return this.scheduleProv.dateRangeToString(dateRange);
  }
  goSchedule(idx){
    this.navCtrl.push(editSchedulePage,{"idx":idx});
  }
  /** */
  syncSchedule(){
    this.bleCmd.goSyncSchedule().subscribe();
  }

 
  addSchedule(){
    this.scheduleProv.addNew();
  }
  rmSchedule(idx){
    this.scheduleProv.remove(idx);
  }

  getRandomDatasetArr(){
    return {
      "data": Array.from( new Array(16), ()=>(this.getRandomInt(0,100)) )
    }
  }
  getRandomColorsArr(){
    return {
      "backgroundColor":
        Array.from(new Array(16) , (val,idx) => (this.lightsColor[this.getRandomInt(0,5)]) )
    }
  }
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


 

  /* CHART SETTINGS */
  chartLabels = [
    "00:00","","02:00","","04:00","",
    "06:00","","08:00","","10:00","",
    "12:00","","14:00","","16:00","",
    "18:00","","20:00","","22:00","","24:00"
  ];
  chartOptions = {
    layout: {
      padding: {
          left: 0,
          right: 0,
          top: 10,
          bottom: 0
      }
    },
    scaleShowLabels: false,
    scales: {
      xAxes: [{
        gridLines: {
          offsetGridLines : true
        },
        pointDotRadius:50,
        barPercentage:1.0,
        categoryPercentage:1.0,
        ticks:{
          padding:0,
          backdropPaddingX: 0,
        }
      }],
      yAxes: [{
        ticks: {
          max: 31,
          min: -1,
          display:false,
          beginAtZero: true,
          padding: 0,
        }
      }]
    },
    responsive: true
  };

}




  /* DATA EXAMPLES

  chartData = [{
    data:[
      0,   0,   5, 15, 30, 45,
    70, 90,100, 80, 55, 35,
      5,  0,  0,  0
    ];

  colors = [
    {
      backgroundColor:[
        this.lightsColor[0],
        this.lightsColor[0],
        this.lightsColor[2],
        this.lightsColor[2],
        this.lightsColor[2],
        this.lightsColor[2],
        this.lightsColor[3],
        this.lightsColor[3],
        this.lightsColor[3],
        this.lightsColor[4],
        this.lightsColor[4],
        this.lightsColor[5],
        this.lightsColor[4],
        this.lightsColor[4],
        this.lightsColor[4],
        this.lightsColor[4],
      ]
    }
  ];
  }];*/
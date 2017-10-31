import { OnInit, Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LightsInfoProvider } from '../../providers/lights-info/lights-info'
import { LightsGoupsProvider,lightsGroupsData } from '../../providers/lights-goups/lights-goups'
import { ScheduleDataProvider,scheduleType } from '../../providers/schedule-data/schedule-data'
import { BleCommandProvider } from '../../providers/ble-command/ble-command';
import { editSchedulePage } from './edit-schedule';

import * as subMain from './nav-main'

import { Observable } from 'rxjs/Observable';
/**
 * Generated class for the ModeSchedulePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-mode-schedule',
  templateUrl: 'mode-schedule.html',
})
export class ModeSchedulePage implements OnInit{
  lightsColor : any = this.lightsInfo.getTypes('color');

  /** IONIC lifeCycle*/
  testGroups:Observable<lightsGroupsData[]>;

  scheduleList:Observable<scheduleType[]>;

  constructor(
    private bleCmd: BleCommandProvider,
    private scheduleProv:ScheduleDataProvider,
    private lightsGroups:LightsGoupsProvider,
    private lightsInfo:LightsInfoProvider,
    public navCtrl: NavController,
    public navParams: NavParams) {
      this.testGroups = this.lightsGroups.infos;
      this.scheduleList = this.scheduleProv.list;
      //this.lightsGroups.loadAll();
  }
  ngOnInit(){
    //this.lightsGroups.loadAll();
    //this.lightsGroups.set(this.groupsInfo,(isScc)=>{if(isScc)console.log('lightsGroups.set OK!!!!!!!!!!!!!!')});
    
    
  }
  onChartClick(event) {
    console.log(event);
  }
  ionViewDidLoad() {

  }
  ionViewDidEnter(){
    console.log('ionViewDidEnter "Schedule tab"');
  }
  /** */
  syncSchedule(){
    this.bleCmd.goSyncSchedule();
  }
  goSchedule(idx:number){
    this.navCtrl.push(editSchedulePage, { "idx": idx});
  }
  addSchedule(){
    this.scheduleProv.addNew();
  }
  rmSchedule(idx){
    this.scheduleProv.remove(idx);
  }
  /** */
  goPatterns(goGid:number,goName:string){   // lightsGroupsData .getGid(gid)
    this.navCtrl.push(subMain.pr1patternsNav, { "gid": goGid,"name": goName});
  }
  goDevices(goGid:number){  //TODO
    this.navCtrl.push(subMain.pr1patternsNav, { "gid": goGid });
  }
  rmLightsGroup(gid:number){
    this.lightsGroups.remove(gid);
  }

  /** */

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
    padding:0,
    scaleShowLabels: false,
    scales: {

      xAxes: [{
        gridLines: {
          offsetGridLines : true
        },
        barPercentage:1.0,
        categoryPercentage:1.0,
        ticks:{
          padding:0,
          backdropPaddingX: 0,
        }
      }],
      yAxes: [{
        ticks: {
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
import { OnInit, Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LightsInfoProvider } from '../../providers/lights-info/lights-info'
import { LightsGoupsProvider,lightsGroupsInfos } from '../../providers/lights-goups/lights-goups'
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
  chartDatasArr: Array<any> = [
    [{
      data:[
        0,   0,   5, 15, 30, 45,
      70, 90,100, 80, 55, 35,
        5,  0,  0,  0
      ]
    }],[{
      data:[
        50,  60,   55, 15, 30, 45,
      70, 70,60, 30, 20, 0,
        5,  50, 70,  70
      ]
    }],[{
      data:[
        10, 20,  30, 40, 50, 60,
      80, 90,100, 85, 70, 55,
        40,  25, 10,  0
      ]
    }]
  ];
  groupsInfo: Array < lightsGroupsInfos > = [{
    "gid": 1,
    "name": "養殖區A",
    "lastSended": "11min ago command sended",
    "devicesTotal": 22,
    "chartDatas": {
      "colors": [this.getRandomColorsArr()],
      "datasets": this.chartDatasArr[0]
    }
  }, {
    "gid": 2,
    "name": "養殖區B",
    "lastSended": "1day ago command sended",
    "devicesTotal": 10,
    "chartDatas": {
      "colors": [this.getRandomColorsArr()],
      "datasets": [this.getRandomDatasetArr()]
    }
  }, {
    "gid": 3,
    "name": "養殖區C",
    "lastSended": "1month ago command sended",
    "devicesTotal": 31,
    "chartDatas": {
      "colors": [this.getRandomColorsArr()],
      "datasets": [this.getRandomDatasetArr()]
    }
  }, ]


  /** IONIC lifeCycle*/
  testGroups:Observable<lightsGroupsInfos[]>;
  constructor(
    private lightsGroups:LightsGoupsProvider,
    private lightsInfo:LightsInfoProvider,
    public navCtrl: NavController,
    public navParams: NavParams) {
  }
  ngOnInit(){
    this.lightsGroups.set(this.groupsInfo,(isScc)=>{if(isScc)console.log('setOK!!!!!!!!!!!!!!')});
    this.testGroups = this.lightsGroups.infos;
    this.lightsGroups.loadAll();
  }
  onChartClick(event) {
    console.log(event);
  }
  ionViewDidLoad() {
    this.testGroups.subscribe(
      v => {console.log('GO!!!!!!!!!!!!!!!!!!!!!!!');console.log(v);}
    );
  }
  
  /** */
  goPatterns(goGid:number){   // lightsGroupsInfos .getGid(gid)
    this.navCtrl.push(subMain.pr1patternsNav, { "gid": goGid });
  }
  goDevices(goGid:number){
    this.navCtrl.push(subMain.pr1patternsNav, { "gid": goGid });
  }
  addLightsGroup(){

    let cursor = this.groupsInfo.length+1;
    this.lightsGroups.addNew(
      cursor,
      "養殖區"+cursor,
      (isScc,res)=>{if(isScc)console.log('YEAAAAAA');console.log(res);}
    );

    this.groupsInfo.unshift(
      {
        "gid": cursor,
        "name": "養殖區"+cursor,
        "lastSended": this.getRandomInt(1,59)+"min",
        "devicesTotal": 0,
        "chartDatas": {
          "colors": [this.getRandomColorsArr()],
          "datasets": [this.getRandomDatasetArr()]
        }
      }
    );
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
    "00:00","","03:00","","06:00","",
    "09:00","","12:00","","15:00","",
    "18:00","","21:00","","24:00"
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
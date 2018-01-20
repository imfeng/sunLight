import { Component, Renderer } from '@angular/core';
import { IonicPage,
  Platform,
  NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { EyeCheckControl } from '../eye-check/eye-check.control';

@IonicPage()
@Component({
  selector: 'page-start',
  templateUrl: 'start.html',
})
export class StartPage {
  start = false;
  constructor(
    public platform: Platform,
    private t: EyeCheckControl,
    public modalCtrl: ModalController,
    private screenOrientation: ScreenOrientation,
    public navCtrl: NavController,
    public navParams: NavParams) {

      // get current
      console.log('===== screenOrientation TYPE ====='); // logs the current orientation, example: 'landscape'
      console.log(this.screenOrientation.type); // logs the current orientation, example: 'landscape'

      if(this.platform.is('cordova')) {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      }

      // allow user rotate
      //this.screenOrientation.unlock();

      // detect orientation changes
      /*this.screenOrientation.onChange().subscribe(
        () => {
            console.log(">>> Orientation Changed");
        }
      );*/

  }
  startBtn() {
    this.start = true;
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad StartPage');
  }
  check () {
//    this.t.pSetAllTime();
    this.t.o();
    //this.t.open('fan', [new Uint8Array([1,60]),new Uint8Array([2,60]),new Uint8Array([3,60])]);
    // EyeCheckControl.open();
    /*
    this.navCtrl.push('EyeCheckPage');*/
  }
  go(index){
    this.navCtrl.setRoot(TabsPage,{"index":index});
  }
}


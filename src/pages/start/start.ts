import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

/**
 * Generated class for the StartPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-start',
  templateUrl: 'start.html',
})
export class StartPage {

  constructor(
    private screenOrientation: ScreenOrientation,
    public navCtrl: NavController,
    public navParams: NavParams) {

      // get current
      console.log('===== screenOrientation TYPE ====='); // logs the current orientation, example: 'landscape'
      console.log(this.screenOrientation.type); // logs the current orientation, example: 'landscape'

      // set to landscape
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

      // allow user rotate
      //this.screenOrientation.unlock();

      // detect orientation changes
      /*this.screenOrientation.onChange().subscribe(
        () => {
            console.log(">>> Orientation Changed");
        }
      );*/

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StartPage');
  }

  go(index){
    this.navCtrl.setRoot(TabsPage,{"index":index});
  }
}

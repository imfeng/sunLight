import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { FormsModule } from '@angular/forms';
import { BLE } from '@ionic-native/ble';

/* COMPONENT */
import { MyApp } from './app.component';
import { NumberPickerComponent } from '../components/number-picker/number-picker';


import { BleOperatorPageModule } from '../pages/ble-operator/ble-operator.module';
/* PAGES */
import { DevMode } from '../pages/dev-mode/dev-mode';
import { ModeManual } from '../pages/mode-manual/mode-manual';


import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';


/* IONIC NATIVE */
import { WheelSelector } from '@ionic-native/wheel-selector';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';

/* PROVIDERS */
import { LightsInfoProvider } from '../providers/lights-info/lights-info';

class WheelSelectorBrowser extends WheelSelector {

}

@NgModule({
  declarations: [
    NumberPickerComponent,

    ModeManual,
    DevMode,
    

    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,

  ],
  imports: [
    FormsModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),

    BleOperatorPageModule

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ModeManual,
    DevMode,

    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  providers: [
    BLE,
    { provide: WheelSelector, useClass: WheelSelectorBrowser},
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LightsInfoProvider
    
  ]
})
export class AppModule {}

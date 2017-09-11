import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { FormsModule } from '@angular/forms';
import { BLE } from '@ionic-native/ble';
//import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import { HttpModule } from '@angular/http';

/* COMPONENT */
import { MyApp } from './app.component';
import { NumberPickerComponent } from '../components/number-picker/number-picker';
import { LightsChartComponent } from '../components/lights-chart/lights-chart';

import { BleOperatorPageModule } from '../pages/ble-operator/ble-operator.module';

/* PAGES */
import { DevMode } from '../pages/dev-mode/dev-mode';
import { ModeManual } from '../pages/mode-manual/mode-manual';
import { ModeSchedulePageModule } from '../pages/mode-schedule/mode-schedule.module';
import { ModeDevicesPage } from '../pages/mode-devices/mode-devices';


import { ContactPage } from '../pages/contact/contact';

import { TabsPage } from '../pages/tabs/tabs';


/* IONIC NATIVE */
import { WheelSelector } from '@ionic-native/wheel-selector';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NativeStorage } from '@ionic-native/native-storage';

/* PROVIDERS */
//import { LightsInfoProvider,lightsTypesPipe } from '../providers/lights-info/lights-info';
import { LightsGoupsProvider } from '../providers/lights-goups/lights-goups';

import { PatternsDataProvider } from '../providers/patterns-data/patterns-data';
import { StorageMetaProvider } from '../providers/storage-meta/storage-meta';
import { SectionsDataProvider } from '../providers/sections-data/sections-data';
import { ToastCtrlProvider } from '../providers/toast-ctrl/toast-ctrl';
import { BleCtrlProvider } from '../providers/ble-ctrl/ble-ctrl';
import { BleCommandProvider } from '../providers/ble-command/ble-command';

class WheelSelectorBrowser extends WheelSelector {

}

@NgModule({
  declarations: [
    NumberPickerComponent,
    LightsChartComponent,

    
    ModeManual,
    ModeDevicesPage,
    DevMode,

    MyApp,
    ContactPage,
    TabsPage,
    

  ],
  exports:[

  ],
  imports: [
    HttpModule,
    ModeSchedulePageModule,

    FormsModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    

    BleOperatorPageModule

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    
    ModeManual,
    ModeDevicesPage,
    DevMode,

    MyApp,
    ContactPage,
    TabsPage
  ],
  providers: [
    AndroidPermissions,
    BLE,
    NativeStorage,
    { provide: WheelSelector, useClass: WheelSelectorBrowser},
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LightsGoupsProvider,
    PatternsDataProvider,
    StorageMetaProvider,
    SectionsDataProvider,
    ToastCtrlProvider,
    BleCtrlProvider,
    BleCommandProvider
    
  ]
})
export class AppModule {}

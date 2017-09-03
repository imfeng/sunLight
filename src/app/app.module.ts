import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { WheelSelector } from '@ionic-native/wheel-selector';

import { DevMode } from '../pages/dev-mode/dev-mode';
import { ModeManual } from '../pages/mode-manual/mode-manual';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { IonicStorageModule } from '@ionic/storage';
import { LightsInfoProvider } from '../providers/lights-info/lights-info';

class WheelSelectorBrowser extends WheelSelector {

}

@NgModule({
  declarations: [
    ModeManual,
    DevMode,

    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,

  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),

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
    { provide: WheelSelector, useClass: WheelSelectorBrowser},
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LightsInfoProvider
    
  ]
})
export class AppModule {}

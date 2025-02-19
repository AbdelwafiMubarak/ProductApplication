import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from './Layout/navbar/navbar.component';
import { LoginComponent } from './Component/login/login.component';
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, ButtonModule),
    provideRouter([
      { path: 'login', component: LoginComponent },
      { path: '', component: NavbarComponent },
    ]),
  ]
}).catch(err => console.error(err));
export class AppModule { }
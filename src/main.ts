

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations'; // ✅ Correct way to include animations

import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/Component/login/login.component';
import { RegisterComponent } from './app/Component/register/register.component';
import { GuestGuard } from './app/services/guest.guard';
import { HomeComponent } from './app/Component/home/home.component';
import { ProductListComponent } from './app/Component/productlist/productlist.component';
import { AuthGuard } from './app/services/auth.guard';
import { provideHttpClient } from '@angular/common/http';
import { CreateProductComponent } from './app/Component/createproduct/createproduct.component';
import { provideToastr, ToastrModule } from 'ngx-toastr';
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'productlist', component: ProductListComponent, canActivate: [AuthGuard] },
  { path: 'addproduct', component: CreateProductComponent, canActivate: [AuthGuard] },
];
bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(),
  provideRouter(routes),
  provideToastr(),
  provideAnimations(),
  ],
}).catch(err => console.error(err));





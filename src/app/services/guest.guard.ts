import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(private router: Router) { }



  canActivate(): boolean {
    const token = localStorage.getItem('authToken');

    if (token) {
      console.log('GuestGuard: User is logged in, redirecting...');
      //  this.router.navigate(['']); // Redirect logged-in users
      return false;
    }

    // console.log('GuestGuard: User is NOT logged in, allowing access.');
    return true;
  }
}
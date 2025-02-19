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
      return false;
    }
    return true;
  }
}
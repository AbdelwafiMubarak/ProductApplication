import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('authToken');

    if (!token) {
      // Redirect to login if no token found
      this.router.navigate(['/login']);
      return false;
    }

    return true; // Allow access if token exists
  }
}

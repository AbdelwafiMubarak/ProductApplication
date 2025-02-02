import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loggedIn = new BehaviorSubject<boolean>(false); // Default: user is logged out
    private UserNmae = new BehaviorSubject<string>(""); // Default: user is logged out
    isLoggedIn$ = this.loggedIn.asObservable(); // Observable for NavbarComponent
    private token = localStorage.getItem('authToken');
    constructor() {
        if (this.token !== null || this.token !== undefined) this.loggedIn.next(true);
    }
    login() {
        this.loggedIn.next(true);  // ✅ Set logged in
        //this.UserNmae.next(user??"");
    }

    logout() {
        this.loggedIn.next(false); // ✅ Set logged out
    }
}

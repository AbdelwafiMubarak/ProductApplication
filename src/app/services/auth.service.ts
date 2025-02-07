import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loggedIn = new BehaviorSubject<boolean>(false); // Default: user is logged out

    isLoggedIn$ = this.loggedIn.asObservable(); // Observable for NavbarComponent
    private token = localStorage.getItem('authToken');
    constructor() {
        // if (this.token !== null || this.token !== undefined) this.loggedIn.next(true);
        const token = localStorage.getItem('authToken');
        this.loggedIn.next(!!token); // ✅ Set true if token exist
    }
    // login() {
    //     this.loggedIn.next(true);  // ✅ Set logged in
    //     //this.UserNmae.next(user??"");
    // }
    login(token: string) {
        localStorage.setItem('authToken', token);
        this.loggedIn.next(true);
    }
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.loggedIn.next(false); // ✅ Set logged out
    }
}

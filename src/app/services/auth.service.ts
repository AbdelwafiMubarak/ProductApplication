import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loggedIn = new BehaviorSubject<boolean>(false);
    isLoggedIn$ = this.loggedIn.asObservable();
    private token = localStorage.getItem('authToken');
    constructor() {
        const token = localStorage.getItem('authToken');
        this.loggedIn.next(!!token);
    }
    login(token: string) {
        localStorage.setItem('authToken', token);
        this.loggedIn.next(true);
    }
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.loggedIn.next(false);
    }
}

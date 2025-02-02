
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // ✅ Import AuthService
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MenubarModule, RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  leftMenuItems: MenuItem[] = [];
  rightMenuItems: MenuItem[] = [];
  isLoggedIn = false;
  token = "";

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.token = localStorage.getItem('authToken') || '';
      this.updateMenu();
    });
  }

  updateMenu() {
    // Left Menu Items
    this.leftMenuItems = [
      { label: 'Home', icon: 'pi pi-home', routerLink: [''] },
      { label: 'Products', icon: 'pi pi-box', routerLink: ['/productlist'] },
      { label: 'Contact', icon: 'pi pi-envelope', routerLink: ['/contact'] }
    ];

    // Right Menu Items (Auth Section)
    this.rightMenuItems = this.isLoggedIn
      ? [
        { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
      ]
      : [
        { label: 'Login', icon: 'pi pi-sign-in', routerLink: ['/login'] },
        { label: 'Sign Up', icon: 'pi pi-user-plus', routerLink: ['/register'] }
      ];
  }

  logout() {
    localStorage.removeItem("authToken");
    this.authService.logout();
    this.router.navigate(['']); // Redirect to home after logout
  }

  handleCommand(event: MouseEvent, item: MenuItem) {
    if (item.command) {
      item.command({ originalEvent: event, item });
    }
  }
}


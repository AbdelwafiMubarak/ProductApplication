
import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { getEmailFromToken, getRoleFromToken, JwtUtilService } from '../../services/JwtUtilService';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MenubarModule, RouterModule, CommonModule, DialogModule, OverlayPanelModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  leftMenuItems: MenuItem[] = [];
  rightMenuItems: MenuItem[] = [];
  isLoggedIn = false;
  activeRoute = '';
  userEmail: string = '';
  @ViewChild('overlay') overlay!: OverlayPanel;
  constructor(private authService: AuthService, private router: Router,) { }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.updateMenu();
    });
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
      this.activeRoute = event.urlAfterRedirects;
    });
  }
  updateMenu() {
    this.leftMenuItems = this.isLoggedIn ? [
      { label: 'Home', icon: 'pi pi-home', routerLink: [''] },
      { label: 'Products', icon: 'pi pi-box', routerLink: ['/productlist'] },
      { label: 'Users', icon: 'pi pi-box', routerLink: ['/userlist'] },
    ] : [];
    this.rightMenuItems = this.isLoggedIn
      ? [
        { label: 'Logout', icon: 'pi pi-sign-out', command: (event) => this.showOverlay(event) }
        // { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
      ]
      : [
        { label: 'Login', icon: 'pi pi-sign-in', routerLink: ['/login'] },
        { label: 'Sign Up', icon: 'pi pi-user-plus', routerLink: ['/register'] }
      ];


  }
  showOverlay(event: any) {
    const token = localStorage.getItem('authToken') ?? "";
    this.userEmail = getEmailFromToken(token) ?? "";
    this.overlay.toggle(event.originalEvent);


  }
  isActive(route: string): boolean {
    return this.router.isActive(route, { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  }
  logout(overlay: any): void {
    localStorage.removeItem("authToken");
    this.authService.logout();
    overlay.hide();
    this.router.navigate(['']);
  }
  handleCommand(event: MouseEvent, item: MenuItem) {
    if (item.command) {
      item.command({ originalEvent: event, item });
    }
  }
}




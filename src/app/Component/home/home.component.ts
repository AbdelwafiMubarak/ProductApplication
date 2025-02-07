import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private router: Router) { }

  navigateTo(path: string) {

    this.router.navigateByUrl(`/${path}`);
  }
}

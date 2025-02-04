import { Component } from '@angular/core';
import { NavbarComponent } from "./Component/navbar/navbar.component";
import { RouterModule } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [NavbarComponent, RouterModule,]
})
export class AppComponent {
  title = 'ProductApplication';
}

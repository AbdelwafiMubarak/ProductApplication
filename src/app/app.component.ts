import { Component } from '@angular/core';
import { NavbarComponent } from "./Layout/navbar/navbar.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [NavbarComponent, RouterModule, CommonModule]
})
export class AppComponent {
  title = 'ProductApplication';
}

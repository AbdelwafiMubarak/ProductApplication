import { Component } from '@angular/core';
import { NavbarComponent } from "./Component/navbar/navbar.component";
import { RouterModule } from '@angular/router';
import { FooterComponent } from './Component/footer/footer.component';
import { CommonModule } from '@angular/common'; // Import CommonModule
@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [NavbarComponent, RouterModule, FooterComponent, CommonModule]
})
export class AppComponent {
  title = 'ProductApplication';
}

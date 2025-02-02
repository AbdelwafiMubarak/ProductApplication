import { Component } from '@angular/core';
import { NavbarComponent } from "./Component/navbar/navbar.component";
import { RouterModule } from '@angular/router';
import { ProductListComponent } from "./Component/productlist/productlist.component";
@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [NavbarComponent, RouterModule, ProductListComponent]
})
export class AppComponent {
  title = 'ProductApplication';
}

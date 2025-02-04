
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule, } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';  // ✅ Import Dialog
import { InputTextModule } from 'primeng/inputtext'; // ✅ Input Fields
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DropdownModule } from 'primeng/dropdown';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ViewChild } from '@angular/core';
import { JwtUtilService } from '../../services/JwtUtilService';

interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  createdBy: string;


}

@Component({
  selector: 'app-productlist',
  standalone: true,
  templateUrl: './productlist.component.html',
  styleUrls: ['./productlist.component.css'],
  imports: [CommonModule, TableModule, ButtonModule, CardModule, PanelModule, ConfirmDialogModule, FormsModule, DialogModule, InputTextModule, DropdownModule, FileUploadModule,],
  providers: [ConfirmationService, MessageService,]
})
export class ProductListComponent implements OnInit {
  @ViewChild('fileUpload', { static: false }) fileUpload: FileUpload | undefined;// 
  products: Product[] = [];
  loading: boolean = true;
  apiUrl = 'https://localhost:44394/api/Product/GetAllAsync'; // Replace with your API endpoint

  priceRanges = [
    { label: 'All', value: { min: 0, max: Infinity } },
    { label: 'Below $50', value: { min: 0, max: 50 } },
    { label: '$50 - $100', value: { min: 50, max: 100 } },
    { label: '$100 - $200', value: { min: 100, max: 200 } },
    { label: 'Above $200', value: { min: 200, max: Infinity } }
  ];
  priceRanges2 = ['All', 'Below $50', '$50 - $100', '$100 - $200', 'Above $200'];


  // selectedPriceRange: { min: number, max: number } | null = null;
  selectedPriceRange: any;


  // ✅ Variables for editing
  displayEditDialog: boolean = false;
  selectedProduct: Product = { id: 0, name: '', description: '', imageUrl: '', price: 0, createdBy: '' };

  selectedFile: File | null = null;
  fileError = false;
  currentUserEmail: string | null = null;
  constructor(private http: HttpClient, private router: Router, private confirmationService: ConfirmationService, private toastr: ToastrService, private jwtUtil: JwtUtilService) { }

  ngOnInit() {
    const tokenn = localStorage.getItem('authToken'); // Assuming the token is stored in localStorage
    this.currentUserEmail = this.jwtUtil.getEmailFromToken(tokenn || '');
    // console.log(this.currentUserEmail);

    this.fetchProducts();
  }
  filterText: string = "";
  fetchProducts(filter: string = "", priceRange: { min: number, max: number } | null = null) {


    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.loading = true;
    if (priceRange != null) {

      //console.log("filter price passed to the fetch");

      this.apiUrl = `https://localhost:44394/api/Product/GetProductPriceFilter?min=${priceRange.min}&max=${priceRange.max}`;
    }
    else {
      this.apiUrl = filter ?
        `https://localhost:44394/api/Product/SearchProductByName?name=${filter}`
        : this.apiUrl = `https://localhost:44394/api/Product/GetAllOrderdIdAsending`;
    }

    this.http.get<Product[]>(this.apiUrl, { headers }).subscribe({
      next: (response: any) => {
        if (response.statusCode != 200) {


          this.products = response.data;
          this.loading = false;
          this.showMessage(response.message || 'Something went wrong', 'error');
          return
        }
        this.products = response.data;


        this.loading = false;
        if (this.fileUpload) {
          this.fileUpload.clear();
        }

      },
      error: (error) => {
        this.showMessage(error.message || 'Something went wrong', 'error');
        console.error('Error fetching products:', error);
        this.loading = false;
      }
    });
  }

  editProduct(id: number) {
    // console.log(`Editing product ID: ${id}`);
    // this.selectedProduct = this.products.find(p => p.id === id) || { id: 0, name: '', description: '', imageUrl: '', price: 0, createdBy: '' };
    // var x = this.products.find(p => p.id === id) || { id: 0, name: '', description: '', imageUrl: '', price: 0 };
    // this.displayEditDialog = true;
    const productToEdit = this.products.find(p => p.id === id);
    if (productToEdit) {
      this.selectedProduct = structuredClone(productToEdit); // ✅ Deep copy
    }
    this.displayEditDialog = true;
  }

  // Handle file selection
  onFileChange(event: any) {
    // const file = event.target.files[0];
    const file = event.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileError = false; // Reset error if a file is selected
    }
  }

  goToAddProduct() {
    this.router.navigate(['/addproduct']);
  }

  saveProduct() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const form = new FormData();
    form.append('name', this.selectedProduct.name);
    form.append('description', this.selectedProduct.description);
    form.append('price', this.selectedProduct.price.toString());
    // form.append('file', this.selectedFile!);
    if (this.selectedFile) {
      form.append('file', this.selectedFile);
    } else {
      form.append('file', new Blob());  // Appending an empty file to represent null
    }

    this.http.put(`https://localhost:44394/api/Product/UpdateProductAsync/?id=${this.selectedProduct.id}`, form, { headers }).subscribe({
      next: (response: any) => {
        if (response.statusCode != 200) {
          this.showMessage(response.message || 'Something went wrong', 'error');
          return
        }
        this.showMessage(response.message || 'Product updated successfully', 'success');
        // console.log('Product updated successfully.');

        const index = this.products.findIndex(p => p.id === this.selectedProduct.id);
        if (index !== -1) {
          this.products[index] = structuredClone(this.selectedProduct);
        }





        this.selectedFile = null;
        if (this.fileUpload) {
          this.fileUpload.clear();
        }
        this.displayEditDialog = false;

        this.fetchProducts(); // Refresh list
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.showMessage(error.message || 'Something went wrong', 'error');
      }
    });
  }





  confirmDelete(id: number) {
    // console.log('confirm function.');
    this.confirmationService.confirm({

      message: 'Are you sure you want to delete this product?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteProduct(id);
      },
      reject: () => {
        // console.log('Delete action cancelled.');
      }
    });
  }
  deleteProduct(id: number) {

    const token = localStorage.getItem('authToken'); // Get token from localStorage

    // console.log(token || null);
    // console.log("token");
    // ✅ Add Authorization header if token exists
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(`Deleting product ID: ${id}`);
    this.http.delete(`https://localhost:44394/api/Product/DeleteProductAsync?Id=${id}`, { headers }).subscribe({
      next: (response: any) => {
        if (response.statusCode != 200) {
          this.showMessage(response.message || 'Something went wrong', 'error');
          return
        }
        this.products = this.products.filter(product => product.id !== id); // Remove from UI
        console.log('Product deleted successfully.');
        this.showMessage(response.message || 'Product deleted successfully', 'success');
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.showMessage(error.message || 'Something went wrong', 'error');
      }
    });
  }

  showMessage(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      this.toastr.success(message, 'Success'); // ✅ Success Toast
    } else {
      this.toastr.error(message, 'Error'); // ✅ Error Toast
    }
  }

  filterProducts() {
    // console.log("filterProducts");
    const filter = this.filterText;
    this.fetchProducts(filter);
  }


  filterProductsByPrice() {
    const filter = this.filterText;
    const priceRange: any = this.selectedPriceRange;

    if (priceRange.value.min === 0 && priceRange.value.max === Infinity) {
      // this.fetchProducts(filter, { 'min': 0, 'max': 10000000 });
      //this.fetchProducts(filter)
      this.resetFilter();
      // console.log(" 0 infenity");

      return;
    }
    if (priceRange.value.min === 200 && priceRange.value.max === Infinity) {
      this.fetchProducts(filter, { 'min': priceRange.value.min, 'max': 10000000 });
      // console.log(" 200 infenity");
      return;
    }

    this.fetchProducts(filter, { 'min': priceRange.value.min, 'max': priceRange.value.max });

  }



  onPriceRangeChange(event: any) {
    this.selectedPriceRange = event.value;
    this.filterProducts();
  }

  // 🔄 Reset Filter
  resetFilter() {
    this.filterText = "";
    this.fetchProducts();
  }

  blockInvalidInput(event: KeyboardEvent) {
    const invalidChars = ['e', 'E', '+', '-',];
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

}
// 

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-product',
  standalone: true,
  templateUrl: './createproduct.component.html',
  styleUrls: ['./createproduct.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    InputTextModule,
    ButtonModule,
    CardModule
  ]
})
export class CreateProductComponent {
  productForm: FormGroup;
  selectedFile: File | null = null;
  fileError = false;
  apiUrl = 'https://localhost:44394/api/Product/AddProductAsync';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public router: Router,
    private toastr: ToastrService,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      // file: ['', [Validators.required]]

    });
  }

  // Handle file selection
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileError = false; // Reset error if a file is selected
    }
  }

  onSubmit() {
    if (this.productForm.invalid || !this.selectedFile) {
      this.fileError = !this.selectedFile; // Show error if no file is selected
      this.showMessage('Please fill all fields correctly and select a file!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('file', this.selectedFile, this.selectedFile.name);

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(this.apiUrl, formData, { headers }).subscribe({
      next: (response: any) => {
        if (response.statusCode != 201) {
          this.showMessage(response.message || 'Something went wrong', 'error');
          return
        }
        this.showMessage('Product created successfully!', 'success');
        this.router.navigateByUrl('/productlist');
        this.productForm.reset();
        this.selectedFile = null; // Reset file after submission
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.showMessage(error.error?.message || 'Something went wrong.', 'error');
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
}

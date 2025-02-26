import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { ChangeDetectorRef, Component, HostListener, importProvidersFrom, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule, } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DropdownModule } from 'primeng/dropdown';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ViewChild } from '@angular/core';
import { JwtUtilService } from '../../services/JwtUtilService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PageFilterDTO, Product } from '../../Models/product';
import { debounceTime, Subject, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TooltipModule } from 'primeng/tooltip';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-productlist',
  standalone: true,
  templateUrl: './productlist.component.html',
  styleUrls: ['./productlist.component.css'],
  imports: [CommonModule, TableModule, ButtonModule, ReactiveFormsModule, ReactiveFormsModule, CardModule, PanelModule, ConfirmDialogModule, FormsModule, DialogModule, InputTextModule, DropdownModule, FileUploadModule, TooltipModule],
  providers: [ConfirmationService, MessageService,]
})
export class ProductListComponent implements OnInit {
  @ViewChild('fileUpload', { static: false }) fileUpload: FileUpload | undefined;// 
  @ViewChild('dt') dt: Table | undefined;
  products: Product[] = [];
  downloadproducts: Product[] = [];
  loading: boolean = true;
  showOptions: { [productId: number]: boolean } = {};
  apiUrl = '';
  UpdateUrl = environment.Product.UpdateProductAsyncURL;
  DeleteUrl = environment.Product.DeleteProductAsyncURL;
  productFilter: PageFilterDTO = {
    NameAscending: false,
    NameDecending: false,
    PriceMin: 0,
    PriceMax: 0,
    PageNumber: 1,
    PageSize: 5,
    Name_search: ''
  };
  totalRecords: number = 0;
  private filterSubject: Subject<string> = new Subject<string>();
  displayImagePopup: boolean = false;
  popupImageUrl: string = '';
  priceRanges = [
    { label: 'All', value: { min: 0, max: Infinity } },
    { label: 'Below $50', value: { min: 0, max: 50 } },
    { label: '$50 - $100', value: { min: 50, max: 100 } },
    { label: '$100 - $200', value: { min: 100, max: 200 } },
    { label: 'Above $200', value: { min: 200, max: Infinity } }
  ];
  priceRanges2 = ['All', 'Below $50', '$50 - $100', '$100 - $200', 'Above $200'];
  selectedPriceRange: any = null;
  displayEditDialog: boolean = false;
  selectedProduct: Product = { id: 0, name: '', description: '', imageUrl: '', price: 0, createdBy: '' };
  selectedFile: File | null = null;
  fileError = false;
  sortDirections: { [key: string]: 'asc' | 'desc' } = { name: 'asc', price: 'asc' }; // T
  fileErrorMessage: string = '';
  currentUserEmail: string | null = null;
  imageUrl: SafeUrl | null = null;
  //add new broduct
  addproductForm: FormGroup;
  addselectedFile: File | null = null;
  addfileError = false;
  addapiUrl = environment.Product.AddProductAsyncURL;
  fileUrl = environment.file.GetFileURL;
  addfileErrorMessage: string = '';
  addprductdailuge = false;
  constructor(private http: HttpClient, private router: Router, private confirmationService: ConfirmationService, private cdr: ChangeDetectorRef,
    private toastr: ToastrService, private jwtUtil: JwtUtilService, private messageService: MessageService, private sanitizer: DomSanitizer,
    private fb: FormBuilder,
  ) {
    this.addproductForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
    });
  }
  ngOnInit() {
    this.currentUserEmail = localStorage.getItem('user') ?? null;
    this.filterSubject.pipe(
      debounceTime(1000)
    ).subscribe(searchText => {
      this.filterText = searchText
      this.productFilter.Name_search = searchText;
      this.filterProductsByPrice();
    });

    this.newfetch();
  }
  onSearchChange() {
    this.filterSubject.next(this.filterText);
  }
  filterText: string = "";
  editProduct(id: number) {
    const productToEdit = this.products.find(p => p.id === id);
    this.selectedFile = null;
    if (this.fileUpload) {
      this.fileUpload.clear();
    }
    if (productToEdit) {
      this.selectedProduct = structuredClone(productToEdit);
    }
    setTimeout(() => {
      if (this.fileUpload) {
        this.fileUpload.clear();
      }
    });
    setTimeout(() => {
      if (this.selectedFile) {
        this.selectedFile = null
      }
    });
    this.displayEditDialog = true;
  }

  resetDialog() {
    this.selectedFile = null
    if (this.fileUpload) {
      this.fileUpload.clear();
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
    if (this.selectedFile) {
      form.append('file', this.selectedFile);
    } else {
      form.append('file', new Blob());
    }
    this.http.put(`${this.UpdateUrl}/?id=${this.selectedProduct.id}`, form, { headers }).subscribe({
      next: (response: any) => {
        if (response.statusCode != 200) {
          this.showMessage(response.message || 'Something went wrong', 'error');
          return
        }
        this.showMessage(response.message || 'Product updated successfully', 'success');
        const index = this.products.findIndex(p => p.id === this.selectedProduct.id);
        if (index !== -1) {
          this.products[index] = structuredClone(this.selectedProduct);
        }
        this.selectedProduct = { id: 0, name: '', description: '', imageUrl: '', price: 0, createdBy: '' };
        this.selectedFile = null;
        if (this.fileUpload) {
          this.fileUpload.clear();
        }
        this.displayEditDialog = false;
        this.newfetch();

      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.showMessage(error.message || 'Something went wrong', 'error');
      }
    });
  }
  confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this product?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteProduct(id);
      },
      reject: () => {
      }
    });
  }
  deleteProduct(id: number) {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.delete(`${this.DeleteUrl}?Id=${id}`, { headers }).subscribe({
      next: (response: any) => {
        if (response.statusCode != 200) {
          this.showMessage(response.message || 'Something went wrong', 'error');
          return
        }
        this.products = this.products.filter(product => product.id !== id);
        // console.log('Product deleted successfully.');
        this.showMessage(response.message || 'Product deleted successfully', 'success');
        this.newfetch();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.showMessage(error.message || 'Something went wrong', 'error');
      }
    });
  }
  showMessage(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      this.toastr.success(message, 'Success');
    } else {
      this.toastr.error(message, 'Error');
    }
  }
  filterProductsByPrice() {
    const filter = this.filterText;
    const priceRange: any = this.selectedPriceRange;
    if (priceRange) {
      if (priceRange.value.min === 0 && priceRange.value.max === Infinity) {
        this.productFilter.PriceMin = priceRange.value.min;
        this.productFilter.PriceMax = 100000000;
        this.newfetch()
        return;
      }

      if (priceRange.value.min === 0 && priceRange.value.max === 50) {
        this.productFilter.PriceMin = priceRange.value.min;
        this.productFilter.PriceMax = priceRange.value.max - 1;
        this.newfetch()
        return;
      }

      if (priceRange.value.min === 200 && priceRange.value.max === Infinity) {
        this.productFilter.PriceMin = priceRange.value.min;
        this.productFilter.PriceMax = 10000000;
        this.newfetch()
        return;
      }
      if (priceRange.value.min && priceRange.value.max) {

        this.productFilter.PriceMin = priceRange.value.min;
        this.productFilter.PriceMax = priceRange.value.max;
        this.newfetch()
        return;
      }
    }
    this.newfetch();

  }
  onPageChange(event: any) {
    this.productFilter.PageNumber = event.first / event.rows + 1;
    this.productFilter.PageSize = event.rows;
    this.newfetch();
  }
  resetFilter() {
    this.filterText = "";
    this.productFilter.NameAscending = false;
    this.productFilter.NameDecending = false;
    this.productFilter.PriceMin = 0;
    this.productFilter.PriceMax = 0;
    this.productFilter.PageNumber = 1;
    this.productFilter.PageSize = 5;
    this.productFilter.Name_search = '';
    this.selectedPriceRange = null;
    this.newfetch();
  }
  blockInvalidInput(event: KeyboardEvent) {
    const invalidChars = ['e', 'E', '+', '-',];
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  showImagePopup(imageUrl: string) {
    // console.log("showImagePopup");
    // console.log(imageUrl);

    this.loadImage(imageUrl)
    this.popupImageUrl = imageUrl;
    this.displayImagePopup = true;
  }
  hideImagePopup() {
    setTimeout(() => {
      this.displayImagePopup = false;
      this.imageUrl = null;
    }, 300);
  }
  async downloadAllProducts() {
    await this.fetchtodownload()
    // if (!this.downloadproducts || this.downloadproducts.length === 0) {
    if (!this.downloadproducts || this.downloadproducts.length === 0) {
      console.warn("No products available to download.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Product List', 14, 15);
    // const headers = [['ID', 'Name', 'Description', 'Price']];
    const headers = [['Name', 'Owner', 'Description', 'Price']];
    // const data = this.downloadproducts.map(p => [p.id, p.name, p.description, p.price]);
    const data = this.downloadproducts.map(p => [p.name, p.createdBy, p.description, p.price]);
    autoTable(doc, {
      startY: 25, // Position after the title
      head: headers,
      body: data,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' }
    });
    doc.save('Product_List.pdf');
    this.downloadproducts = [];
  }





  onFileChange(event: any) {
    this.fileErrorMessage = ''; // Reset error message
    const file = event.files[0];

    // Check if a file is selected
    if (!file) {
      this.fileErrorMessage = 'Please select a file.';
      return;
    }

    // Validate file size (3MB limit)
    if (file.size > 3145728) {
      this.fileErrorMessage = 'Maximum upload size is 3MB.';
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.fileErrorMessage = 'Only JPG and PNG images are allowed.';
      return;
    }

    this.selectedFile = file; // Store valid file
  }
  handleFileError(event: any) {
    this.fileErrorMessage = 'Error uploading file. Ensure it is a valid image and within the size limit.';
  }
  reseterr() {
    this.fileError = false
    this.selectedFile = null;

  }
  newfetch() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.loading = true;
    const encodedSearchQuery = encodeURIComponent(this.productFilter.Name_search ?? "");
    const role = localStorage.getItem('role') ?? "User";

    // console.log(role);
    // console.log("role");

    const EndPointUrl = role == "User" ? environment.Product.GetProductPageURL : environment.Product.AdminGetProductPageURL;
    // console.log("EndPointUrl");
    // console.log(this.productFilter.NameAscending);

    // this.apiUrl = `${environment.Product.GetProductPageURL}?NameAscending=${this.productFilter.NameAscending}&NameDecending=${this.productFilter.NameDecending}&PriceMin=${this.productFilter.PriceMin}&PriceMax=${this.productFilter.PriceMax}&PageNumber=${this.productFilter.PageNumber}&PageSize=${this.productFilter.PageSize}&Name_search=${encodedSearchQuery}`;
    this.apiUrl = `${EndPointUrl}?NameAscending=${this.productFilter.NameAscending}&NameDecending=${this.productFilter.NameDecending}&PriceMin=${this.productFilter.PriceMin}&PriceMax=${this.productFilter.PriceMax}&PageNumber=${this.productFilter.PageNumber}&PageSize=${this.productFilter.PageSize}&Name_search=${encodedSearchQuery}`;
    this.http.get<Product[]>(this.apiUrl, { headers, observe: 'response' }).subscribe({
      next: (response: any) => {
        if (response.body.statusCode != 200) {
          this.products = response.data;
          this.loading = false;
          this.showMessage(response.message || 'Something went wrong', 'error');
          return
        }
        this.products = response.body.data;
        const pagination = response.headers.get('pagination');
        if (pagination) {
          const paginationData = JSON.parse(pagination);
          this.totalRecords = paginationData.totalCount;
        }
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
  customSort1(field: 'name' | 'price') {
    // console.log(`Sorting by: ${field}, Direction: ${this.sortDirections[field]}`);

    this.products = [...this.products].sort((a, b) => {
      if (field === 'name') {
        return this.sortDirections[field] === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (field === 'price') {
        return this.sortDirections[field] === 'asc'
          ? a.price - b.price
          : b.price - a.price;
      }
      return 0;
    });

    // Toggle sorting direction
    this.sortDirections[field] = this.sortDirections[field] === 'asc' ? 'desc' : 'asc';
  }
  onSubmit() {
    if (this.addproductForm.invalid || !this.selectedFile) {
      this.fileError = !this.selectedFile; // Show error if no file is selected
      this.showMessage('Please fill all fields correctly and select a file!', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('name', this.addproductForm.get('name')?.value);
    formData.append('description', this.addproductForm.get('description')?.value);
    formData.append('price', this.addproductForm.get('price')?.value);
    formData.append('file', this.selectedFile, this.selectedFile.name);
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post(this.addapiUrl, formData, { headers }).subscribe({
      next: (response: any) => {
        if (response.statusCode != 201) {
          this.showMessage(response.message || 'Something went wrong', 'error');
          return
        }
        this.showMessage('Product created successfully!', 'success');
        // this.router.navigateByUrl('/productlist');
        this.addproductForm.reset();
        this.addselectedFile = null;
        this.addprductdailuge = false;
        // console.log(response);
        if (response.data) {
          setTimeout(() => {
            this.products = [...this.products, response.data]; // ✅ Adds the new product without mutating original array
          });
        }
        this.dt?.reset();
        this.newfetch();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.showMessage(error.error?.message || 'Something went wrong.', 'error');
      }
    });
  }
  adddilogswitch() {
    this.addprductdailuge = true;
  }
  addonFileChange(event: any) {
    this.addfileErrorMessage = '';
    const file = event.files[0];
    if (!file) {
      this.addfileErrorMessage = 'Please select a file.';
      return;
    }
    if (file.size > 3145728) {
      this.addfileErrorMessage = 'Maximum upload size is 3MB.';
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.addfileErrorMessage = 'Only JPG and PNG images are allowed.';
      return;
    }

    this.addselectedFile = file;
  }
  addhandleFileError(event: any) {
    this.addfileErrorMessage = 'Error uploading file. Ensure it is a valid image and within the size limit.';
  }
  loadImage(fileName: string) {
    // console.log("Downloading file:", fileName);
    const fileUrl = `${this.fileUrl}/${fileName}`;
    // console.log("File URL:", fileUrl);

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(fileUrl, { headers, responseType: 'blob' }).subscribe(
      blob => {
        // console.log("File downloaded successfully");

        const objectUrl = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);

        // console.log("Image URL:", this.imageUrl);
      },
      error => {
        console.error("Error loading image:", error);
      }
    );
  }
  fetchtodownload() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);


    const EndPointUrl = environment.Product.GetAllOrderdIdAsendingURL;

    this.http.get<Product[]>(EndPointUrl, { headers, observe: 'response' }).subscribe({
      next: (response: any) => {

        if (response.body.statusCode != 200) {


          this.showMessage(response.message || 'Download faild', 'error');
          return
        }
        if (response.body.statusCode == 200) {


          this.downloadproducts = response.body.data;
        }

      },

      error: (error) => {
        this.showMessage(error.message || 'Download faild ', 'error');
        console.error('Error fetching products to download:', error);
        this.loading = false;
      }
    });
  }
}




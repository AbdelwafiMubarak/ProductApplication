
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { Component, HostListener, importProvidersFrom, OnInit } from '@angular/core';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PageFilterDTO, Product } from '../../Models/product';
import { debounceTime, Subject } from 'rxjs';


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
  showOptions: { [productId: number]: boolean } = {};
  apiUrl = 'https://localhost:44394/api/Product/GetAllAsync'; // Replace with your API endpoint
  productFilter: PageFilterDTO = {
    NameAscending: true,
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
  // selectedPriceRange: { min: number, max: number } | null = null;
  selectedPriceRange: any = null;
  // ✅ Variables for editing
  displayEditDialog: boolean = false;
  selectedProduct: Product = { id: 0, name: '', description: '', imageUrl: '', price: 0, createdBy: '' };
  selectedFile: File | null = null;
  fileError = false;
  fileErrorMessage: string = '';
  currentUserEmail: string | null = null;
  constructor(private http: HttpClient, private router: Router, private confirmationService: ConfirmationService,
    private toastr: ToastrService, private jwtUtil: JwtUtilService, private messageService: MessageService) { }

  ngOnInit() {
    // const tokenn = localStorage.getItem('authToken'); // Assuming the token is stored in localStorage
    // this.currentUserEmail = this.jwtUtil.getEmailFromToken(tokenn || '');
    // console.log(this.currentUserEmail);
    // console.log("this.currentUserEmail");

    this.currentUserEmail = localStorage.getItem('user') ?? null;
    // console.log(this.currentUserEmail);
    this.filterSubject.pipe(
      debounceTime(1000)  // Wait for 1 second after the last input
    ).subscribe(searchText => {
      this.filterText = searchText
      this.productFilter.Name_search = searchText;
      this.filterProductsByPrice();
    });
    // this.fetchProducts();
    this.newfetch();
  }
  onSearchChange() {
    // Push the new search text to the subject
    this.filterSubject.next(this.filterText);
  }
  filterText: string = "";
  fetchProducts(filter: string = "", priceRange: { min: number, max: number } | null = null) {


    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.loading = true;
    if (priceRange != null) {

      //console.log("filter price passed to the fetch");

      this.apiUrl = `https://localhost:44388/productservice/product/GetProductFilteredAsync?min=${priceRange.min}&max=${priceRange.max}&name=${filter}`;
    }
    else {
      this.apiUrl = filter ?
        `https://localhost:44388/productservice/product/SearchProductByName?name=${filter}`
        : this.apiUrl = `https://localhost:44388/productservice/product/GetAllOrderdIdAsending`;
    }

    this.http.get<Product[]>(this.apiUrl, { headers }).subscribe({
      next: (response: any) => {
        if (response.statusCode != 200) {


          this.products = response.data;


          console.log(this.products.length);


          this.loading = false;
          this.showMessage(response.message || 'Something went wrong', 'error');
          return
        }
        this.products = response.data;
        this.totalRecords = this.products.length;

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
    this.selectedFile = null;
    if (this.fileUpload) {
      this.fileUpload.clear();  // This will clear the file input and remove any file preview
    }
    if (productToEdit) {
      this.selectedProduct = structuredClone(productToEdit); // ✅ Deep copy
    }
    setTimeout(() => {
      if (this.fileUpload) {
        this.fileUpload.clear(); // Ensure file upload is cleared
      }
    });
    setTimeout(() => {
      if (this.selectedFile) {
        this.selectedFile = null // Ensure file upload is cleared
      }
    });
    this.displayEditDialog = true;
  }

  // Handle file selection
  resetDialog() {
    this.selectedFile = null // Clear product data
    if (this.fileUpload) {
      this.fileUpload.clear(); // Reset file upload component
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

    this.http.put(`https://localhost:44388/productservice/product/UpdateProductAsync/?id=${this.selectedProduct.id}`, form, { headers }).subscribe({
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




        this.selectedProduct = { id: 0, name: '', description: '', imageUrl: '', price: 0, createdBy: '' };
        this.selectedFile = null;
        if (this.fileUpload) {
          this.fileUpload.clear();
        }
        this.displayEditDialog = false;
        this.newfetch()
        //this.fetchProducts(); // Refresh list
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
    // console.log(`Deleting product ID: ${id}`);
    this.http.delete(`https://localhost:44388/productservice/product/DeleteProductAsync?Id=${id}`, { headers }).subscribe({
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
    //this.fetchProducts(filter);
    const priceRange: any = this.selectedPriceRange;
    this.fetchProducts(filter, { 'min': priceRange.value.min, 'max': 10000000 });
  }


  // filterProductsByPrice() {
  //   const filter = this.filterText;
  //   const priceRange: any = this.selectedPriceRange;
  //   // console.log("start filterProductsByPrice");
  //   if (priceRange) {
  //     if (priceRange.value.min === 0 && priceRange.value.max === Infinity) {
  //       // this.fetchProducts(filter, { 'min': 0, 'max': 10000000 });
  //       //this.fetchProducts(filter)
  //       this.fetchProducts(filter, { 'min': priceRange.value.min, 'max': 0 });

  //       //this.resetFilter();
  //       // console.log(" 0 infenity");

  //       return;
  //     }

  //     if (priceRange.value.min === 0 && priceRange.value.max === 50) {
  //       // this.fetchProducts(filter, { 'min': 0, 'max': 10000000 });
  //       //this.fetchProducts(filter)
  //       this.fetchProducts(filter, { 'min': priceRange.value.min, 'max': priceRange.value.max - 1 });

  //       //this.resetFilter();
  //       // console.log(" 0 infenity");

  //       return;
  //     }


  //     if (priceRange.value.min === 200 && priceRange.value.max === Infinity) {
  //       this.fetchProducts(filter, { 'min': priceRange.value.min, 'max': 10000000 });
  //       // console.log(" 200 infenity");
  //       return;
  //     }
  //     if (priceRange.value.min && priceRange.value.max) {
  //       // console.log("start filv");
  //       this.fetchProducts(filter, { 'min': priceRange.value.min, 'max': priceRange.value.max });
  //       return;
  //     }
  //   }
  //   this.fetchProducts(filter);
  //   // console.log(" last");
  // }


  filterProductsByPrice() {
    const filter = this.filterText;
    const priceRange: any = this.selectedPriceRange;
    // console.log("start filterProductsByPrice");
    if (priceRange) {
      if (priceRange.value.min === 0 && priceRange.value.max === Infinity) {
        // this.fetchProducts(filter, { 'min': 0, 'max': 10000000 });
        //this.fetchProducts(filter)
        //this.fetchProducts(filter, { 'min': priceRange.value.min, 'max': 0 });
        this.productFilter.PriceMin = priceRange.value.min;
        this.productFilter.PriceMax = 100000000;
        //this.resetFilter();
        // console.log(" 0 infenity");
        this.newfetch()
        return;
      }

      if (priceRange.value.min === 0 && priceRange.value.max === 50) {
        // this.fetchProducts(filter, { 'min': 0, 'max': 10000000 });
        //this.fetchProducts(filter)
        // this.fetchProducts(filter, { 'min': priceRange.value.min, 'max': priceRange.value.max - 1 });
        this.productFilter.PriceMin = priceRange.value.min;
        this.productFilter.PriceMax = priceRange.value.max - 1;
        //this.resetFilter();
        // console.log(" 0 infenity");
        this.newfetch()
        return;
      }


      if (priceRange.value.min === 200 && priceRange.value.max === Infinity) {
        // this.fetchProducts(filter, { 'min': priceRange.value.min, 'max': 10000000 });
        // console.log(" 200 infenity");
        this.productFilter.PriceMin = priceRange.value.min;
        this.productFilter.PriceMax = 10000000;
        this.newfetch()
        return;
      }
      if (priceRange.value.min && priceRange.value.max) {
        // console.log("start filv");
        // this.fetchProducts(filter, { 'min': priceRange.value.min, 'max': priceRange.value.max });
        this.productFilter.PriceMin = priceRange.value.min;
        this.productFilter.PriceMax = priceRange.value.max;
        this.newfetch()
        return;
      }
    }
    this.newfetch();
    // this.fetchProducts(filter);
    // console.log(" last");
  }


  onPageChange(event: any) {
    // console.log("✅ onPageChange Triggered", event);
    this.productFilter.PageNumber = event.first / event.rows + 1;
    this.productFilter.PageSize = event.rows;
    this.newfetch();
    // console.log("onpagechange");

  }







  onPriceRangeChange(event: any) {
    this.selectedPriceRange = event.value;
    this.filterProducts();
  }

  // 🔄 Reset Filter
  resetFilter() {
    this.filterText = "";
    this.productFilter.NameAscending = true;
    this.productFilter.NameDecending = false;
    this.productFilter.PriceMin = 0;
    this.productFilter.PriceMax = 0;
    this.productFilter.PageNumber = 1;
    this.productFilter.PageSize = 5;
    this.productFilter.Name_search = '';
    this.selectedPriceRange = null;
    this.newfetch()
    //this.fetchProducts();
  }

  blockInvalidInput(event: KeyboardEvent) {
    const invalidChars = ['e', 'E', '+', '-',];
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }



  showImagePopup(imageUrl: string) {
    this.popupImageUrl = imageUrl;
    this.displayImagePopup = true;
  }

  hideImagePopup() {
    this.displayImagePopup = false;
  }


  // downloadSelectedProducts(id: number) {
  //   const selectedProducttodownload = this.products.find(p => p.id === id);
  //   if (!selectedProducttodownload) {
  //     // this.messageService.add({ severity: 'warn', summary: 'No Products Selected', detail: 'Please select at least one product.' });
  //     return;
  //   }

  //   const doc = new jsPDF();

  //   // Title
  //   doc.setFontSize(16);
  //   doc.text('Selected Product Details', 14, 15);

  //   // Prepare table headers
  //   const headers = [['ID', 'Name', 'Description', 'Price']];



  //   const data = [[
  //     selectedProducttodownload.id,
  //     selectedProducttodownload.name,
  //     selectedProducttodownload.description,
  //     selectedProducttodownload.price,

  //   ]];
  //   if (selectedProducttodownload.imageUrl) {
  //     // console.log(selectedProducttodownload.imageUrl);

  //     const img = new Image();
  //     img.src = selectedProducttodownload.imageUrl; // Image URL or Base64 data

  //     img.onload = () => {

  //       const extension = selectedProducttodownload.imageUrl.split('.').pop()?.toUpperCase();
  //       const supportedFormats = ['JPEG', 'JPG', 'PNG', 'WEBP'];

  //       // Default to 'JPEG' if the format is unsupported
  //       const format = supportedFormats.includes(extension!) ? extension! : 'JPEG';


  //       // Add the image to the PDF (x, y, width, height)




  //       autoTable(doc, {
  //         startY: 80, // Position after the title
  //         head: headers,
  //         body: data,
  //         theme: 'striped', // Optional: adds striped rows for better readability
  //         styles: {
  //           fontSize: 10,
  //           cellPadding: 3,
  //         },
  //         headStyles: {
  //           fillColor: [41, 128, 185], // Custom header color
  //           textColor: 255,
  //           fontStyle: 'bold',
  //         },
  //       });
  //       doc.addImage(img, format, 14, 25, 100, 50);
  //       // Save the PDF
  //       doc.save(`${selectedProducttodownload.name}.pdf`);
  //     }
  //   }
  // }






















  // onFileChange(event: any) {
  //   // const file = event.target.files[0];
  //   const file = event.files[0];
  //   if (file) {
  //     this.selectedFile = file;
  //     this.fileError = false; // Reset error if a file is selected
  //   }
  // }





  // onFileChange(event: any) {
  //   this.fileErrorMessage = ''; // Reset error message
  //   const file = event.files[0];
  //   this.fileError = false
  //   if (file && file.size > 3145728) { // 3MB size check
  //     this.fileError = true
  //     this.fileErrorMessage = 'Maximum upload size is 3 MB.';
  //     return
  //   }
  //   this.selectedFile = file;
  //   this.fileError = false
  // }

  // handleFileError(event: any) {
  //   this.fileError = true
  //   this.fileErrorMessage = '  Ensure it is a valid image and within the size limit.';
  // }


  downloadSelectedProducts(id: number) {
    const selectedProducttodownload = this.products.find(p => p.id === id);
    if (!selectedProducttodownload) {
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Selected Product Details', 14, 15);

    const headers = [['ID', 'Name', 'Description', 'Price']];
    const data = [[
      selectedProducttodownload.id,
      selectedProducttodownload.name,
      selectedProducttodownload.description,
      selectedProducttodownload.price,
    ]];

    // Generate table and capture the ending Y position
    autoTable(doc, {
      startY: 25, // Position after the title
      head: headers,
      body: data,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      didDrawPage: (data) => {
        const finalY = (data.cursor?.y ?? 80) + 10; // Position image 10 units below the table

        if (selectedProducttodownload.imageUrl) {
          fetch(selectedProducttodownload.imageUrl)
            .then(response => response.blob())
            .then(blob => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Image = reader.result as string;
                doc.addImage(base64Image, 'JPEG', 14, finalY, 100, 50);
                doc.save(`${selectedProducttodownload.name}.pdf`);
              };
              reader.readAsDataURL(blob);
            })
            .catch(error => {
              console.error('Error loading image:', error);
              doc.save(`${selectedProducttodownload.name}.pdf`); // Save even if image fails
            });
        } else {
          doc.save(`${selectedProducttodownload.name}.pdf`);
        }
      }
    });
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
  toggleOptions(productId: number) {
    this.showOptions[productId] = !this.showOptions[productId];
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    // If the clicked element is not inside the dropdown or the toggle button, close the dropdown
    const clickedElement = event.target as HTMLElement;
    if (!clickedElement.closest('.dropdown-container')) {
      this.showOptions = {}; // Close all dropdowns
    }
  }
  namesorting() {

    this.productFilter.NameAscending = !this.productFilter.NameAscending;
    this.productFilter.NameDecending = !this.productFilter.NameDecending;
    this.newfetch();
  }

  newfetch() {


    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.loading = true;


    // console.log("filter price passed to the fetch");

    this.apiUrl = `https://localhost:44388/productservice/product/GetProductPage?NameAscending=${this.productFilter.NameAscending}&NameDecending=${this.productFilter.NameDecending}&PriceMin=${this.productFilter.PriceMin}&PriceMax=${this.productFilter.PriceMax}&PageNumber=${this.productFilter.PageNumber}&PageSize=${this.productFilter.PageSize}&Name_search=${this.productFilter.Name_search}`;




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
          // console.log(pagination);

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


}



import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,          // Required for *ngIf and other directives
    ReactiveFormsModule,   // Required for formGroup
    HttpClientModule,      // Required for API calls
    MatSnackBarModule,     // Material Snackbar Module
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,

  ]
})
export class LoginComponent {
  private environment = environment;
  loginForm: FormGroup;
  apiUrl = 'https://localhost:44394/api/Account/Token';
  logedin = false;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)],],
    });
  }
  // Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$')
  onSubmit() {
    if (this.loginForm.invalid) {
      this.showMessage('Please fill all fields correctly!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('email', this.loginForm.value.email);
    formData.append('password', this.loginForm.value.password);

    this.http.post(this.apiUrl, formData)
      .subscribe({


        next: (response: any) => {
          console.log(this.apiUrl);
          // console.log(this.environment.Account.);

          if (response.statusCode != 201) {
            this.showMessage(response.message || 'Something went wrong', 'error');
            return
          }
          localStorage.setItem('authToken', response.data.token);
          let user: string = response.data.token
          this.showMessage(response.message || 'Login successful!', 'success');
          // this.authService.isLoggedIn$.subscribe((loggedIn) => {
          //   this.logedin = loggedIn
          // });
          console.log(`befor loged in :this.logedin`);
          this.authService.login(response.data.token);
          //this.authService.login();
          this.authService.isLoggedIn$.subscribe((loggedIn) => {
            this.logedin = loggedIn
          });
          console.log(`after loged in :this.logedin`);

          console.log(this.logedin);
          this.router.navigateByUrl('/');
          this.loginForm.reset();
        },
        error: (error) => {
          console.error('Login Error:', error);
          const errorMsg = error.error?.message || 'Something went wrong. Please try again.';
          this.showMessage(errorMsg, 'error');
        },
      });
  }

  ngOnInit() {
    this.loginForm.reset();

  }

  showMessage(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      this.toastr.success(message, 'Success'); // ✅ Success Toast
    } else {
      this.toastr.error(message, 'Error'); // ✅ Error Toast
    }
  }
}

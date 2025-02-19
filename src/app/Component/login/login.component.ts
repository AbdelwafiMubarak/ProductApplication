import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { matchPasswords, passwordStrengthValidator } from '../../Validators/Password_validator';
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    DialogModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSnackBarModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    MessagesModule,
    MessagesModule,
    ToastModule
  ], providers: [MessageService]
})
export class LoginComponent {
  private environment = environment;
  loginForm: FormGroup;
  resetForm: FormGroup;
  UpdatetForm: FormGroup;
  Email: string = "";
  apiUrlLogin = environment.Account.TokenURL;
  apiUrlsetPassword = environment.Account.SetPasswordURL;
  apiUrlForrgotPassword = environment.Account.ForrgotPasswordURL;
  logedin = false;
  displayResetDialog: boolean = false;
  updatepasswordDialog: boolean = false;
  messages: { severity: string; summary: string; detail: string }[] = [];
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private toastr: ToastrService,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)],],
    });
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.UpdatetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator()],],
      confirmpassword: ['', [Validators.required]],
      otp: ['', [Validators.required, Validators.minLength(6)],],
    },

      {
        validator: matchPasswords('password', 'confirmpassword')
      }
    );
  }
  ngOnInit() {
    this.loginForm.reset();
    this.resetForm.reset();
    this.UpdatetForm.reset();
  }
  onSubmit() {
    if (this.loginForm.invalid) {
      this.showMessage('Please fill all fields correctly!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('email', this.loginForm.value.email);
    formData.append('password', this.loginForm.value.password);
    this.http.post(this.apiUrlLogin, formData)
      .subscribe({
        next: (response: any) => {

          if (response.statusCode != 201) {
            this.showMessage(response.message || 'Something went wrong', 'error');
            return
          }
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('user', response.data.userName);
          let user: string = response.data.token;
          this.showMessage(response.message || 'Login successful!', 'success');
          this.authService.login(response.data.token);
          this.authService.isLoggedIn$.subscribe((loggedIn) => {
            this.logedin = loggedIn
          });

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


  openResetDialog() {
    this.resetForm.reset();
    this.displayResetDialog = true;
  }

  onForgotPassword() {
    if (this.resetForm.invalid) return;
    const formData = new FormData();
    formData.append('Email', this.resetForm.value.email);
    this.http.post(this.apiUrlForrgotPassword, formData)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode != 200) {
            this.showMessage(response.message || 'Something went wrong', 'error');
            return
          }
          this.showMessage(response.message || 'Login successful!', 'success');
          this.loginForm.reset();
          this.resetForm.reset();
          this.UpdatetForm.reset();
          this.displayResetDialog = false
          this.updatepasswordDialog = true
        },
        error: (error) => {
          console.error('Login Error:', error);
          const errorMsg = error.error?.message || 'Something went wrong. Please try again.';
          this.showMessage(errorMsg, 'error');
        },
      });


  }

  onSetPassword() {
    if (this.UpdatetForm.invalid) return;
    const formData = new FormData();
    formData.append('email', this.UpdatetForm.value.email);
    formData.append('opt', this.UpdatetForm.value.otp);
    formData.append('password', this.UpdatetForm.value.password);
    this.http.put(this.apiUrlsetPassword, formData)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode != 200) {
            this.showMessage(response.message || 'Something went wrong', 'error');
            return
          }
          this.showMessage(response.message || 'Login successful!', 'success');
          this.loginForm.reset();
          this.resetForm.reset();
          this.UpdatetForm.reset();
          this.displayResetDialog = false
          this.updatepasswordDialog = false
          this.router.navigateByUrl('/login');
        },
        error: (error) => {
          console.error('Login Error:', error);
          const errorMsg = error.error?.message || 'Something went wrong. Please try again.';
          this.showMessage(errorMsg, 'error');
        },
      });
  }

  showMessage(message: string, type: 'success' | 'error') {
    if (type === "success") {
      this.messageService.add({
        severity: type,
        summary: type === 'success' ? 'Success' : 'Error',
        detail: message,
        life: 3000,
        sticky: false,
        closable: false
      });
      return
    }
    this.messageService.add({
      severity: type,
      summary: 'Error',
      detail: message,
      life: 3000,
      sticky: true,
      closable: true
    });
  }
}

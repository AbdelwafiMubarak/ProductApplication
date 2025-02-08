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
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { passwordStrengthValidator } from '../../Validators/Password_validator';
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
  apiUrlLogin = 'https://localhost:44394/api/Account/Token';
  apiUrlsetPassword = 'https://localhost:44394/api/Account/SetPassword';
  apiUrlForrgotPassword = 'https://localhost:44394/api/Account/ForgetPassword';
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
      otp: ['', [Validators.required, Validators.minLength(6)],],

    });

  }
  ngOnInit() {
    this.loginForm.reset();
    this.resetForm.reset();
    this.UpdatetForm.reset();


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

    this.http.post(this.apiUrlLogin, formData)
      .subscribe({


        next: (response: any) => {
          //  console.log(this.apiUrl);
          // console.log(this.environment.Account.);

          if (response.statusCode != 201) {
            this.showMessage(response.message || 'Something went wrong', 'error');
            return
          }
          localStorage.setItem('authToken', response.data.token);

          localStorage.setItem('user', response.data.userId);
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
    this.resetForm.reset(); // Clear previous input
    this.displayResetDialog = true;
  }


  onForgotPassword() {
    if (this.resetForm.invalid) return;
    const formData = new FormData();
    formData.append('Email', this.resetForm.value.email);


    this.http.post(this.apiUrlForrgotPassword, formData)
      .subscribe({


        next: (response: any) => {
          // console.error('response:', response);

          if (response.statusCode != 200) {
            this.showMessage(response.message || 'Something went wrong', 'error');
            return
          }



          this.showMessage(response.message || 'Login successful!', 'success');

          // console.log("befor route");


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
          // console.error('response:', response);

          if (response.statusCode != 200) {
            this.showMessage(response.message || 'Something went wrong', 'error');
            return
          }



          this.showMessage(response.message || 'Login successful!', 'success');

          // console.log("befor route");
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
        life: 3000,// Auto-hide after 3 seconds
        sticky: false,
        closable: false
      });
      return
    }

    this.messageService.add({
      severity: type,
      summary: 'Error',
      detail: message,
      life: 3000,// Auto-hide after 3 seconds
      sticky: true,
      closable: true
    });
  }


}

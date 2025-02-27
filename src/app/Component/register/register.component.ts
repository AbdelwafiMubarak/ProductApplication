import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import { matchPasswords, passwordStrengthValidator } from '../../Validators/Password_validator';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { CheckboxModule } from 'primeng/checkbox';
@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule, CheckboxModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSnackBarModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    MessagesModule,
    MessagesModule,
    ToastModule,

  ], encapsulation: ViewEncapsulation.None,
  providers: [MessageService]
})
export class RegisterComponent {
  registerForm: FormGroup;
  apiUrl = environment.Account.RegisterURL;
  messages: { severity: string; summary: string; detail: string }[] = [];
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private toastr: ToastrService,
    private messageService: MessageService,
    private authService: AuthService,
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator()],],
      confirmpassword: ['', [Validators.required, Validators.minLength(6)],],
      isAdmin: [false],
    },
      {
        validator: matchPasswords('password', 'confirmpassword')
      }
    );
  }
  get password() {
    return this.registerForm.get('password');
  }
  ngOnInit() {
    this.registerForm.reset();
  }
  onSubmit() {
    const requestData = {
      FirstName: this.registerForm.value.firstName,
      Email: this.registerForm.value.email,
      Password: this.registerForm.value.password,
      // isAdmin: this.registerForm.value.isAdmin ?? false
    };
    this.http.post(this.apiUrl, requestData, {
      headers: { 'Content-Type': 'application/json' }
    }
    )
      .subscribe({
        next: (response: any) => {
          // console.log("next:");
          // console.log(response.success);
          // console.log(response.message);
          if (response.statusCode != 201) {
            this.showMessage(response.message || 'Something went wrong', 'error');
            return
          }
          this.showMesssage(response.message, 'success');
          this.router.navigateByUrl('/login');
          this.registerForm.reset();






        }, // Clear form after success}
        error: error => {
          const errorMsg = error.error?.message || "Something went wrong. Please try again.";
          this.showMessage(errorMsg, 'error');
        }
      });
  }

  showMesssage(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      this.toastr.success(message, 'Success'); // ✅ Success Toast
    } else {
      this.toastr.error(message, 'Error'); // ✅ Error Toast
    }
  }
  showMessage(message: string, type: 'success' | 'error') {
    this.messageService.add({
      severity: type,
      summary: type === 'success' ? 'Success' : 'Error',
      detail: message,
      life: 3000,// Auto-hide after 3 seconds
      sticky: true,
      closable: true
    });
  }
  clickcheck() {
    console.log(this.registerForm.value.isAdmin);

  }
}


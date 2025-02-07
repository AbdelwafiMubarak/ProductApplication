import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import { passwordStrengthValidator } from '../../Validators/Password_validator';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
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
  ], encapsulation: ViewEncapsulation.None,
  providers: [MessageService]
})
export class RegisterComponent {
  registerForm: FormGroup;
  apiUrl = 'https://localhost:44394/api/Account/Register';
  messages: { severity: string; summary: string; detail: string }[] = [];
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private toastr: ToastrService,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator()],],
    });
  }
  get password() {
    return this.registerForm.get('password');
  }
  ngOnInit() {
    this.registerForm.reset();

  }

  onSubmit() {
    console.log("sumitting:");
    const formData = new FormData();
    formData.append("FirstName", this.registerForm.value.firstName);  // 👈 Make sure field names match API
    formData.append("email", this.registerForm.value.email);
    formData.append("password", this.registerForm.value.password);

    const headers = {};
    this.http.post('https://localhost:44394/api/Account/Register', formData, { headers })
      .subscribe({
        next: (response: any) => {
          // this.isSubmitting = false;
          console.log("next:");
          console.log(response.success);
          console.log(response.message);

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

}


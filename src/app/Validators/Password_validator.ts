import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

// ✅ Custom Password Validator
export function passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.value;

        if (!password) {
            return null; // Skip validation if the field is empty (handled by required validator)
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isValidLength = password.length >= 6;

        const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isValidLength;

        return passwordValid
            ? null
            : {
                passwordStrength: {
                    hasUpperCase,
                    hasLowerCase,
                    hasNumber,
                    hasSpecialChar,
                    isValidLength,
                },
            };
    };
}


export function matchPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (formGroup: FormGroup) => {
        const password = formGroup.get(passwordKey);
        const confirmPassword = formGroup.get(confirmPasswordKey);

        if (confirmPassword?.errors && !confirmPassword.errors['passwordMismatch']) {
            return;
        }

        if (password?.value !== confirmPassword?.value) {
            confirmPassword?.setErrors({ passwordMismatch: true });
        } else {
            confirmPassword?.setErrors(null);
        }
    };
}

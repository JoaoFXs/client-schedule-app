import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class PasswordValidationUtils {
   hasUpperCase(val: string) { return /[A-Z]/.test(val); }
  hasLowerCase(val: string) { return /[a-z]/.test(val); }
  hasNumber(val: string) { return /[0-9]/.test(val); }
  hasSpecial(val: string) { return /[!@#$%^&*]/.test(val); }
}

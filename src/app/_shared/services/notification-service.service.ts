import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root',
})
export class NotificationServiceService {
  
  constructor(private snackBar: MatSnackBar) {
  }

  public showMessage(message: string, action: string = "OK") {
    this.snackBar.open(message, action,{
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

}

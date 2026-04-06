import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";



export const matchPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    //Acessa os FormControls pelo nome
    const passwordControl = control.get('password');
    const confirmPasswordControl = control.get('passwordConfirmation');

    //Garante que os controles existam
    if(!passwordControl || !confirmPasswordControl){
        return null;
    }

    // Se os valores não baterem, retorna o objeto de erro
    if(passwordControl.value !== confirmPasswordControl.value){
        return {'mismatch': true}
    }

    //Se os valores baterem, retorna null (válido)
    return null;
}
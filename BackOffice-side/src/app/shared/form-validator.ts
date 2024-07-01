export class FormValidator {
  constructor(formGroup) {
    this.formGroup = formGroup;
  }

  formGroup;

  isControlValid(controlName: string, controls?: any): boolean {
    const control = (controls || this.formGroup).controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string, controls?: any): boolean {
    const control = (controls || this.formGroup).controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName, controls?: any): boolean {
    const control = (controls || this.formGroup).controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName, controls?: any): boolean {
    const control = (controls || this.formGroup).controls[controlName];
    return control.dirty || control.touched;
  }
}

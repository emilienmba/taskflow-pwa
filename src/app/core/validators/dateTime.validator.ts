// validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class DateTimeValidators {

  static dateInRange(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // No error if the field is empty (handled by Validators.required if necessary)
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for date comparison

      const inputDate = new Date(control.value);
      inputDate.setHours(0,0,0,0);

      const oneYearFromToday = new Date();
      oneYearFromToday.setFullYear(today.getFullYear() + 1);
      oneYearFromToday.setHours(23, 59, 59, 999); // End of the day

      if (inputDate < today) {
        return { dateTooEarly: true };
      }

      if (inputDate > oneYearFromToday) {
        return { dateTooLate: true };
      }

      return null; // Date is valid
    };
  }
    //No need for now, we keep the constraint in onSubmit
  /*static timeFormat(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null; // Optional field
            }

            // Regular expression to match HH:mm format
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

            if (!timeRegex.test(control.value)) {
                return { invalidTimeFormat: true };
            }

            return null;
        };
    }*/

    static timeRequiredWithDate(dateControlName: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const dateControl = control.root.get(dateControlName);

            if (dateControl && dateControl.value && !control.value) {
                return { timeRequired: true };
            }

            return null;
        };
    }
}
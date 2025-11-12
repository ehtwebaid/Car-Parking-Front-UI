import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function setuserInfo(data: any) {
  localStorage.setItem('userInfo', JSON.stringify(data)); // ✅ Store token

}

export function getuserInfo() {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
}

export function setToken(token: any) {
  localStorage.setItem('parking-app-token', token); // ✅ Store token

}

export function getToken() {
  const token = localStorage.getItem('parking-app-token');
  return token || null;

}
export function clearToken() {
  localStorage.removeItem('parking-app-token'); // ✅ Store token

}
export function clearUserInfo() {
  localStorage.removeItem('userInfo'); // ✅ Store token

}
export function endDateAfterStartDate(startDateField: string, endDateField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const startDate = group.get(startDateField)?.value;
    const endDate = group.get(endDateField)?.value;

    if (!startDate || !endDate) {
      return null;  // Skip validation if fields are empty
    }

    const start = new Date(startDate?.year, (startDate?.month - 1), startDate?.day);
    const end = new Date(endDate?.year, (endDate?.month - 1), endDate?.day);
    //console.log(start);

    return end >= start ? null : { endDateInvalid: true };
  };
}
export function atLeastOneSlotValidator(control: AbstractControl): ValidationErrors | null {
  const weekday = control.get('weekday_slot')?.value;
  const weekend = control.get('weekend_slot')?.value;
  return weekday || weekend ? null : { slotRequired: true };
}
export function endTimeAfterStartTimeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('start_time')?.value;
    const end = group.get('end_time')?.value;
    if (!start || !end) return null; // Skip if either is empty

    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;

    return endMinutes > startMinutes ? null : { endBeforeStart: true };
  };
}
export function atLeastOneFileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value && value.length > 0) {
      return null; // valid
    }
    return { required: true }; // invalid
  };
}
export function requiredNoWhitespace(control: AbstractControl): ValidationErrors | null {
  if (control.value == null) {
    return { required: true };
  }

  return control.value.toString().trim().length === 0 ? { required: true } : null;
}
export function passwordMatchValidator(password: string, confirmPassword: string): ValidatorFn {
  console.log("FII");
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const pass = formGroup.get(password)?.value;
    const confirmPass = formGroup.get(confirmPassword)?.value;

    if (pass && confirmPass && pass !== confirmPass) {
      return { passwordMismatch: true };
    }
    return null;
  };
}
export function maxFieldValidator(totalField: string, evField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const total = group.get(totalField)?.value;
    const ev = group.get(evField)?.value;

    if (total != null && ev != null && ev > total) {
      return { maxFieldExceeds: true };
    }
    return null;
  };
}

export function divisibleBy30Validator(min_booking_duration:any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value =  control.get(min_booking_duration)?.value;
    console.log(value);

    if (value == null || value === '') {
      return null; // skip if empty (let required handle it)
    }

    if (value % 30 !== 0) {
      return { notDivisibleBy30: true };
    }

    return null;
  };
}


export function maxUploads()
{
  return 5;
}
export function maxSIZEMB()
{
  return 2;
}
export const limit=10;
export function setParkingSpaceID(id:any)
{
    localStorage.setItem('parking-space-id', id); // ✅ Store token
}
export function getParkingSpaceID()
{
    const val = localStorage.getItem('parking-space-id');
    return val ? Number(val) : null;
}
export const months_arr =['Jan','Feb','Mar','Apr','May','June','Jul','Aug','Sep','Oct','Nov','Dec'];
export const quarters_arr =['Jan-Apr','May-Aug','Sep-Dec'];

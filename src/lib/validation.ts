export function collapseSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function onlyDigits(value: string, max?: number) {
  const digits = value.replace(/\D/g, '');
  return typeof max === 'number' ? digits.slice(0, max) : digits;
}

export function onlyNameChars(value: string, max = 50) {
  return value.replace(/[^A-Za-z .']/g, '').slice(0, max);
}

export function onlyCityChars(value: string, max = 40) {
  return value.replace(/[^A-Za-z .]/g, '').slice(0, max);
}

export function sanitizeSearch(value: string, max = 80) {
  return value.replace(/[<>]/g, '').slice(0, max);
}

export function sanitizeCoupon(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 16);
}

export function formatCardNumber(value: string) {
  return onlyDigits(value, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value: string) {
  const digits = onlyDigits(value, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isValidEmail(value: string) {
  const email = value.trim();
  return email.length <= 80 && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

export function isValidMobile(value: string) {
  return /^[6-9]\d{9}$/.test(value.trim());
}

export function isValidPincode(value: string) {
  return /^[1-9]\d{5}$/.test(value.trim());
}

export function isValidUpi(value: string) {
  return /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(value.trim());
}

export function luhnCheck(number: string) {
  const digits = onlyDigits(number);
  if (digits.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function personNameError(value: string) {
  const name = collapseSpaces(value);
  if (!name) return 'Enter your full name';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 50) return 'Name cannot exceed 50 characters';
  if (!/^[A-Za-z][A-Za-z .']+$/.test(name)) return 'Name can only contain letters';
  return null;
}

export function emailError(value: string) {
  const email = value.trim();
  if (!email) return 'Enter your email address';
  if (!isValidEmail(email)) return 'Enter a valid email address';
  return null;
}

export function mobileError(value: string) {
  const mobile = onlyDigits(value, 10);
  if (!mobile) return 'Enter your mobile number';
  if (!isValidMobile(mobile)) return 'Enter a valid 10-digit Indian mobile number';
  return null;
}

export function loginIdError(value: string) {
  const id = value.trim();
  if (!id) return 'Enter your email or mobile number';
  if (isValidEmail(id) || isValidMobile(id)) return null;
  return 'Enter a valid email or 10-digit mobile number';
}

export function passwordError(value: string, { requiredStrong = false } = {}) {
  if (!value) return 'Enter your password';
  if (value.length > 64) return 'Password cannot exceed 64 characters';
  if (requiredStrong) {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
      return 'Password must include letters and a number';
    }
  }
  return null;
}

export function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function passwordHint(password: string) {
  if (password.length < 8) return 'Use at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Add an uppercase letter';
  if (!/\d/.test(password)) return 'Add a number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Add a special character for a stronger password';
  return 'Strong password';
}

export function isStrongPassword(password: string) {
  return password.length >= 8 && password.length <= 64 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function pincodeError(value: string) {
  const pin = onlyDigits(value, 6);
  if (!pin) return 'Enter a 6-digit pincode';
  if (!isValidPincode(pin)) return 'Enter a valid 6-digit Indian pincode';
  return null;
}

export function addressLineError(value: string) {
  const address = collapseSpaces(value);
  if (!address) return 'Enter your address';
  if (address.length < 8) return 'Address must be at least 8 characters';
  if (address.length > 120) return 'Address cannot exceed 120 characters';
  if (!/[A-Za-z0-9]/.test(address)) return 'Enter a valid address';
  return null;
}

export function localityError(value: string) {
  const locality = collapseSpaces(value);
  if (!locality) return null;
  if (locality.length < 2) return 'Locality must be at least 2 characters';
  if (locality.length > 40) return 'Locality cannot exceed 40 characters';
  return null;
}

export function cityError(value: string) {
  const city = collapseSpaces(value);
  if (!city) return 'Enter your city';
  if (city.length < 2) return 'City must be at least 2 characters';
  if (city.length > 40) return 'City cannot exceed 40 characters';
  if (!/^[A-Za-z][A-Za-z .]+$/.test(city)) return 'City can only contain letters';
  return null;
}

export function couponFormatError(value: string) {
  const code = sanitizeCoupon(value);
  if (!code) return 'Enter a coupon code';
  if (code.length < 4) return 'Coupon code must be at least 4 characters';
  if (!/^[A-Z0-9]{4,16}$/.test(code)) return 'Use letters and numbers only';
  return null;
}

export function upiError(value: string) {
  const upi = value.trim();
  if (!upi) return 'Enter your UPI ID';
  if (!isValidUpi(upi)) return 'Enter a valid UPI ID like name@oksbi';
  return null;
}

export function cardNumberError(value: string) {
  const digits = onlyDigits(value, 16);
  if (!digits) return 'Enter your card number';
  if (digits.length !== 16) return 'Card number must be 16 digits';
  if (!luhnCheck(digits)) return 'Enter a valid card number';
  return null;
}

export function cardNameError(value: string) {
  const name = collapseSpaces(value);
  if (!name) return 'Enter the name printed on the card';
  return personNameError(name);
}

export function cardExpiryError(value: string) {
  const raw = onlyDigits(value, 4);
  if (raw.length !== 4) return 'Enter expiry as MM/YY';
  const month = Number(raw.slice(0, 2));
  const year = Number(raw.slice(2));
  if (month < 1 || month > 12) return 'Enter a valid expiry month';
  const now = new Date();
  const exp = new Date(2000 + year, month);
  if (exp <= now) return 'Card has expired';
  return null;
}

export function cvvError(value: string) {
  const cvv = onlyDigits(value, 4);
  if (!/^\d{3,4}$/.test(cvv)) return 'Enter a valid 3-digit CVV';
  return null;
}

export function searchQueryError(value: string) {
  const q = collapseSpaces(value);
  if (!q) return null;
  if (q.length < 2) return 'Type at least 2 characters to search';
  return null;
}

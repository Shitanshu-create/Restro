const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



export const AUTH_RULES = {
  name: 'Name must be 2-60 characters.',
  email: 'Email must be valid and 254 characters or less.',
  password: 'Password must be 8-128 characters.'
};



function validateEmail(email) {
  if (!email) return 'Email is required';
  if (email.length > 254) return 'Email must be 254 characters or less';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address';
  return null;
}



function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password must be 128 characters or less';
  return null;
}



export function validateRegisterInput({ name, email, password, role }) {
  const values = {
    name: (name || '').trim(),
    email: (email || '').trim(),
    password,
    role: (role || 'waiter').trim().toLowerCase()
  };
  if (!values.name) return { message: 'Name is required' };
  if (values.name.length < 2) return { message: 'Name must be at least 2 characters' };
  if (values.name.length > 60) return { message: 'Name must be 60 characters or less' };
  if (!['admin', 'chef', 'waiter'].includes(values.role)) {
    return { message: 'Please select a valid staff role' };
  }
  const emailError = validateEmail(values.email);
  if (emailError) return { message: emailError };
  const passwordError = validatePassword(values.password);
  if (passwordError) return { message: passwordError };
  return { values };
}
export function validateLoginInput({ email, password }) {
  const values = {
    email: (email || '').trim(),
    password
  };
  const emailError = validateEmail(values.email);
  if (emailError) return { message: emailError };
  const passwordError = validatePassword(values.password);
  if (passwordError) return { message: passwordError };
  return { values };
}
export const USERNAME_PATTERN = /^[a-z0-9._]{3,32}$/;

export const USERNAME_RULES =
  "Username must be 3-32 characters and use only lowercase letters, numbers, dots or underscores.";

export const normalizeUsername = (value: string) =>
  value.trim().toLowerCase();

export const isValidUsername = (value: string) =>
  USERNAME_PATTERN.test(value);

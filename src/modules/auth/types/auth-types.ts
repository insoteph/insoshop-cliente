export type LoginRequest = {
  username: string;
  password: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type LoginResponse = {
  token: string;
  refreshToken: string | null;
  expiration: string;
  requirePasswordChange: boolean;
};

export type LoginSession = {
  token: string;
  expiration: string;
  requirePasswordChange: boolean;
  refreshToken: string | null;
};

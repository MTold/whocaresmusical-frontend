export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  userImage?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  email?: string;
  userImage?: string;
}
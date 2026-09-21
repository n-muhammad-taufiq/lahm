export interface SendOtpResult {
  success: boolean;
  phoneNumber: string;
  message?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  idToken: string;
  phoneNumber: string;
  isMock?: boolean;
}

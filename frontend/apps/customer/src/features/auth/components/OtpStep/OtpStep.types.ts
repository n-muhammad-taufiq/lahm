export interface OtpStepProps {
  otpCode: string;
  onOtpCodeChange: (code: string) => void;
  countryCode: string;
  phoneNumber: string;
  onVerify: () => void;
  onResend: () => void;
  onChangeNumber: () => void;
  secondsLeft: number;
  loading?: boolean;
  errorMessage?: string;
}

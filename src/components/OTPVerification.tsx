import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { ArrowLeft, Shield } from 'lucide-react';

interface OTPVerificationProps {
  phone: string;
  onVerified: () => void;
}

export function OTPVerification({ phone, onVerified }: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleVerify = () => {
    if (otp.length === 6) {
      // Mock verification - in real app, verify with backend
      onVerified();
    }
  };

  const handleResend = () => {
    setTimeLeft(30);
    setCanResend(false);
    setOtp('');
  };

  return (
    <div className="size-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-white">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="size-5" />
            Verify OTP
          </CardTitle>
          <CardDescription>
            We've sent a 6-digit code to {phone}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP value={otp} onChange={setOtp} maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button 
            onClick={handleVerify} 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={otp.length !== 6}
          >
            Verify
          </Button>

          <div className="text-center">
            {!canResend ? (
              <p className="text-sm text-muted-foreground">
                Resend code in {timeLeft}s
              </p>
            ) : (
              <Button variant="link" onClick={handleResend} className="text-green-600">
                Resend Code
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
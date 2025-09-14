import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Smartphone, Leaf } from 'lucide-react';
import { auth } from '../utils/auth';

interface LoginProps {
  onSubmit: (phone: string) => void;
}

export function Login({ onSubmit }: LoginProps) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await auth.signInWithPhone(phone.trim());
      if (result.success) {
        onSubmit(phone.trim());
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="size-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-white">
      <div className="flex items-center gap-2 mb-8">
        <Leaf className="size-8 text-green-600" />
        <h1 className="text-2xl text-green-600">EcoTrack</h1>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Smartphone className="size-5" />
            Login with Mobile
          </CardTitle>
          <CardDescription>
            Enter your mobile number to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground mt-6 text-center max-w-sm">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
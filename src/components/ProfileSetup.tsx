import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Home, Users } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profileData: any) => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    householdSize: '',
    community: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate form data
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      setIsLoading(false);
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      setIsLoading(false);
      return;
    }
    if (!formData.householdSize) {
      setError('Household size is required');
      setIsLoading(false);
      return;
    }
    if (!formData.community.trim()) {
      setError('Community is required');
      setIsLoading(false);
      return;
    }

    // Call onComplete with validated data
    console.log('ProfileSetup: Submitting form data:', formData);
    onComplete(formData);
    setIsLoading(false);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="size-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-white overflow-y-auto">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="size-5" />
            Profile Setup
          </CardTitle>
          <CardDescription>
            Tell us about yourself to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => updateFormData('fullName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Household Size</Label>
              <Select value={formData.householdSize} onValueChange={(value) => updateFormData('householdSize', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select household size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 person</SelectItem>
                  <SelectItem value="2-3">2-3 people</SelectItem>
                  <SelectItem value="4-5">4-5 people</SelectItem>
                  <SelectItem value="6+">6+ people</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="community">Community/Neighborhood</Label>
              <Input
                id="community"
                placeholder="Enter your community"
                value={formData.community}
                onChange={(e) => updateFormData('community', e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 text-center p-2 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Edit, Loader2 } from 'lucide-react';
import { AuthUser } from '../utils/auth';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface ProfileEditProps {
  user: AuthUser | null;
  onProfileUpdate?: () => void;
}

export function ProfileEdit({ user, onProfileUpdate }: ProfileEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const profile = user?.user_metadata || {};
  
  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    address: profile.address || '',
    householdSize: profile.householdSize || '',
    community: profile.community || '',
    bio: profile.bio || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update profile via API
      await api.updateProfile(formData);

      toast.success('Profile updated successfully!');
      setIsOpen(false);
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information and preferences.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your address"
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="householdSize">Household Size</Label>
            <Select
              value={formData.householdSize}
              onValueChange={(value) => handleInputChange('householdSize', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select household size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 person">1 person</SelectItem>
                <SelectItem value="2 people">2 people</SelectItem>
                <SelectItem value="3-4 people">3-4 people</SelectItem>
                <SelectItem value="5+ people">5+ people</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="community">Community</Label>
            <Select
              value={formData.community}
              onValueChange={(value) => handleInputChange('community', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your community" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Downtown">Downtown</SelectItem>
                <SelectItem value="Suburbs">Suburbs</SelectItem>
                <SelectItem value="Rural Area">Rural Area</SelectItem>
                <SelectItem value="Coastal District">Coastal District</SelectItem>
                <SelectItem value="Mountain View">Mountain View</SelectItem>
                <SelectItem value="Central District">Central District</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us a bit about yourself and your eco goals..."
              className="min-h-[80px]"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
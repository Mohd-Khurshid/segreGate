import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Loader2, Home, Users, MapPin, Phone } from 'lucide-react';
import { AuthUser } from '../utils/auth';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface UpdateInfoProps {
  user: AuthUser | null;
  onInfoUpdate?: () => void;
}

export function UpdateInfo({ user, onInfoUpdate }: UpdateInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const profile = user?.user_metadata || {};
  
  const [householdData, setHouseholdData] = useState({
    address: profile.address || '',
    householdSize: profile.householdSize || '',
    community: profile.community || '',
    emergencyContact: profile.emergencyContact || '',
    emergencyPhone: profile.emergencyPhone || '',
    specialNeeds: profile.specialNeeds || '',
    wastePreferences: profile.wastePreferences || []
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setHouseholdData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update household info via API
      await api.request('/user/household/update', {
        method: 'POST',
        body: JSON.stringify(householdData)
      });

      toast.success('Household information updated successfully!');
      setIsOpen(false);
      
      if (onInfoUpdate) {
        onInfoUpdate();
      }
    } catch (error) {
      console.error('Failed to update household info:', error);
      toast.error('Failed to update information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Update Information
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="size-5" />
            Update Household Information
          </DialogTitle>
          <DialogDescription>
            Keep your household details current for better service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <h3 className="font-medium">Address Details</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Home Address</Label>
              <Textarea
                id="address"
                value={householdData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete address"
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="community">Community/District</Label>
              <Select
                value={householdData.community}
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
                  <SelectItem value="Industrial Zone">Industrial Zone</SelectItem>
                  <SelectItem value="Residential Complex">Residential Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Household Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <h3 className="font-medium">Household Details</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="householdSize">Household Size</Label>
              <Select
                value={householdData.householdSize}
                onValueChange={(value) => handleInputChange('householdSize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select household size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 person">1 person</SelectItem>
                  <SelectItem value="2 people">2 people</SelectItem>
                  <SelectItem value="3-4 people">3-4 people</SelectItem>
                  <SelectItem value="5-6 people">5-6 people</SelectItem>
                  <SelectItem value="7+ people">7+ people</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialNeeds">Special Requirements (Optional)</Label>
              <Textarea
                id="specialNeeds"
                value={householdData.specialNeeds}
                onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                placeholder="Any special waste collection needs, accessibility requirements, etc."
                className="min-h-[60px]"
              />
            </div>
          </div>

          <Separator />

          {/* Emergency Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              <h3 className="font-medium">Emergency Contact</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contact Name</Label>
              <Input
                id="emergencyContact"
                value={householdData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Emergency contact name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Contact Phone</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={householdData.emergencyPhone}
                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
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
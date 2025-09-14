import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  HelpCircle,
  LogOut,
  Smartphone,
  Volume2,
  Eye
} from 'lucide-react';
import { AuthUser, auth } from '../utils/auth';

interface SettingsProps {
  user: AuthUser | null;
  onLogout?: () => void;
}

export function Settings({ user, onLogout }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [privacy, setPrivacy] = useState(true);
  const [sounds, setSounds] = useState(true);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <SettingsIcon className="size-4 mr-2" />
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your app preferences and account settings.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="size-4" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-sm">
                  Push Notifications
                </Label>
                <Switch
                  id="push-notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound" className="text-sm">
                  Sound
                </Label>
                <Switch
                  id="sound"
                  checked={sounds}
                  onCheckedChange={setSounds}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Moon className="size-4" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the app's appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="text-sm">
                  Dark Mode
                </Label>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="size-4" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="location-sharing" className="text-sm">
                  Location Sharing
                </Label>
                <Switch
                  id="location-sharing"
                  checked={privacy}
                  onCheckedChange={setPrivacy}
                />
              </div>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Eye className="size-4 mr-2" />
                Privacy Policy
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="size-4" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <HelpCircle className="size-4 mr-2" />
                Help Center
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Smartphone className="size-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Account */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Account</h3>
            <Button
              variant="destructive"
              className="w-full justify-start"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="size-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* App Info */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>EcoTrack v1.0.0</p>
            <p>© 2024 EcoTrack. All rights reserved.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
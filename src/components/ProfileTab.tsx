import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Settings as SettingsIcon, Star, Award, BookOpen, Home, Users } from 'lucide-react';
import { AuthUser } from '../utils/auth';
import { api } from '../utils/api';
import { Settings } from './Settings';
import { ProfileEdit } from './ProfileEdit';
import { Training } from './Training';
import { UpdateInfo } from './UpdateInfo';

interface ProfileTabProps {
  user: AuthUser | null;
  onLogout?: () => void;
}

export function ProfileTab({ user, onLogout }: ProfileTabProps) {
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const [trainingResponse, profileResponse] = await Promise.all([
        api.getTrainingProgress(),
        api.getUserProfile()
      ]);
      
      setTrainingData(trainingResponse?.training || []);
      setUserProfile(profileResponse || {});
    } catch (error) {
      console.error('Failed to load profile data:', error);
      setTrainingData([]);
      setUserProfile({});
    } finally {
      setIsLoading(false);
    }
  };

  const profile = user?.user_metadata || {};
  const currentPoints = userProfile?.stats?.totalPoints || 0;
  const nextLevelThreshold = 1500;
  
  const displayProfile = {
    name: profile?.fullName || 'User',
    phone: user?.phone || '',
    address: profile?.address || '',
    householdSize: profile?.householdSize || '',
    community: profile?.community || '',
    joinDate: profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString() : ''
  };

  const citizenBadge = {
    level: profile?.level || 'Bronze Citizen',
    score: currentPoints,
    nextLevel: nextLevelThreshold,
    averageScore: Math.round(currentPoints / Math.max(userProfile?.stats?.totalBags || 1, 1))
  };

  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Profile</h1>
        <Settings user={user} onLogout={onLogout} />
      </div>

      {/* User Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-green-100 text-green-600 text-xl">
                {displayProfile.name.split(' ').map(n => n[0] || '').join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-medium">{displayProfile.name}</h3>
              <p className="text-muted-foreground">{displayProfile.phone}</p>
              <Badge className="bg-green-100 text-green-800 mt-1">
                Member since {displayProfile.joinDate}
              </Badge>
            </div>
            <ProfileEdit user={user} onProfileUpdate={loadData} />
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Home className="size-4 text-gray-400" />
              <span>{displayProfile.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-gray-400" />
              <span>{displayProfile.householdSize} • {displayProfile.community}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Citizen Badge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5 text-yellow-500" />
            Citizen Badge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="p-4 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-full inline-block mb-2">
              <Star className="size-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium">{citizenBadge.level}</h3>
            <p className="text-sm text-muted-foreground">
              {citizenBadge.score} / {citizenBadge.nextLevel} points
            </p>
          </div>
          
          <Progress 
            value={(citizenBadge.score / citizenBadge.nextLevel) * 100} 
            className="mb-4"
          />
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{citizenBadge.averageScore}</p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {citizenBadge.nextLevel - citizenBadge.score}
              </p>
              <p className="text-sm text-muted-foreground">Points to Next Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5" />
            Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center">Loading training data...</p>
            ) : trainingData.length === 0 ? (
              <p className="text-muted-foreground text-center">No training modules available.</p>
            ) : (
              trainingData.map((module, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{module.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {module.progress}%
                      </span>
                      {module.completed && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>
              ))
            )}
          </div>
          
          <Training onTrainingUpdate={loadData} />
        </CardContent>
      </Card>

      {/* Household Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="size-5" />
            Household Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Household Size</span>
              <span>{displayProfile.householdSize || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Community</span>
              <span>{displayProfile.community || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address</span>
              <span className="text-right text-sm">{displayProfile.address || 'Not specified'}</span>
            </div>
          </div>
          <UpdateInfo user={user} onInfoUpdate={loadData} />
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Gift, Star, ShoppingBag, Coffee, Leaf, Smartphone } from 'lucide-react';
import { api } from '../utils/api';
import { AuthUser } from '../utils/auth';

const iconMap: Record<string, any> = {
  'Food & Drink': Coffee,
  'Eco Products': ShoppingBag,
  'Environment': Leaf,
  'Utilities': Smartphone
};

interface RewardsTabProps {
  user: AuthUser | null;
}

export function RewardsTab({ user }: RewardsTabProps) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadRewards();
    loadUserProfile();
  }, []);

  const loadRewards = async () => {
    try {
      const response = await api.getAvailableRewards();
      setRewards(response.rewards || []);
    } catch (error) {
      console.error('Failed to load rewards:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await api.getUserProfile();
      setUserProfile(response);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (reward: any) => {
    try {
      const response = await api.redeemReward({
        rewardId: reward.id,
        points: reward.points
      });
      
      if (response.success) {
        alert(`Successfully redeemed ${reward.name}!`);
        await loadUserProfile(); // Refresh points
      }
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  };

  const currentPoints = userProfile?.stats?.totalPoints || user?.user_metadata?.totalPoints || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl mb-2">Rewards</h1>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="size-6 text-yellow-300" />
              <span className="text-3xl font-bold">{currentPoints.toLocaleString()}</span>
            </div>
            <p>Available Points</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4">Rewards Store</h2>
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">Loading rewards...</p>
              </CardContent>
            </Card>
          ) : (
            rewards.map((reward) => {
              const Icon = iconMap[reward.category] || Gift;
              const canRedeem = currentPoints >= reward.points;

              return (
              <Card key={reward.id} className={!canRedeem ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Icon className="size-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {reward.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="size-4 text-yellow-500" />
                          <span className="font-medium">{reward.points} points</span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleRedeem(reward)}
                          disabled={!canRedeem}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {canRedeem ? 'Redeem' : 'Not enough points'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="size-5" />
            Recent Redemptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Coffee Voucher</p>
                <p className="text-sm text-muted-foreground">Jan 10, 2024</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Redeemed</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Eco-friendly Bag</p>
                <p className="text-sm text-muted-foreground">Jan 5, 2024</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Delivered</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
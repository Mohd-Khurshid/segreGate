import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Leaf, Users, Award, BarChart3, LogIn, UserPlus } from 'lucide-react';

interface SplashProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function Splash({ onLogin, onSignUp }: SplashProps) {
  return (
    <div className="size-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-white">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <Leaf className="size-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            SegreGate
          </CardTitle>
          <CardDescription className="text-green-600">
            Your Gateway to Sustainable Living
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Users className="size-4 text-green-600" />
              <span>Join the community</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Award className="size-4 text-green-600" />
              <span>Earn rewards</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <BarChart3 className="size-4 text-green-600" />
              <span>Track your impact</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={onLogin}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <LogIn className="size-4 mr-2" />
              Login
            </Button>
            
            <Button 
              onClick={onSignUp}
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
            >
              <UserPlus className="size-4 mr-2" />
              Sign Up
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            Join thousands of users making a difference
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
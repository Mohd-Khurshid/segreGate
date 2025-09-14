import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BagsTab } from './BagsTab';
import { RewardsTab } from './RewardsTab';
import { ReportTab } from './ReportTab';
import { ProfileTab } from './ProfileTab';
import { Package, Gift, Camera, User } from 'lucide-react';
import { AuthUser } from '../utils/auth';

interface DashboardProps {
  user: AuthUser | null;
  onLogout?: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('bags');

  return (
    <div className="size-full flex flex-col bg-background">
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="size-full flex flex-col">
          <div className="flex-1 overflow-auto pb-16">
            <TabsContent value="bags" className="h-full m-0">
              <BagsTab />
            </TabsContent>
            <TabsContent value="rewards" className="h-full m-0">
              <RewardsTab user={user} />
            </TabsContent>
            <TabsContent value="report" className="h-full m-0">
              <ReportTab />
            </TabsContent>
            <TabsContent value="profile" className="h-full m-0">
              <ProfileTab user={user} onLogout={onLogout} />
            </TabsContent>
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg safe-area-pb">
            <TabsList className="grid w-full grid-cols-4 h-16 bg-transparent p-0 rounded-none">
              <TabsTrigger 
                value="bags" 
                className="nav-trigger flex flex-col items-center justify-center gap-1 py-2 px-4 h-full rounded-none border-none bg-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors"
              >
                <Package className="size-5" />
                <span className="text-xs font-medium">Bags</span>
              </TabsTrigger>
              <TabsTrigger 
                value="rewards" 
                className="nav-trigger flex flex-col items-center justify-center gap-1 py-2 px-4 h-full rounded-none border-none bg-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors"
              >
                <Gift className="size-5" />
                <span className="text-xs font-medium">Rewards</span>
              </TabsTrigger>
              <TabsTrigger 
                value="report" 
                className="nav-trigger flex flex-col items-center justify-center gap-1 py-2 px-4 h-full rounded-none border-none bg-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors"
              >
                <Camera className="size-5" />
                <span className="text-xs font-medium">Report</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="nav-trigger flex flex-col items-center justify-center gap-1 py-2 px-4 h-full rounded-none border-none bg-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50 transition-colors"
              >
                <User className="size-5" />
                <span className="text-xs font-medium">Profile</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
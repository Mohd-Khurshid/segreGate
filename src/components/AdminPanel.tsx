import React, { useState, useEffect } from 'react';
import { userDataService, UserData } from '../utils/userData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Users, Phone, MapPin, Home, Award, Calendar } from 'lucide-react';

export function AdminPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load all users from database
    const allUsers = userDataService.getAllUsers();
    setUsers(allUsers);
    setIsLoading(false);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    const allUsers = userDataService.getAllUsers();
    setUsers(allUsers);
    setIsLoading(false);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all users? This action cannot be undone.')) {
      // Clear all users from database
      userDataService.clearAllUsers();
    }
  };

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="size-full p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Manage all registered users</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Refresh
            </Button>
            <Button onClick={handleClearAll} variant="destructive" size="sm">
              Clear All
            </Button>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {users.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="size-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users registered</h3>
                <p className="text-muted-foreground">No users have been registered yet.</p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.fullName}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Phone className="size-4" />
                          {user.phone}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Award className="size-4" />
                        {user.level}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.totalPoints} points
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* User Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Address:</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{user.address}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Home className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Household Size:</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{user.householdSize}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Community:</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{user.community}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Joined:</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">User Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{user.bags.length}</div>
                        <div className="text-sm text-muted-foreground">Bags</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{user.reports.length}</div>
                        <div className="text-sm text-muted-foreground">Reports</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{user.rewards.length}</div>
                        <div className="text-sm text-muted-foreground">Rewards</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {user.training.filter(t => t.completed).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Completed Training</div>
                      </div>
                    </div>
                  </div>

                  {/* Training Progress */}
                  {user.training.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Training Progress</h4>
                      <div className="space-y-2">
                        {user.training.map((module, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="text-sm font-medium">{module.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${module.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {module.progress}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

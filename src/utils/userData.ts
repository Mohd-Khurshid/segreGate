// User Data Management Service
// This service handles user registration, login, and data persistence

export interface UserData {
  id: string;
  phone: string;
  fullName: string;
  address: string;
  householdSize: string;
  community: string;
  totalPoints: number;
  level: string;
  joinDate: string;
  lastLogin: string;
  bags: any[];
  reports: any[];
  rewards: any[];
  training: any[];
}

class UserDataService {
  private users: Map<string, UserData> = new Map();

  // Register new user (first time)
  registerUser(userData: Omit<UserData, 'id' | 'totalPoints' | 'level' | 'joinDate' | 'lastLogin' | 'bags' | 'reports' | 'rewards' | 'training'>): UserData {
    // Check if phone number already exists
    for (const [id, user] of this.users) {
      if (user.phone === userData.phone) {
        throw new Error('Phone number already exists');
      }
    }

    const id = `user-${Date.now()}`;
    const newUser: UserData = {
      id,
      phone: userData.phone,
      fullName: userData.fullName,
      address: userData.address,
      householdSize: userData.householdSize,
      community: userData.community,
      totalPoints: 0,
      level: 'Bronze Citizen',
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      bags: [],
      reports: [],
      rewards: [],
      training: [
        { name: 'Waste Sorting Basics', progress: 0, completed: false },
        { name: 'Recycling Guidelines', progress: 0, completed: false },
        { name: 'Composting 101', progress: 0, completed: false },
        { name: 'Community Impact', progress: 0, completed: false }
      ]
    };
    
    this.users.set(id, newUser);
    console.log('User registered successfully:', newUser);
    return newUser;
  }

  // Login existing user (returning user)
  loginUser(phone: string): UserData | null {
    // Find user by phone number
    for (const [id, user] of this.users) {
      if (user.phone === phone) {
        // Update last login time
        user.lastLogin = new Date().toISOString();
        this.users.set(id, user);
        return user;
      }
    }
    return null;
  }

  // Get user data
  getUserData(phone: string): UserData | null {
    for (const [id, user] of this.users) {
      if (user.phone === phone) {
        return user;
      }
    }
    return null;
  }

  // Update user data
  updateUserData(phone: string, updates: Partial<UserData>): boolean {
    for (const [id, user] of this.users) {
      if (user.phone === phone) {
        const updatedUser = { ...user, ...updates };
        this.users.set(id, updatedUser);
        return true;
      }
    }
    return false;
  }

  // Add bag to user
  addBag(phone: string, bag: any): boolean {
    for (const [id, user] of this.users) {
      if (user.phone === phone) {
        user.bags.push(bag);
        this.users.set(id, user);
        return true;
      }
    }
    return false;
  }

  // Add report to user
  addReport(phone: string, report: any): boolean {
    for (const [id, user] of this.users) {
      if (user.phone === phone) {
        user.reports.push(report);
        this.users.set(id, user);
        return true;
      }
    }
    return false;
  }

  // Add reward to user
  addReward(phone: string, reward: any): boolean {
    for (const [id, user] of this.users) {
      if (user.phone === phone) {
        user.rewards.push(reward);
        this.users.set(id, user);
        return true;
      }
    }
    return false;
  }

  // Update training progress
  updateTraining(phone: string, moduleName: string, progress: number): boolean {
    for (const [id, user] of this.users) {
      if (user.phone === phone) {
        const trainingIndex = user.training.findIndex(t => t.name === moduleName);
        if (trainingIndex !== -1) {
          user.training[trainingIndex].progress = progress;
          user.training[trainingIndex].completed = progress >= 100;
          
          // Award points for completing modules
          if (progress >= 100) {
            user.totalPoints += 100;
            user.level = this.calculateLevel(user.totalPoints);
          }
          
          this.users.set(id, user);
          return true;
        }
      }
    }
    return false;
  }

  // Calculate user level based on points
  private calculateLevel(points: number): string {
    if (points >= 1000) return 'Gold Citizen';
    if (points >= 500) return 'Silver Citizen';
    if (points >= 100) return 'Bronze Citizen';
    return 'Bronze Citizen';
  }

  // Get all users (for debugging)
  getAllUsers(): UserData[] {
    return Array.from(this.users.values());
  }

  // Clear all users (admin function)
  clearAllUsers(): void {
    this.users.clear();
    console.log('All users cleared from database');
  }
}

export const userDataService = new UserDataService();

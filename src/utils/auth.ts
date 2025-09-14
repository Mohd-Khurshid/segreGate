import { userDataService, UserData } from './userData'

export interface AuthUser {
  id: string
  phone: string
  user_metadata: {
    fullName: string
    address: string
    householdSize: string
    community: string
    totalPoints: number
    level: string
    joinDate: string
  }
}

class AuthService {
  private currentUser: UserData | null = null
  private accessToken: string | null = null

  async signInWithPhone(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock OTP sending - in real app would use Supabase Auth phone
      console.log(`Mock: Sending OTP to ${phone}`)
      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'Failed to send OTP' }
    }
  }

  async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock OTP verification - in real app would verify with Supabase
      if (otp.length === 6) {
        console.log(`Mock: OTP ${otp} verified for ${phone}`)
        return { success: true }
      }
      return { success: false, error: 'Invalid OTP' }
    } catch (error) {
      console.error('OTP verification error:', error)
      return { success: false, error: 'Failed to verify OTP' }
    }
  }

  async signUp(userData: {
    phone: string
    fullName: string
    address: string
    householdSize: string
    community: string
  }): Promise<{ success: boolean; user?: UserData; error?: string }> {
    try {
      // Register user in database
      const newUser = userDataService.registerUser(userData);
      
      this.currentUser = newUser
      this.accessToken = 'mock-token'
      
      console.log('User registered successfully:', newUser);
      return { success: true, user: newUser }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'Failed to create user' }
    }
  }

  async getSession(): Promise<{ user: UserData | null; token: string | null }> {
    // Check if user exists in database
    if (this.currentUser) {
      return { user: this.currentUser, token: this.accessToken }
    }
    return { user: null, token: null }
  }

  async signOut(): Promise<void> {
    // Mock sign out - in real app would use Supabase
    console.log('Mock: Signing out user')
    this.currentUser = null
    this.accessToken = null
  }

  getCurrentUser(): UserData | null {
    return this.currentUser
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  // Set current user (for internal use)
  setCurrentUser(user: UserData): void {
    this.currentUser = user;
    this.accessToken = `mock-token-${user.id}`;
  }
}

export const auth = new AuthService()
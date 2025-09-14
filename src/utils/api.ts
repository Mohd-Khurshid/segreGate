import { projectId, publicAnonKey } from './supabase/info'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-5108a8bb`

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  public async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token || publicAnonKey}`,
      ...options.headers
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API Error ${response.status}:`, errorText)
        
        // Handle authentication errors
        if (response.status === 401) {
          console.log('Authentication failed, redirecting to login...')
          // In a real app, you might want to redirect to login here
        }
        
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth
  async signup(userData: {
    phone: string
    fullName: string
    address: string
    householdSize: string
    community: string
  }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  // User
  async getUserProfile() {
    return this.request('/user/profile')
  }

  // Bags
  async addBag(bagData: {
    type: string
    weight: string
    qrCode: string
  }) {
    return this.request('/bags/add', {
      method: 'POST',
      body: JSON.stringify(bagData)
    })
  }

  async getBags() {
    return this.request('/bags')
  }

  // Reports
  async submitReport(reportData: {
    location: string
    type: string
    imageBase64?: string
    coordinates?: { lat: number, lng: number }
  }) {
    return this.request('/reports/submit', {
      method: 'POST',
      body: JSON.stringify(reportData)
    })
  }

  async getReports() {
    return this.request('/reports')
  }

  // Rewards
  async getAvailableRewards() {
    return this.request('/rewards/available')
  }

  async redeemReward(rewardData: {
    rewardId: number
    points: number
  }) {
    return this.request('/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify(rewardData)
    })
  }

  // Training
  async getTrainingProgress() {
    return this.request('/training')
  }

  async updateTrainingProgress(progressData: {
    moduleName: string
    progress: number
  }) {
    return this.request('/training/update', {
      method: 'POST',
      body: JSON.stringify(progressData)
    })
  }

  // Profile Management
  async updateProfile(profileData: {
    fullName?: string
    address?: string
    householdSize?: string
    community?: string
    bio?: string
  }) {
    return this.request('/user/profile/update', {
      method: 'POST',
      body: JSON.stringify(profileData)
    })
  }

  async updateHouseholdInfo(householdData: {
    address?: string
    householdSize?: string
    community?: string
    emergencyContact?: string
    emergencyPhone?: string
    specialNeeds?: string
    wastePreferences?: string[]
  }) {
    return this.request('/user/household/update', {
      method: 'POST',
      body: JSON.stringify(householdData)
    })
  }


}

export const api = new ApiClient()
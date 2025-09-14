import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

// Initialize storage buckets
async function initializeBuckets() {
  const bucketName = 'make-5108a8bb-reports'
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, { public: false })
    if (error) {
      console.log('Error creating bucket:', error)
    } else {
      console.log('Created reports bucket successfully')
    }
  }
}

// Initialize buckets on startup
initializeBuckets()

// Auth helper function
async function getAuthenticatedUser(c: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return { user: null, error: 'No authorization header' }
  }
  
  const accessToken = authHeader.split(' ')[1]
  if (!accessToken) {
    return { user: null, error: 'No token provided' }
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  return { user, error }
}

// User registration
app.post('/make-server-5108a8bb/auth/signup', async (c) => {
  try {
    const { phone, fullName, address, householdSize, community } = await c.req.json()
    
    // Create user with phone as email (temporary solution)
    const email = `${phone.replace(/[^\d]/g, '')}@ecotrack.app`
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      phone,
      password: 'temp-password', // In real app, generate secure password
      user_metadata: { 
        fullName, 
        address, 
        householdSize, 
        community,
        joinDate: new Date().toISOString(),
        totalPoints: 0,
        level: 'Bronze Citizen'
      },
      email_confirm: true
    })
    
    if (error) {
      console.log('Signup error:', error)
      return c.json({ success: false, error: error.message }, 400)
    }
    
    // Initialize user data in KV store
    await kv.set(`user:${data.user.id}:bags`, [])
    await kv.set(`user:${data.user.id}:reports`, [])
    await kv.set(`user:${data.user.id}:rewards`, [])
    await kv.set(`user:${data.user.id}:training`, [
      { name: 'Waste Sorting Basics', progress: 0, completed: false },
      { name: 'Recycling Guidelines', progress: 0, completed: false },
      { name: 'Composting 101', progress: 0, completed: false },
      { name: 'Community Impact', progress: 0, completed: false }
    ])
    
    return c.json({ success: true, user: data.user })
  } catch (error) {
    console.log('Signup server error:', error)
    return c.json({ success: false, error: 'Server error during signup' }, 500)
  }
})

// Get user profile
app.get('/make-server-5108a8bb/user/profile', async (c) => {
  const { user, error } = await getAuthenticatedUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const bags = await kv.get(`user:${user.id}:bags`) || []
    const reports = await kv.get(`user:${user.id}:reports`) || []
    const totalBags = bags.length
    const collectedBags = bags.filter((bag: any) => bag.status === 'collected').length
    const resolvedReports = reports.filter((report: any) => report.status === 'resolved').length
    
    return c.json({
      profile: user.user_metadata,
      stats: {
        totalBags,
        collectedBags,
        resolvedReports,
        totalPoints: user.user_metadata.totalPoints || 0
      }
    })
  } catch (error) {
    console.log('Profile fetch error:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

// Add new bag (QR scan)
app.post('/make-server-5108a8bb/bags/add', async (c) => {
  const { user, error } = await getAuthenticatedUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { type, weight, qrCode } = await c.req.json()
    
    const bag = {
      id: `BG${Date.now().toString().slice(-6)}`,
      type,
      weight,
      qrCode,
      status: 'pending',
      score: 0,
      date: new Date().toISOString().split('T')[0],
      userId: user.id
    }
    
    const existingBags = await kv.get(`user:${user.id}:bags`) || []
    existingBags.push(bag)
    await kv.set(`user:${user.id}:bags`, existingBags)
    
    return c.json({ success: true, bag })
  } catch (error) {
    console.log('Add bag error:', error)
    return c.json({ error: 'Failed to add bag' }, 500)
  }
})

// Get user bags
app.get('/make-server-5108a8bb/bags', async (c) => {
  const { user, error } = await getAuthenticatedUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const bags = await kv.get(`user:${user.id}:bags`) || []
    return c.json({ bags })
  } catch (error) {
    console.log('Get bags error:', error)
    return c.json({ error: 'Failed to fetch bags' }, 500)
  }
})

// Submit waste report
app.post('/make-server-5108a8bb/reports/submit', async (c) => {
  const { user, error } = await getAuthenticatedUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { location, type, imageBase64, coordinates } = await c.req.json()
    
    let imageUrl = null
    if (imageBase64) {
      // Convert base64 to blob and upload to Supabase Storage
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
      
      const fileName = `report-${Date.now()}.jpg`
      const { data, error: uploadError } = await supabase.storage
        .from('make-5108a8bb-reports')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg'
        })
      
      if (!uploadError && data) {
        const { data: signedUrl } = await supabase.storage
          .from('make-5108a8bb-reports')
          .createSignedUrl(fileName, 60 * 60 * 24 * 7) // 7 days
        
        if (signedUrl) {
          imageUrl = signedUrl.signedUrl
        }
      }
    }
    
    const report = {
      id: `RPT${Date.now().toString().slice(-6)}`,
      location,
      type,
      imageUrl,
      coordinates,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      userId: user.id,
      points: 0
    }
    
    const existingReports = await kv.get(`user:${user.id}:reports`) || []
    existingReports.push(report)
    await kv.set(`user:${user.id}:reports`, existingReports)
    
    return c.json({ success: true, report })
  } catch (error) {
    console.log('Submit report error:', error)
    return c.json({ error: 'Failed to submit report' }, 500)
  }
})

// Get user reports
app.get('/make-server-5108a8bb/reports', async (c) => {
  const { user, error } = await getAuthenticatedUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const reports = await kv.get(`user:${user.id}:reports`) || []
    return c.json({ reports })
  } catch (error) {
    console.log('Get reports error:', error)
    return c.json({ error: 'Failed to fetch reports' }, 500)
  }
})

// Get available rewards
app.get('/make-server-5108a8bb/rewards/available', async (c) => {
  const rewards = [
    {
      id: 1,
      name: 'Coffee Voucher',
      description: '1 free coffee at partner cafes',
      points: 150,
      category: 'Food & Drink',
      available: true
    },
    {
      id: 2,
      name: 'Eco-friendly Bag',
      description: 'Reusable shopping bag made from recycled materials',
      points: 300,
      category: 'Eco Products',
      available: true
    },
    {
      id: 3,
      name: 'Tree Planting',
      description: 'Plant a tree in your name',
      points: 500,
      category: 'Environment',
      available: true
    },
    {
      id: 4,
      name: 'Phone Credit',
      description: '$5 mobile phone credit',
      points: 250,
      category: 'Utilities',
      available: true
    }
  ]
  
  return c.json({ rewards })
})

// Redeem reward
app.post('/make-server-5108a8bb/rewards/redeem', async (c) => {
  const { user, error } = await getAuthenticatedUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { rewardId, points } = await c.req.json()
    const currentPoints = user.user_metadata.totalPoints || 0
    
    if (currentPoints < points) {
      return c.json({ error: 'Insufficient points' }, 400)
    }
    
    // Deduct points from user
    const newPoints = currentPoints - points
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, totalPoints: newPoints }
    })
    
    if (updateError) {
      return c.json({ error: 'Failed to update points' }, 500)
    }
    
    // Add to user's redemptions
    const redemption = {
      id: `RDM${Date.now().toString().slice(-6)}`,
      rewardId,
      points,
      date: new Date().toISOString().split('T')[0],
      status: 'redeemed'
    }
    
    const existingRedemptions = await kv.get(`user:${user.id}:rewards`) || []
    existingRedemptions.push(redemption)
    await kv.set(`user:${user.id}:rewards`, existingRedemptions)
    
    return c.json({ success: true, redemption, newPoints })
  } catch (error) {
    console.log('Redeem reward error:', error)
    return c.json({ error: 'Failed to redeem reward' }, 500)
  }
})

// Update training progress
app.post('/make-server-5108a8bb/training/update', async (c) => {
  const { user, error } = await getAuthenticatedUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { moduleName, progress } = await c.req.json()
    
    const existingTraining = await kv.get(`user:${user.id}:training`) || []
    const updatedTraining = existingTraining.map((module: any) => {
      if (module.name === moduleName) {
        return {
          ...module,
          progress,
          completed: progress >= 100
        }
      }
      return module
    })
    
    await kv.set(`user:${user.id}:training`, updatedTraining)
    
    // Award points for completing modules
    if (progress >= 100) {
      const currentPoints = user.user_metadata.totalPoints || 0
      const bonusPoints = 100
      const newPoints = currentPoints + bonusPoints
      
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, totalPoints: newPoints }
      })
      
      return c.json({ success: true, training: updatedTraining, bonusPoints })
    }
    
    return c.json({ success: true, training: updatedTraining })
  } catch (error) {
    console.log('Update training error:', error)
    return c.json({ error: 'Failed to update training' }, 500)
  }
})

// Get training progress
app.get('/make-server-5108a8bb/training', async (c) => {
  const { user, error } = await getAuthenticatedUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const training = await kv.get(`user:${user.id}:training`) || []
    return c.json({ training })
  } catch (error) {
    console.log('Get training error:', error)
    return c.json({ error: 'Failed to fetch training' }, 500)
  }
})

Deno.serve(app.fetch)
import { createClient } from '@supabase/supabase-js'

// Strip any trailing /rest/v1 or path from the URL to prevent double-pathing
const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jwvpopeyvtmgbfqtiefd.supabase.co'
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3dnBvcGV5dnRtZ2JmcXRpZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3Njk1MzksImV4cCI6MjA4OTM0NTUzOX0.qjYrlTTHoA3RMjGmhTDzhie0Nh5ubXlt-kG6YJT-P-s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

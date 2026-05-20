import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jwvpopeyvtmgbfqtiefd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3dnBvcGV5dnRtZ2JmcXRpZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3Njk1MzksImV4cCI6MjA4OTM0NTUzOX0.qjYrlTTHoA3RMjGmhTDzhie0Nh5ubXlt-kG6YJT-P-s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

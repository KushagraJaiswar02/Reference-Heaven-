
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqfqijdrqrmkbmcizmns.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZnFpamRycXJta2JtY2l6bW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzU0ODEsImV4cCI6MjA4MzgxMTQ4MX0.IHpUVOSVrM9APPerVMshnrXfecQwQywivS0PD-Q8PRQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
    console.log('Checking "profiles" table columns...')

    // Try to select the new columns
    const { data, error } = await supabase
        .from('profiles')
        .select('bio, website, socials')
        .limit(1)

    if (error) {
        console.error('Error selecting columns:', error.message)
        console.error('Details:', error)
        if (error.message.includes('Could not find the')) {
            console.log('\nCONCLUSION: The columns DO NOT exist or the cache is stale.')
        }
    } else {
        console.log('Success! Columns found.')
        console.log('Data sample:', data)
    }
}

checkColumns()

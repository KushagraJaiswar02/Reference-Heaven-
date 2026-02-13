
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dqfqijdrqrmkbmcizmns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZnFpamRycXJta2JtY2l6bW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzU0ODEsImV4cCI6MjA4MzgxMTQ4MX0.IHpUVOSVrM9APPerVMshnrXfecQwQywivS0PD-Q8PRQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Connection failed:', error);
    } else {
        console.log('Connection successful!');
    }
}

testConnection();

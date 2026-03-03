$env:VERCEL_ORG_ID = "sakthivelan-sss-projects"
$env:VERCEL_PROJECT_ID = "hope-link"

# Add environment variables to Vercel
$vars = @{
    "NEXT_PUBLIC_SUPABASE_URL" = "https://fwptmspvyazjbvcnfvsp.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cHRtc3B2eWF6amJ2Y25mdnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MzQ1MDEsImV4cCI6MjA4ODAxMDUwMX0.D7iKjsEhwjUa4soVhHwpAMrx8kgZGASLhFUXkSOcouE"
    "SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cHRtc3B2eWF6amJ2Y25mdnNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzNDUwMSwiZXhwIjoyMDg4MDEwNTAxfQ.obFBr5h2nuZddIoVDn6vK3Nxh2ZOivLs5qndbXCmmM0"
    "GOOGLE_GEMINI_API_KEY" = "AIzaSyA9xS0bl108AN_DwxsHRG8JUlwPkkQCb20"
    "OPENWEATHERMAP_API_KEY" = "cfb33903d6f54307362970fae392e3e9"
}

foreach ($var in $vars.GetEnumerator()) {
    Write-Host "Adding $($var.Key)..." -ForegroundColor Cyan
    echo $var.Value | vercel env add $var.Key production
    echo $var.Value | vercel env add $var.Key preview  
    echo $var.Value | vercel env add $var.Key development
}

Write-Host "`n✅ All environment variables added!" -ForegroundColor Green
Write-Host "Now deploying to production..." -ForegroundColor Cyan

vercel --prod

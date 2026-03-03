# Environment Variables for Vercel Dashboard

Copy and paste these into Vercel Dashboard → Project Settings → Environment Variables:
https://vercel.com/sakthivelan-sss-projects/hope-link/settings/environment-variables

## Add Each Variable:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://fwptmspvyazjbvcnfvsp.supabase.co
```
**Environments:** Production, Preview, Development

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cHRtc3B2eWF6amJ2Y25mdnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MzQ1MDEsImV4cCI6MjA4ODAxMDUwMX0.D7iKjsEhwjUa4soVhHwpAMrx8kgZGASLhFUXkSOcouE
```
**Environments:** Production, Preview, Development

### 3. SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cHRtc3B2eWF6amJ2Y25mdnNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzNDUwMSwiZXhwIjoyMDg4MDEwNTAxfQ.obFBr5h2nuZddIoVDn6vK3Nxh2ZOivLs5qndbXCmmM0
```
**Environments:** Production, Preview, Development  
⚠️ **Mark as Sensitive!**

### 4. GOOGLE_GEMINI_API_KEY
```
AIzaSyA9xS0bl108AN_DwxsHRG8JUlwPkkQCb20
```
**Environments:** Production, Preview, Development

### 5. OPENWEATHERMAP_API_ KEY
```
cfb33903d6f54307362970fae392e3e9
```
**Environments:** Production, Preview, Development

---

## After Adding All Variables:

1. Click "Save" for each variable
2. Go to Deployments tab
3. Click "..." on latest deployment → "Redeploy"
4. Or wait for the CLI to finish adding the first variable, then run: `vercel --prod`

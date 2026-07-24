const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Resolving Supabase credentials from environment...');

// Path to .env file
const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found at project root.');
  console.log('Please create a .env file with your EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

// Simple env file parser
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    envVars[match[1]] = value.trim();
  }
});

const supabaseUrl = envVars.EXPO_PUBLIC_SUPABASE_URL || envVars.VITE_SUPABASE_URL;

if (!supabaseUrl) {
  console.error('❌ Error: Supabase URL not found in .env.');
  console.log('Make sure EXPO_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL is configured.');
  process.exit(1);
}

// Extract project reference from URL (e.g., https://[project-ref].supabase.co)
let projectRef = '';
try {
  const url = new URL(supabaseUrl);
  const hostnameParts = url.hostname.split('.');
  if (hostnameParts.length > 1 && hostnameParts[hostnameParts.length - 2] === 'supabase') {
    projectRef = hostnameParts[0];
  }
} catch (err) {
  // Fallback parsing if URL parsing fails
  const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase/);
  if (match) {
    projectRef = match[1];
  }
}

if (!projectRef) {
  console.error('❌ Error: Could not parse Supabase project reference from URL:', supabaseUrl);
  process.exit(1);
}

console.log(`✅ Extracted Supabase project reference: "${projectRef}"`);
console.log('📡 Fetching schema and generating TypeScript types...');

// Target output file
const targetDir = path.join(__dirname, '../src/types');
const targetFile = path.join(targetDir, 'database.types.ts');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

try {
  // Run supabase cli command to generate types
  const command = `npx supabase gen types typescript --project-id "${projectRef}" > "${targetFile}"`;
  execSync(command, { stdio: 'inherit' });
  console.log(`\n🎉 Success! Database types written to: ${path.relative(path.join(__dirname, '..'), targetFile)}`);
} catch (error) {
  console.error('\n❌ Generation failed.');
  console.log('Make sure you have logged in to Supabase CLI (npx supabase login) or that your network connection is active.');
  console.log('You can also generate types locally if you have the supabase CLI installed and running.');
  process.exit(1);
}

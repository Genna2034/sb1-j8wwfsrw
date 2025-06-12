// Script to make Supabase migrations idempotent
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');

// Get all SQL files in the migrations directory
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .map(file => path.join(migrationsDir, file));

console.log(`Found ${migrationFiles.length} migration files to process.`);

// Process each migration file
migrationFiles.forEach(filePath => {
  console.log(`Processing: ${path.basename(filePath)}`);
  
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply Rule #1: Make CREATE TABLE idempotent
  content = content.replace(/CREATE TABLE (?!IF NOT EXISTS)(\w+)/g, 'CREATE TABLE IF NOT EXISTS $1');
  
  // Apply Rule #2: Make CREATE INDEX idempotent
  content = content.replace(/CREATE INDEX (?!IF NOT EXISTS)(\w+)/g, 'CREATE INDEX IF NOT EXISTS $1');
  
  // Apply Rule #3: Make CREATE POLICY idempotent by adding DROP POLICY IF EXISTS
  const policyRegex = /CREATE POLICY "([^"]+)" ON (\w+)/g;
  let match;
  let newContent = content;
  
  // We need to collect all matches first because we're modifying the string
  const matches = [];
  while ((match = policyRegex.exec(content)) !== null) {
    matches.push({
      policyName: match[1],
      tableName: match[2],
      fullMatch: match[0],
      index: match.index
    });
  }
  
  // Process matches in reverse order to avoid index shifting
  matches.reverse().forEach(match => {
    const dropStatement = `DROP POLICY IF EXISTS "${match.policyName}" ON ${match.tableName};\n`;
    newContent = newContent.slice(0, match.index) + dropStatement + newContent.slice(match.index);
  });
  
  content = newContent;
  
  // Apply Rule #3 alternative: Make CREATE UNIQUE INDEX idempotent
  content = content.replace(/CREATE UNIQUE INDEX (?!IF NOT EXISTS)(\w+)/g, 'CREATE UNIQUE INDEX IF NOT EXISTS $1');
  
  // Write the modified content back to the file
  fs.writeFileSync(filePath, content);
  
  console.log(`✅ Fixed: ${path.basename(filePath)}`);
});

console.log('All migration files have been processed successfully!');
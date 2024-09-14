// migrate.js
const { execSync } = require('child_process');

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: Migration name is required.');
  process.exit(1);
}

try {
  execSync(`npx prisma migrate dev --name ${migrationName}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error running migration:', error.message);
  process.exit(1);
}

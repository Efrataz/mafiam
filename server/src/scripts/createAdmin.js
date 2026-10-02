import { initDb, createAdminAccount } from '../db.js';

const run = async () => {
  const args = process.argv.slice(2);
  const username = args[0] || 'admin';
  const password = args[1] || 'AdminPass123!';

  console.log(`Initializing DB and creating admin account '${username}'...`);
  await initDb();
  
  try {
    await createAdminAccount(username, password);
    console.log(`✅ Admin account '${username}' created successfully!`);
  } catch (err) {
    console.error(`❌ Failed to create admin account:`, err.message);
  }
  process.exit(0);
};

run();

// backend/scripts/backup.js
const { exec } = require('child_process');
const path = require('path');

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupFile = path.join(__dirname, '../backups', `backup-${timestamp}.sql`);
  
  const command = `pg_dump ${process.env.DATABASE_URL} > ${backupFile}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Backup failed:', error);
      return;
    }
    console.log('Backup successful:', backupFile);
  });
}

// Run daily backups
setInterval(backupDatabase, 24 * 60 * 60 * 1000);
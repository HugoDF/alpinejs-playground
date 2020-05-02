const buttondown = require('buttondown');
const fs = require('fs').promises;

const { BUTTONDOWN_API_KEY } = process.env;
if (!BUTTONDOWN_API_KEY) {
  console.error('BUTTONDOWN_API_KEY must be set');
  process.exit(1);
}

buttondown.setApiKey(process.env.BUTTONDOWN_API_KEY);

// change this to the latest issue whose data's been synced to this repo
const LAST_SYNCED_NEWSLETTER_NUMBER = 9;

async function main() {
  const emails = await buttondown.emails.list();

  const latestEmails = emails.filter(e => e.secondary_id > LAST_SYNCED_NEWSLETTER_NUMBER);

  await fs.writeFile('emails.json', JSON.stringify(latestEmails, null, 2), 'utf-8');
}

main();

const client_id = "ee972078e4f747f59dce341b0a493986";
const client_secret = "c068836397cb4b22840ae4e6249aa3d0";
const redirect_uri = "https://sisibigi.vercel.app/callback";

const code = process.argv[2];

if (!code) {
  console.error("\x1b[31mError: Please provide your Spotify authorization code as an argument.\x1b[0m");
  console.log("\nUsage:\n  node scripts/get-refresh-token.js <YOUR_AUTH_CODE>");
  console.log("\nTo get a fresh code, visit:\n  https://accounts.spotify.com/authorize?client_id=ee972078e4f747f59dce341b0a493986&response_type=code&redirect_uri=https://sisibigi.vercel.app/callback&scope=user-read-currently-playing%20user-read-playback-state\n");
  process.exit(1);
}

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

console.log("Trading authorization code for Spotify tokens...");

fetch(TOKEN_ENDPOINT, {
  method: 'POST',
  headers: {
    Authorization: `Basic ${basic}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code.trim(),
    redirect_uri,
  }),
})
  .then(async (response) => {
    const text = await response.text();
    if (!response.ok) {
      console.error(`\x1b[31mSpotify Token Exchange Failed (${response.status}):\x1b[0m`, text);
      process.exit(1);
    }
    const data = JSON.parse(text);
    console.log("\n\x1b[32m✔ Success! Here are your tokens:\x1b[0m");
    console.log("\n----------------------------------------");
    console.log(`\x1b[36mAccess Token (Expires in 1 hour):\x1b[0m\n${data.access_token}\n`);
    console.log(`\x1b[36mRefresh Token (Save this!):\x1b[0m\n${data.refresh_token}`);
    console.log("----------------------------------------");
    console.log("\n\x1b[33mInstructions:\x1b[0m");
    console.log("1. Copy the Refresh Token (starts with AQ... or different).");
    console.log("2. Paste it into your .env file as: SPOTIFY_REFRESH_TOKEN=...");
    console.log("3. Add it to your Vercel Project environment variables and trigger a redeploy.\n");
  })
  .catch((err) => {
    console.error("\x1b[31mRequest Error:\x1b[0m", err);
  });

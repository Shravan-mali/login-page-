// ============================================
// YouTube OAuth Helper
// ============================================

const { google } = require("googleapis");


// ============================================
// ENVIRONMENT VARIABLES
// ============================================

const CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID;

const CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET;

const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI;


// ============================================
// VALIDATE ENV
// ============================================

if (!CLIENT_ID) {
  throw new Error(
    "GOOGLE_CLIENT_ID is missing in .env"
  );
}

if (!CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_SECRET is missing in .env"
  );
}

if (!REDIRECT_URI) {
  throw new Error(
    "GOOGLE_REDIRECT_URI is missing in .env"
  );
}


// ============================================
// OAUTH CLIENT
// ============================================

const oauth2Client =
  new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );


// ============================================
// YOUTUBE SCOPES
// ============================================

const SCOPES = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly"
];


// ============================================
// GENERATE AUTH URL
// ============================================

function getYouTubeAuthUrl() {

  return oauth2Client.generateAuthUrl({

    access_type: "offline",

    prompt: "consent",

    scope: SCOPES

  });

}


// ============================================
// EXCHANGE CODE FOR TOKENS
// ============================================

async function getTokens(code) {

  if (!code) {
    throw new Error(
      "Authorization code is missing."
    );
  }

  console.log(
    "Exchanging Google authorization code..."
  );

  const {
    tokens
  } = await oauth2Client.getToken(code);

  if (!tokens) {
    throw new Error(
      "Google returned no tokens."
    );
  }

  return tokens;
}


// ============================================
// GET YOUTUBE CHANNEL
// ============================================

async function getChannelInfo(tokens) {

  if (!tokens || !tokens.access_token) {

    throw new Error(
      "Valid YouTube access token is required."
    );
  }


  // Create separate OAuth client
  // for this user's tokens

  const userAuth =
    new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );


  userAuth.setCredentials(
    tokens
  );


  const youtube =
    google.youtube({
      version: "v3",
      auth: userAuth
    });


  const response =
    await youtube.channels.list({

      part: [
        "snippet",
        "statistics",
        "contentDetails"
      ],

      mine: true

    });


  if (
    !response.data.items ||
    response.data.items.length === 0
  ) {

    throw new Error(
      "No YouTube channel found."
    );
  }


  const channel =
    response.data.items[0];


  return {

    id:
      channel.id,

    title:
      channel.snippet?.title || "",

    description:
      channel.snippet?.description || "",

    thumbnail:
      channel.snippet?.thumbnails?.default?.url || "",

    subscribers:
      channel.statistics?.subscriberCount || "0",

    views:
      channel.statistics?.viewCount || "0",

    videos:
      channel.statistics?.videoCount || "0"

  };

}


// ============================================
// EXPORT
// ============================================

module.exports = {

  getYouTubeAuthUrl,

  getTokens,

  getChannelInfo

};
// ============================================
// YouTube AI Agent - Backend Server
// ============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");

const {
  getYouTubeAuthUrl,
  getTokens,
  getChannelInfo
} = require("./youtube");


// ============================================
// APP
// ============================================

const app = express();

const PORT = process.env.PORT || 5000;

const clientPath = path.resolve(__dirname, "../client");


// ============================================
// MIDDLEWARE
// ============================================

app.use(
  cors({
    origin: [
      "http://localhost:5000",
      "http://127.0.0.1:5000",
      "http://localhost:5500",
      "http://127.0.0.1:5500"
    ],
    credentials: true
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);


// ============================================
// SESSION
// ============================================

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "youtube-ai-agent-development-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);


// ============================================
// FRONTEND
// ============================================

app.use(express.static(clientPath));


// ============================================
// LOGIN
// ============================================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(clientPath, "login.html")
  );
});

app.get("/login.html", (req, res) => {
  res.sendFile(
    path.join(clientPath, "login.html")
  );
});

app.get("/index.html", (req, res) => {
  res.redirect("/login.html");
});


// ============================================
// DASHBOARD
// ============================================

app.get("/dashboard.html", (req, res) => {
  res.sendFile(
    path.join(clientPath, "dashboard.html")
  );
});

app.get("/dashboard", (req, res) => {
  res.redirect("/dashboard.html");
});


// ============================================
// YOUTUBE OAUTH START
// ============================================

app.get("/auth/youtube", (req, res) => {

  console.log("");
  console.log("================================");
  console.log("Starting YouTube OAuth...");
  console.log("================================");

  try {

    // Generate secure state
    const state =
      crypto.randomBytes(32).toString("hex");

    // Store state in session
    req.session.oauthState = state;

    console.log(
      "OAuth state created:",
      state.substring(0, 10) + "..."
    );

    // Generate Google OAuth URL
    const authUrl =
      getYouTubeAuthUrl();

    const googleUrl =
      new URL(authUrl);

    // Add state
    googleUrl.searchParams.set(
      "state",
      state
    );

    console.log(
      "Redirect URI:",
      process.env.GOOGLE_REDIRECT_URI
    );

    console.log(
      "Saving session before redirect..."
    );

    // IMPORTANT:
    // Save session BEFORE redirecting to Google
    req.session.save((sessionError) => {

      if (sessionError) {

        console.error(
          "Session save error:",
          sessionError
        );

        return res.status(500).send(
          "Unable to save OAuth session."
        );
      }

      console.log(
        "Session saved successfully."
      );

      console.log(
        "Redirecting user to Google..."
      );

      res.redirect(
        googleUrl.toString()
      );

    });

  } catch (error) {

    console.error(
      "YouTube OAuth start error:"
    );

    console.error(error);

    res.status(500).send(
      "Unable to start YouTube authentication."
    );
  }

});


// ============================================
// YOUTUBE OAUTH CALLBACK
// ============================================

app.get(
  "/auth/youtube/callback",
  async (req, res) => {

    console.log("");
    console.log("================================");
    console.log("YouTube OAuth Callback");
    console.log("================================");

    try {

      const {
        code,
        state,
        error
      } = req.query;


      // ----------------------------------------
      // Google returned error
      // ----------------------------------------

      if (error) {

        console.error(
          "Google OAuth error:",
          error
        );

        return res.status(400).send(
          `Google OAuth error: ${error}`
        );
      }


      // ----------------------------------------
      // Debug session/state
      // ----------------------------------------

      console.log(
        "Received state:",
        state
          ? state.substring(0, 10) + "..."
          : "MISSING"
      );

      console.log(
        "Session state:",
        req.session.oauthState
          ? req.session.oauthState.substring(0, 10) + "..."
          : "MISSING"
      );


      // ----------------------------------------
      // Validate state
      // ----------------------------------------

      if (
        !state ||
        !req.session.oauthState ||
        state !== req.session.oauthState
      ) {

        console.error(
          "OAuth state validation FAILED."
        );

        return res.status(403).send(
          "Invalid OAuth state. Please connect YouTube again."
        );
      }


      console.log(
        "OAuth state validation successful."
      );


      // One-time-use state
      delete req.session.oauthState;


      // ----------------------------------------
      // Authorization code
      // ----------------------------------------

      if (!code) {

        return res.status(400).send(
          "Google authorization code is missing."
        );
      }


      console.log(
        "Google authorization code received."
      );


      // ----------------------------------------
      // Exchange code for tokens
      // ----------------------------------------

      const tokens =
        await getTokens(code);


      if (
        !tokens ||
        !tokens.access_token
      ) {

        throw new Error(
          "Google did not return an access token."
        );
      }


      console.log(
        "YouTube access token received."
      );


      // ----------------------------------------
      // Save YouTube tokens
      // ----------------------------------------

      req.session.youtubeTokens =
        tokens;


      // ----------------------------------------
      // Get channel
      // ----------------------------------------

      try {

        const channel =
          await getChannelInfo(tokens);

        req.session.youtubeChannel =
          channel;

        console.log(
          "YouTube channel information fetched."
        );

      } catch (channelError) {

        console.error(
          "Channel information error:",
          channelError
        );

        req.session.youtubeChannel = null;
      }


      // ----------------------------------------
      // Save final session
      // ----------------------------------------

      req.session.save((sessionError) => {

        if (sessionError) {

          console.error(
            "Final session save error:",
            sessionError
          );

          return res.status(500).send(
            "YouTube connected, but session could not be saved."
          );
        }


        console.log(
          "YouTube authentication successful."
        );

        console.log(
          "Redirecting to dashboard..."
        );


        res.redirect(
          "/dashboard.html?youtube=connected"
        );

      });

    } catch (error) {

      console.error("");
      console.error(
        "================================"
      );
      console.error(
        "YouTube OAuth callback error:"
      );
      console.error(error);
      console.error(
        "================================"
      );

      res.status(500).send(
        "YouTube authentication failed. Check VS Code terminal."
      );
    }

  }
);


// ============================================
// YOUTUBE STATUS
// ============================================

app.get(
  "/api/youtube/status",
  (req, res) => {

    const connected =
      Boolean(
        req.session.youtubeTokens
      );

    res.json({
      success: true,
      connected
    });

  }
);


// ============================================
// YOUTUBE CHANNEL
// ============================================

app.get(
  "/api/youtube/channel",
  async (req, res) => {

    try {

      if (
        !req.session.youtubeTokens
      ) {

        return res.status(401).json({
          success: false,
          error:
            "YouTube account is not connected."
        });
      }


      if (
        req.session.youtubeChannel
      ) {

        return res.json({
          success: true,
          channel:
            req.session.youtubeChannel
        });
      }


      const channel =
        await getChannelInfo(
          req.session.youtubeTokens
        );


      req.session.youtubeChannel =
        channel;


      res.json({
        success: true,
        channel
      });

    } catch (error) {

      console.error(
        "YouTube channel error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to fetch YouTube channel."
      });
    }

  }
);


// ============================================
// DISCONNECT
// ============================================

app.post(
  "/api/youtube/disconnect",
  (req, res) => {

    delete req.session.youtubeTokens;

    delete req.session.youtubeChannel;

    res.json({
      success: true,
      message:
        "YouTube account disconnected."
    });

  }
);


// ============================================
// HEALTH
// ============================================

app.get(
  "/api/health",
  (req, res) => {

    res.json({
      success: true,
      message:
        "YouTube AI Agent server is running.",
      time:
        new Date().toISOString()
    });

  }
);


// ============================================
// 404
// ============================================

app.use(
  (req, res) => {

    res.status(404).json({
      success: false,
      error: "Route not found.",
      path: req.originalUrl
    });

  }
);


// ============================================
// START SERVER
// ============================================

app.listen(
  PORT,
  () => {

    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "       YouTube AI Agent Server"
    );
    console.log(
      "=========================================="
    );

    console.log(
      `Server:   http://localhost:${PORT}`
    );

    console.log(
      `Login:    http://localhost:${PORT}/`
    );

    console.log(
      `Dashboard: http://localhost:${PORT}/dashboard.html`
    );

    console.log(
      `Health:   http://localhost:${PORT}/api/health`
    );

    console.log(
      `YouTube:  http://localhost:${PORT}/auth/youtube`
    );

    console.log(
      "=========================================="
    );

  }
);
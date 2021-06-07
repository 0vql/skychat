<p align="center">
    <img src="./app/client/assets/assets/logo.png">
</p>

# SkyChat

A virtual cinema to setup your own private screenings. Watch movies, youtube videos, or music with your friends/colleagues/family!

1. [Why the SkyChat?](#why-the-skychat)
2. [Overview](#overview)
3. [Install it](#how-to-install)
4. [Customize it](#customize)


## Why the SkyChat?

Here is what makes the SkyChat unique compared to the other entertainment platforms:

~ **A carefully designed user experience, so everything feels nice and smooth**

We strongly believe that building the perfect user experience is the key to ensure people continue using an application in the long run. That's why we are constantly and iteratively working on polishing and improving the design and feeling of the SkyChat. 

~ **A sense of proximity between each other**

You can see each other cursor users moving around the screen, which allows people to feel connected to each other. There are humans behind the usernames. (This feature can be enabled/disabled in the configuration)

~ **Engaging the community**

Entertainment and customization plugins allow your community to engage in the long term. Examples of such features, which can be enabled/disabled in the configuration:
- Virtual money with mini-games (racing game, casino roulette)
- Styling customization for usernames and messages
- Long-term activity is rewarded with experience points (XP) and ranks
- Custom profile pictures


## Overview

Here is what it looks like:
![overall-screenshot](./doc/screenshot.png)
### Synchronized Youtube Player

Users can play any youtube video on a shared and synchronized player. Orchestration is implemented through a public queue of videos to play, and decision-making (for instance to skip videos) is done with polls. Democracy 💯. If you want it, setup multiple video channels to allow concurrent screenings.
![youtube-short](./doc/youtube-short.gif)

### Live cursor visualization and mini-games

Users can interact and play with integrated mini-games (which can be disabled in the configuration).
Users can also see each other cursors moving in real time. This gives a sense of proximity between users. This is the most iconic feature of the SkyChat.
![cursor-roll](./doc/cursor-roll.gif)

### Cinema mode

If watching long videos, documentaries, or tv shows, the cinema-mode allows users to watch the video in full-screen and have the tchat minimized on the bottom-right of the screen.
![cinema-mode](./doc/cinema-mode.gif)

### And much more

This is not all, but to discover all features, you may as well launch an instance and try it yourself!

## How to install

### Install and run

If using docker you need:
- docker & docker-compose

If not using docker, ensure you have the following installed on your system:
- nodejs >= 10 and npm
- sqlite3

Then, follow these steps:

```bash
# 1. Clone the repository
git clone https://github.com/skychatorg/skychat.git
cd skychat

# 2. Generates the .env.json and config files in config/
bash scripts/setup.sh

# 3. (Choose only one) Run the app
#   Run with docker:
bash scripts/docker-start.sh
#   Run on current host
npm i && npm run start
```


### Application setup

By default, the application will be listening to `localhost:8080` and assume it is accessed from `http://localhost:8080`. In order to customize the domain name of your SkyChat application, you will need to edit the `.env.json` file. The fields in the .env.json contain private information related to the application.

The semantic of these fields are defined below:


| field | type | default | semantic |
|-------|------|---------|----------|
| location                 | string | "http://localhost:8080" | Server location, i.e. what user need to put in their browser to access your app |
| hostname                 | string | "localhost" | Hostname the server will listen to |
| port                     | number | 8080 | Server port |
| ssl                      | false or {certificate:string,key:string}  | false | SSL configuration (paths to certificate and key files). Use false if SSL is disabled. |
| users_passwords_salt | string | "$RANDOM_SALT" | Password salt. |
| users_token_salt     | string | "$RANDOM_SALT" | Token salt. |
| youtube_api_key      | string | "" | [Youtube api key](#setup-youtube) |
| op                       | string[] | [] | OP usernames. OP usernames can use the /setright command. |
| op_passcode              | string? | "$RANDOM_PASSCODE" | OP passcode. Activate your OP session with `/op $op_passcode` |
| email_transport          | nodemailer.JSONTransport | {"sendmail": true,"newline": "unix","path": "/usr/sbin/sendmail"} | Value given to [nodemailer.createTransport](https://nodemailer.com/about/) to initialize the mailer |


### Setup Youtube

The SkyChat requires a key for the Youtube plugin to work. This key needs to be put in your `.env.json` file.

Using the Youtube API is free but there is a daily quota, which when exceeded blocks the requests until the next day. If it happens, the Youtube plugin will be disabled until the next day. 

1. Go to [the Google Cloud Platform](https://console.cloud.google.com/apis/api/youtube.googleapis.com/credentials). If you never activated the account, you will have to activate it. 
2. Click `Create credentials > API key`
3. Copy the generated API key, and paste it in your `.env.json` file (the variable name is `youtube_api_key`)
4. Restart the server


### Develop

```bash
npm run dev
```

This will start a static file server & websocket server on http://localhost:8080
When the source files change, the build processes runs automatically

## Customize


### Customize preferences

The preferences.json file specifies application preferences. The available fields are detailed below.


| field | type | default | description |
|-------|------|---------|-------------|
| minRightForPrivateMessages    | number |  -1 | Min. right to send private messages |
| minRightForMessageHistory     | number |  -1 | Min. right to access room message history |
| minRightForAudioRecording     | number |  -1 | Min. right to share and play audio recordings |
| minRightForConnectedList      | number |  -1 | Min. right to access the list of currently active users |
| minRightForPolls              | number |  -1 | Min. right to create polls |
| minRightForGallery            | number |  -1 | Min. right to access the gallery |
| maxReplacedImagesPerMessage   | number |  50 | Max. number of replaced images per message |
| maxReplacedStickersPerMessage | number |  50 | Max. number of replaced stickers per message |
| maxNewlinesPerMessage         | number |  20 | Max. number of newlines per message |


### Customize plugins

Enabled plugins. Must only define classes exported by `app/server/skychat/commands/impl/index.ts`


### Customize ranks

Rank definition (xp threshold and image path). Must be sorted by descending limit. The fields for each rank are:
  - limit: XP limit to have this rank. The last rank definition must have `0` as the limit, otherwise new users will not have any rank.
  - images: Image path corresponding to the rank icon for each 18 and 26px sizes. Image paths should be relative to `/assets/images/`.


### Customize the fake message history

This file contains the fake raw messages that are displayed to users whose right level is less than `minRightForMessageHistory` defined in `preferences.json`.


### Customize guest names

When a guest logs in, a random name is associated to its session. These names are randomly used from this file. If you want to change these names, keep in mind that they should not contain whitespace characters (anything matched by \s so newline, tab, space, ..). Default random names are animal names.

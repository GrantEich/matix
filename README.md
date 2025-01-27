# Matix 🤖💬

## 🌍 Overview

Matix is an on chain AI agent framework that allows anyone to launch AI agents on chain. Matix controls Twitter accounts and cryptocurrency wallets and can autonomously post to socials and interact with smart contracts.

### Use cases for Matix

- 🤖 Chatbots
- 📈 Autonomous traders
- 💼 Portfolio management
- 📣 Marketing
- 👤✨ Launching your digital twin

## 🛠️ Features

### Socials integrations

- 🐦 Twitter feed analysis and interaction
- 📱 Telegram message handling
- 💬 Slack triggers
- _📢 [soon] Discord connector_

### Blockchain integrations

- 💰 Matix blockchain account integration (balance tracking, token launching, trading)
- 🔒 _[soon] Launch in a TEE for full agent wallet control_
- 🌐 _[soon] Extensibility to any blockchain (Solana, Base, etc.)_

### Flexible and extensible model support

- 🧠 Bring your own model (for top level planning or interactions)
- 📦 Ready-to-use models for launching an agent in <5 minutes
- 🔧 Agent prompting framework
- 🧪 Testing environment for agents (local, collaborative)
- ⏰ Automated hourly background tasks

## 🚀 Launch your Echo

### Prerequisites

```
Python 3.11.x
```

### Requirements

See `pyproject.toml` for full dependency list

### Setup

1. Create and activate your own virtual environment. We recommend using [Miniconda](https://docs.anaconda.com/miniconda/install/).

```bash
conda create --name matix python=3.11
conda activate matix
```

2. Install dependencies:
   `make install`

This will install `matix` as a local package and install all necessary dependencies.

3. Set up environment variables
   Create a `.env` file in the echos_lab directory with necessary credentials for:

- Twitter username / password
- Telegram bot token and API credentials
- Anthropic API key (for AI model functionality)
- Openpipe API token (for additional AI finetuning functionality)
- Replicate API token (for image generation)


### Project Structure

```
Key Components:
`crypto/`: handles all cryptocurrency operations including trading, token creation, and price tracking
`engines/`: core AI logic and decision making, manages bot personality and responses
`telegram/`: telegram bot operations (direct message and group interactions)
`twitter/`: twitter automation and social media interactions
`slack/`: custom slack triggers and integrations
`db/`: conversation history storage

Configuration Files:
.env: Environment variables and API keys
requirements.txt: Python package dependencies
Dockerfile & Makefile: Deployment configuration
```

### Debugging Locally

1. Add tweet links to config file.

2. Generate examples from tweet data:

   ```
   matix testing generate-examples
   ```

   Note: Run this whenever the list of tweets changes.

3. Generate responses:

   ```
   matix testing generate-responses
   ```

4. Review output file:
   - Contents include:
     - Current timestamp
     - Current commit hash
     - Tweet thread contents
     - Tweet analysis and response for each tweet
     - Prompt used

# TAU. An AI-Powered Solana Bot

A next-generation Solana bot with integrated AI capabilities for intelligent transaction analysis, portfolio management, and market insights.

## 🌟 Features

### AI Integration
- Real-time transaction analysis and risk assessment
- Market insights and trading suggestions
- Portfolio optimization recommendations
- Intelligent wallet management

### Bot Features
- Compressed token support (zkCompression)
- Multi-token management
- Integrated DEX swaps
- Transaction history with AI analysis
- Portfolio analytics
- NFT support

### Technical Features
- Built with Next.js 13+ (App Router)
- TypeScript for type safety
- Tailwind CSS for styling
- Integration with major Solana protocols
  - Jupiter for swaps
  - Helius for RPC
  - Crossmint for wallet management
  - Meteora/Orca for LP management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm/pnpm
- A Solana wallet (Phantom, Solflare, etc.)

### Installation
```bash
# Clone the repository
git clone https://github.com/HidayatAriya/Tau-AI.git

# Navigate to the project directory
cd Tau-AI

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file with the following:
```env
# Solana Network Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_LOCAL_RPC_URL=http://localhost:8899
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_MAINNET_RPC_URL=https://api.mainnet-beta.solana.com

# AI Service Configuration
NEXT_PUBLIC_AI_SERVICE_URL=your_ai_service_url
NEXT_PUBLIC_AI_SERVICE_KEY=your_ai_service_key

# Wallet Configuration
NEXT_PUBLIC_WALLET_AUTOCONNECT=false
```

## 📖 Project Structure
```
src/
├── app/              # Next.js 13 app directory
├── components/       # React components
├── lib/             # Core libraries
│   ├── ai/          # AI integration
│   ├── wallet/      # Wallet functionality
│   └── utils/       # Utilities
├── services/        # External services
├── hooks/           # Custom React hooks
└── types/           # TypeScript types
```

## 🛠 Development

### Available Scripts
```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run build:prod
npm start

# Linting
npm run lint
npm run lint:fix
```

### Key Technologies
- Next.js 13+
- TypeScript
- Tailwind CSS
- Solana Web3.js
- AI Integration (Claude/GPT)
- shadcn/ui components

## 🔐 Security

This bot implements several security features:
- AI-powered transaction analysis
- Multi-signature support via Lit Protocol
- Trusted Execution Environment (TEE) verification
- Error boundaries and recovery mechanisms

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Solana Foundation
- Anthropic (Claude AI)
- Jupiter Aggregator
- Helius
- Crossmint
- All other contributors and sponsors

---

Built for the Solana AI Agent Hackathon 2024 🚀

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Telegram 2FA

This application is developed through [Fleek Hacker House](https://lu.ma/Fleek-Hacker-House-EthCC).

This project is tool for a Two-Factor Authentication (2FA) that leverages the power of Telegram Bot and Fleek functions to provide a highly secure and easier authentication mechanism

![](architecture.png)

## Features

- Enhanced Security: With multiple signatures, the authentication data is generated in a decentralized and tamper-proof manner, significantly reducing the risk of improper use
- User Convenience: The integration with Telegram Bot ensures that users can receive authentication codes and perform authentication seamlessly through a platform they are already familiar with.

## How to start

```
$ git clone git@github.com:Kourin1996/telegram-2fa.git

# Deploy contract
$ cd contracts && pnpm install && npx hardhat scripts/deploy deploy-telegram-auth-module.ts

# Deploy functions
$ cd bot && pnpm install && pnpm run deploy

# Deploy frontend
$ cd frontend && pnpm install && pnpm run deploy
```

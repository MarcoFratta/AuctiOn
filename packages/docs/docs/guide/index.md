# Introduction to AuctiOn

Welcome to the AuctiOn documentation! This guide will help you understand the platform, its architecture, and how to use
or contribute to it.

## What is AuctiOn?

AuctiOn is a real-time auction game platform built on a modern microservices architecture. It allows players to
participate in strategic auction games where they buy and sell items, bluff, and manage resources to win.

## Key Features

- **Real-time Bidding**: Place bids and see updates instantly
- **Strategic Gameplay**: Balance your inventory and coins to outmaneuver opponents
- **Lobby System**: Create and join game lobbies with friends
- **User Accounts**: Track your game history and performance
- **Secure Authentication**: Protect your account with modern security

## System Overview

The platform is built using a microservices architecture with the following components:

- **API Gateway**: Routes requests to the appropriate services
- **Auth Service**: Handles user authentication and authorization
- **User Service**: Manages user profiles and data
- **Lobby Service**: Handles game lobby creation and management
- **Auction Service**: Powers the real-time auction gameplay
- **Event Bus**: Enables communication between services using Kafka

## Next Steps

- Check out the [Game Rules](/game-rules) to understand how to play
- Explore the [Architecture](/architecture/) to learn about the system design
- See the [API Reference](/api-reference/) for technical details 
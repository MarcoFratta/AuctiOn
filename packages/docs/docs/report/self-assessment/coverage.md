# Test Coverage Reports

This page displays the test coverage reports for each microservice in the AuctiOn platform.The coverage reports provide
insights into the code quality and testing effectiveness.
They are generated from the **jest** coverage reports files.

## Auction service

### Overall Coverage

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 83%   | 1097/1324     |
| **Branches**   | 🟡 62%   | 95/153        |
| **Functions**  | 🟢 85%   | 317/372       |
| **Lines**      | 🟢 83%   | 1097/1324     |

### Coverage by Directory

#### src/middlewares

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🔴 0%    | 0/18          |
| **Branches**   | 🔴 0%    | 0/3           |
| **Functions**  | 🔴 0%    | 0/1           |
| **Lines**      | 🔴 0%    | 0/18          |

| File              | Statements   | Branches    | Functions   | Lines        |
|-------------------|--------------|-------------|-------------|--------------|
| AuthMiddleware.ts | 🔴 0% (0/18) | 🔴 0% (0/3) | 🔴 0% (0/1) | 🔴 0% (0/18) |

#### src/errors

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🔴 33%   | 1/3           |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🔴 0%    | 0/1           |
| **Lines**      | 🔴 33%   | 1/3           |

| File      | Statements   | Branches      | Functions   | Lines        |
|-----------|--------------|---------------|-------------|--------------|
| Errors.ts | 🔴 33% (1/3) | 🟢 100% (0/0) | 🔴 0% (0/1) | 🔴 33% (1/3) |

#### src

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 67%   | 75/112        |
| **Branches**   | 🔴 50%   | 1/2           |
| **Functions**  | 🟡 67%   | 14/21         |
| **Lines**      | 🟡 67%   | 75/112        |

| File      | Statements     | Branches      | Functions      | Lines          |
|-----------|----------------|---------------|----------------|----------------|
| Server.ts | 🔴 0% (0/21)   | 🟢 100% (0/0) | 🔴 0% (0/4)    | 🔴 0% (0/21)   |
| App.ts    | 🟢 82% (75/91) | 🔴 50% (1/2)  | 🟢 82% (14/17) | 🟢 82% (75/91) |

#### src/adapters

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 69%   | 45/65         |
| **Branches**   | 🔴 19%   | 3/16          |
| **Functions**  | 🟢 80%   | 16/20         |
| **Lines**      | 🟡 69%   | 45/65         |

| File                | Statements     | Branches      | Functions      | Lines          |
|---------------------|----------------|---------------|----------------|----------------|
| WebSocketAdapter.ts | 🟡 69% (45/65) | 🔴 19% (3/16) | 🟢 80% (16/20) | 🟡 69% (45/65) |

#### src/repositories

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 78%   | 77/99         |
| **Branches**   | 🔴 40%   | 4/10          |
| **Functions**  | 🟢 89%   | 25/28         |
| **Lines**      | 🟡 78%   | 77/99         |

| File                       | Statements      | Branches      | Functions       | Lines           |
|----------------------------|-----------------|---------------|-----------------|-----------------|
| TimerRepo.ts               | 🔴 43% (12/28)  | 🔴 0% (0/5)   | 🔴 57% (4/7)    | 🔴 43% (12/28)  |
| RedisAuctionRepo.ts        | 🟢 83% (25/30)  | 🟢 100% (1/1) | 🟢 100% (10/10) | 🟢 83% (25/30)  |
| RedisUserInfoRepository.ts | 🟢 93% (13/14)  | 🔴 50% (1/2)  | 🟢 100% (6/6)   | 🟢 93% (13/14)  |
| PlayerAuctionMapRepo.ts    | 🟢 100% (27/27) | 🟢 100% (2/2) | 🟢 100% (5/5)   | 🟢 100% (27/27) |

#### src/services

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 83%   | 235/282       |
| **Branches**   | 🟡 68%   | 28/41         |
| **Functions**  | 🟢 90%   | 65/72         |
| **Lines**      | 🟢 83%   | 235/282       |

| File                  | Statements       | Branches       | Functions       | Lines            |
|-----------------------|------------------|----------------|-----------------|------------------|
| UserServiceImpl.ts    | 🔴 54% (7/13)    | 🔴 0% (0/1)    | 🟡 71% (5/7)    | 🔴 54% (7/13)    |
| AuctionServiceImpl.ts | 🟢 81% (121/150) | 🟡 67% (14/21) | 🟢 86% (25/29)  | 🟢 81% (121/150) |
| TimerServiceImpl.ts   | 🟢 85% (64/75)   | 🟢 81% (13/16) | 🟢 93% (13/14)  | 🟢 85% (64/75)   |
| RedisLock.ts          | 🟢 95% (19/20)   | 🔴 33% (1/3)   | 🟢 100% (5/5)   | 🟢 95% (19/20)   |
| CallbacksService.ts   | 🟢 100% (24/24)  | 🟢 100% (0/0)  | 🟢 100% (17/17) | 🟢 100% (24/24)  |

#### src/controllers

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 84%   | 282/337       |
| **Branches**   | 🔴 54%   | 7/13          |
| **Functions**  | 🟡 77%   | 86/112        |
| **Lines**      | 🟢 84%   | 282/337       |

| File               | Statements     | Branches      | Functions       | Lines          |
|--------------------|----------------|---------------|-----------------|----------------|
| AuctionConsumer.ts | 🟡 76% (58/76) | 🔴 33% (1/3)  | 🟡 77% (20/26)  | 🟡 76% (58/76) |
| MessageSender.ts   | 🟡 76% (73/96) | 🔴 57% (4/7)  | 🟡 62% (23/37)  | 🟡 76% (73/96) |
| LobbyConsumer.ts   | 🟢 80% (35/44) | 🔴 50% (1/2)  | 🟡 64% (9/14)   | 🟢 80% (35/44) |
| MessageHandler.ts  | 🟢 91% (40/44) | 🟢 100% (0/0) | 🟢 94% (15/16)  | 🟢 91% (40/44) |
| AuctionProducer.ts | 🟢 99% (76/77) | 🟢 100% (1/1) | 🟢 100% (19/19) | 🟢 99% (76/77) |

#### src/domain/auctions

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 91%   | 221/242       |
| **Branches**   | 🟡 70%   | 32/46         |
| **Functions**  | 🟢 96%   | 71/74         |
| **Lines**      | 🟢 91%   | 221/242       |

| File                  | Statements       | Branches       | Functions       | Lines            |
|-----------------------|------------------|----------------|-----------------|------------------|
| PlayOrderStrategy.ts  | 🔴 25% (2/8)     | 🟢 100% (0/0)  | 🔴 50% (1/2)    | 🔴 25% (2/8)     |
| Timer.ts              | 🟢 81% (30/37)   | 🔴 38% (3/8)   | 🟢 83% (5/6)    | 🟢 81% (30/37)   |
| Auction.ts            | 🟢 94% (116/124) | 🟡 72% (23/32) | 🟢 96% (25/26)  | 🟢 94% (116/124) |
| AuctionFactory.ts     | 🟢 100% (7/7)    | 🟢 100% (0/0)  | 🟢 100% (2/2)   | 🟢 100% (7/7)    |
| Modifier.ts           | 🟢 100% (44/44)  | 🟢 100% (2/2)  | 🟢 100% (27/27) | 🟢 100% (44/44)  |
| PlayerFactory.ts      | 🟢 100% (6/6)    | 🟢 100% (0/0)  | 🟢 100% (1/1)   | 🟢 100% (6/6)    |
| WinStrategyFactory.ts | 🟢 100% (16/16)  | 🟢 100% (4/4)  | 🟢 100% (10/10) | 🟢 100% (16/16)  |

#### src/domain/messages

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 92%   | 49/53         |
| **Branches**   | 🟢 80%   | 4/5           |
| **Functions**  | 🟢 88%   | 14/16         |
| **Lines**      | 🟢 92%   | 49/53         |

| File              | Statements     | Branches     | Functions      | Lines          |
|-------------------|----------------|--------------|----------------|----------------|
| MessageFactory.ts | 🟢 92% (49/53) | 🟢 80% (4/5) | 🟢 88% (14/16) | 🟢 92% (49/53) |

#### src/domain/events

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 98%   | 42/43         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 92%   | 12/13         |
| **Lines**      | 🟢 98%   | 42/43         |

| File             | Statements     | Branches      | Functions      | Lines          |
|------------------|----------------|---------------|----------------|----------------|
| EventsFactory.ts | 🟢 98% (42/43) | 🟢 100% (0/0) | 🟢 92% (12/13) | 🟢 98% (42/43) |

#### src/configs

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 2/2           |
| **Branches**   | 🟢 92%   | 11/12         |
| **Functions**  | 🟢 100%  | 0/0           |
| **Lines**      | 🟢 100%  | 2/2           |

| File      | Statements    | Branches       | Functions     | Lines         |
|-----------|---------------|----------------|---------------|---------------|
| config.ts | 🟢 100% (2/2) | 🟢 92% (11/12) | 🟢 100% (0/0) | 🟢 100% (2/2) |

#### src/converters

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 21/21         |
| **Branches**   | 🟢 100%  | 4/4           |
| **Functions**  | 🟢 100%  | 12/12         |
| **Lines**      | 🟢 100%  | 21/21         |

| File                | Statements      | Branches      | Functions       | Lines           |
|---------------------|-----------------|---------------|-----------------|-----------------|
| AuctionConverter.ts | 🟢 100% (21/21) | 🟢 100% (4/4) | 🟢 100% (12/12) | 🟢 100% (21/21) |

#### src/schemas

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 43/43         |
| **Branches**   | 🟢 100%  | 1/1           |
| **Functions**  | 🟢 100%  | 2/2           |
| **Lines**      | 🟢 100%  | 43/43         |

| File           | Statements      | Branches      | Functions     | Lines           |
|----------------|-----------------|---------------|---------------|-----------------|
| Auction.ts     | 🟢 100% (9/9)   | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (9/9)   |
| Bid.ts         | 🟢 100% (2/2)   | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (2/2)   |
| Item.ts        | 🟢 100% (14/14) | 🟢 100% (1/1) | 🟢 100% (2/2) | 🟢 100% (14/14) |
| Leaderboard.ts | 🟢 100% (5/5)   | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (5/5)   |
| Player.ts      | 🟢 100% (7/7)   | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (7/7)   |
| Sale.ts        | 🟢 100% (4/4)   | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (4/4)   |
| User.ts        | 🟢 100% (2/2)   | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (2/2)   |

#### src/schemas/events

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 4/4           |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 0/0           |
| **Lines**      | 🟢 100%  | 4/4           |

| File      | Statements    | Branches      | Functions     | Lines         |
|-----------|---------------|---------------|---------------|---------------|
| Events.ts | 🟢 100% (4/4) | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (4/4) |

## Auth service

### Overall Coverage

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 73%   | 344/471       |
| **Branches**   | 🔴 59%   | 69/116        |
| **Functions**  | 🟡 74%   | 58/78         |
| **Lines**      | 🟡 73%   | 344/471       |

### Coverage by Directory

#### src

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 61%   | 43/70         |
| **Branches**   | 🔴 11%   | 1/9           |
| **Functions**  | 🔴 36%   | 4/11          |
| **Lines**      | 🟡 61%   | 43/70         |

| File      | Statements     | Branches     | Functions    | Lines          |
|-----------|----------------|--------------|--------------|----------------|
| server.ts | 🔴 0% (0/11)   | 🔴 0% (0/2)  | 🔴 0% (0/2)  | 🔴 0% (0/11)   |
| App.ts    | 🟡 73% (43/59) | 🔴 14% (1/7) | 🔴 44% (4/9) | 🟡 73% (43/59) |

#### src/repositories

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 68%   | 41/60         |
| **Branches**   | 🔴 57%   | 4/7           |
| **Functions**  | 🟢 87%   | 13/15         |
| **Lines**      | 🟡 68%   | 41/60         |

| File                | Statements     | Branches     | Functions     | Lines          |
|---------------------|----------------|--------------|---------------|----------------|
| RedisTokenRepo.ts   | 🔴 56% (23/41) | 🔴 0% (0/1)  | 🟡 78% (7/9)  | 🔴 56% (23/41) |
| MongoAccountRepo.ts | 🟢 95% (18/19) | 🟡 67% (4/6) | 🟢 100% (6/6) | 🟢 95% (18/19) |

#### src/services

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 69%   | 101/147       |
| **Branches**   | 🔴 34%   | 12/35         |
| **Functions**  | 🟢 83%   | 15/18         |
| **Lines**      | 🟡 69%   | 101/147       |

| File               | Statements      | Branches       | Functions      | Lines           |
|--------------------|-----------------|----------------|----------------|-----------------|
| MailClientImpl.ts  | 🔴 56% (9/16)   | 🟢 100% (0/0)  | 🟡 67% (2/3)   | 🔴 56% (9/16)   |
| AuthServiceImpl.ts | 🟡 70% (92/131) | 🔴 34% (12/35) | 🟢 87% (13/15) | 🟡 70% (92/131) |

#### src/templates

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 70%   | 7/10          |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟡 75%   | 3/4           |
| **Lines**      | 🟡 70%   | 7/10          |

| File              | Statements    | Branches      | Functions    | Lines         |
|-------------------|---------------|---------------|--------------|---------------|
| EmailTemplates.ts | 🟡 70% (7/10) | 🟢 100% (0/0) | 🟡 75% (3/4) | 🟡 70% (7/10) |

#### src/controllers

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 73%   | 64/88         |
| **Branches**   | 🔴 25%   | 3/12          |
| **Functions**  | 🟢 83%   | 10/12         |
| **Lines**      | 🟡 73%   | 64/88         |

| File              | Statements     | Branches      | Functions      | Lines          |
|-------------------|----------------|---------------|----------------|----------------|
| AuthController.ts | 🟡 73% (64/88) | 🔴 25% (3/12) | 🟢 83% (10/12) | 🟡 73% (64/88) |

#### src/domain

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 79%   | 11/14         |
| **Branches**   | 🟢 100%  | 3/3           |
| **Functions**  | 🔴 57%   | 4/7           |
| **Lines**      | 🟡 79%   | 11/14         |

| File                 | Statements     | Branches      | Functions    | Lines          |
|----------------------|----------------|---------------|--------------|----------------|
| JWTTokenGenerator.ts | 🟡 79% (11/14) | 🟢 100% (3/3) | 🔴 57% (4/7) | 🟡 79% (11/14) |

#### src/middlewares

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 85%   | 23/27         |
| **Branches**   | 🟡 79%   | 11/14         |
| **Functions**  | 🟡 67%   | 2/3           |
| **Lines**      | 🟢 85%   | 23/27         |

| File                | Statements     | Branches       | Functions    | Lines          |
|---------------------|----------------|----------------|--------------|----------------|
| ErrorsMiddleware.ts | 🟢 85% (23/27) | 🟡 79% (11/14) | 🟡 67% (2/3) | 🟢 85% (23/27) |

#### src/errors

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 92%   | 11/12         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 83%   | 5/6           |
| **Lines**      | 🟢 92%   | 11/12         |

| File          | Statements     | Branches      | Functions    | Lines          |
|---------------|----------------|---------------|--------------|----------------|
| AuthErrors.ts | 🟢 92% (11/12) | 🟢 100% (0/0) | 🟢 83% (5/6) | 🟢 92% (11/12) |

#### src/configs

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 3/3           |
| **Branches**   | 🟢 97%   | 35/36         |
| **Functions**  | 🟢 100%  | 0/0           |
| **Lines**      | 🟢 100%  | 3/3           |

| File           | Statements    | Branches       | Functions     | Lines         |
|----------------|---------------|----------------|---------------|---------------|
| config.ts      | 🟢 100% (2/2) | 🟢 97% (31/32) | 🟢 100% (0/0) | 🟢 100% (2/2) |
| emailConfig.ts | 🟢 100% (1/1) | 🟢 100% (4/4)  | 🟢 100% (0/0) | 🟢 100% (1/1) |

#### src/models

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 8/8           |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 1/1           |
| **Lines**      | 🟢 100%  | 8/8           |

| File            | Statements    | Branches      | Functions     | Lines         |
|-----------------|---------------|---------------|---------------|---------------|
| MongoAccount.ts | 🟢 100% (8/8) | 🟢 100% (0/0) | 🟢 100% (1/1) | 🟢 100% (8/8) |

#### src/routes

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 19/19         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 1/1           |
| **Lines**      | 🟢 100%  | 19/19         |

| File      | Statements      | Branches      | Functions     | Lines           |
|-----------|-----------------|---------------|---------------|-----------------|
| Routes.ts | 🟢 100% (19/19) | 🟢 100% (0/0) | 🟢 100% (1/1) | 🟢 100% (19/19) |

#### src/schemas

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 13/13         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 0/0           |
| **Lines**      | 🟢 100%  | 13/13         |

| File          | Statements      | Branches      | Functions     | Lines           |
|---------------|-----------------|---------------|---------------|-----------------|
| AuthSchema.ts | 🟢 100% (13/13) | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (13/13) |

## User service

### Overall Coverage

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 74%   | 156/210       |
| **Branches**   | 🔴 54%   | 15/28         |
| **Functions**  | 🟡 68%   | 32/47         |
| **Lines**      | 🟡 74%   | 156/210       |

### Coverage by Directory

#### src

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🔴 0%    | 0/42          |
| **Branches**   | 🔴 0%    | 0/1           |
| **Functions**  | 🔴 0%    | 0/11          |
| **Lines**      | 🔴 0%    | 0/42          |

| File      | Statements   | Branches      | Functions   | Lines        |
|-----------|--------------|---------------|-------------|--------------|
| App.ts    | 🔴 0% (0/32) | 🔴 0% (0/1)   | 🔴 0% (0/8) | 🔴 0% (0/32) |
| server.ts | 🔴 0% (0/10) | 🟢 100% (0/0) | 🔴 0% (0/3) | 🔴 0% (0/10) |

#### src/configs

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🔴 0%    | 0/1           |
| **Branches**   | 🔴 0%    | 0/4           |
| **Functions**  | 🟢 100%  | 0/0           |
| **Lines**      | 🔴 0%    | 0/1           |

| File      | Statements  | Branches    | Functions     | Lines       |
|-----------|-------------|-------------|---------------|-------------|
| config.ts | 🔴 0% (0/1) | 🔴 0% (0/4) | 🟢 100% (0/0) | 🔴 0% (0/1) |

#### src/middlewares

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 80%   | 16/20         |
| **Branches**   | 🟡 63%   | 5/8           |
| **Functions**  | 🟡 67%   | 2/3           |
| **Lines**      | 🟢 80%   | 16/20         |

| File                | Statements     | Branches     | Functions    | Lines          |
|---------------------|----------------|--------------|--------------|----------------|
| ErrorsMiddleware.ts | 🟢 80% (16/20) | 🟡 63% (5/8) | 🟡 67% (2/3) | 🟢 80% (16/20) |

#### src/errors

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 83%   | 10/12         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟡 67%   | 4/6           |
| **Lines**      | 🟢 83%   | 10/12         |

| File          | Statements     | Branches      | Functions    | Lines          |
|---------------|----------------|---------------|--------------|----------------|
| UserErrors.ts | 🟢 83% (10/12) | 🟢 100% (0/0) | 🟡 67% (4/6) | 🟢 83% (10/12) |

#### src/repositories

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 89%   | 24/27         |
| **Branches**   | 🟡 60%   | 6/10          |
| **Functions**  | 🟢 88%   | 7/8           |
| **Lines**      | 🟢 89%   | 24/27         |

| File             | Statements     | Branches      | Functions    | Lines          |
|------------------|----------------|---------------|--------------|----------------|
| MongoUserRepo.ts | 🟢 89% (24/27) | 🟡 60% (6/10) | 🟢 88% (7/8) | 🟢 89% (24/27) |

#### src/services

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 93%   | 27/29         |
| **Branches**   | 🟢 80%   | 4/5           |
| **Functions**  | 🟢 100%  | 7/7           |
| **Lines**      | 🟢 93%   | 27/29         |

| File           | Statements     | Branches     | Functions     | Lines          |
|----------------|----------------|--------------|---------------|----------------|
| UserService.ts | 🟢 93% (27/29) | 🟢 80% (4/5) | 🟢 100% (7/7) | 🟢 93% (27/29) |

#### src/controllers

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 44/44         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 7/7           |
| **Lines**      | 🟢 100%  | 44/44         |

| File              | Statements      | Branches      | Functions     | Lines           |
|-------------------|-----------------|---------------|---------------|-----------------|
| UserController.ts | 🟢 100% (44/44) | 🟢 100% (0/0) | 🟢 100% (7/7) | 🟢 100% (44/44) |

#### src/models

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 9/9           |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 2/2           |
| **Lines**      | 🟢 100%  | 9/9           |

| File         | Statements    | Branches      | Functions     | Lines         |
|--------------|---------------|---------------|---------------|---------------|
| MongoUser.ts | 🟢 100% (9/9) | 🟢 100% (0/0) | 🟢 100% (2/2) | 🟢 100% (9/9) |

#### src/routes

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 14/14         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 1/1           |
| **Lines**      | 🟢 100%  | 14/14         |

| File          | Statements      | Branches      | Functions     | Lines           |
|---------------|-----------------|---------------|---------------|-----------------|
| UserRoutes.ts | 🟢 100% (14/14) | 🟢 100% (0/0) | 🟢 100% (1/1) | 🟢 100% (14/14) |

#### src/schemas

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 4/4           |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 0/0           |
| **Lines**      | 🟢 100%  | 4/4           |

| File    | Statements    | Branches      | Functions     | Lines         |
|---------|---------------|---------------|---------------|---------------|
| User.ts | 🟢 100% (4/4) | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (4/4) |

#### src/utils

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 8/8           |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 2/2           |
| **Lines**      | 🟢 100%  | 8/8           |

| File          | Statements    | Branches      | Functions     | Lines         |
|---------------|---------------|---------------|---------------|---------------|
| Converters.ts | 🟢 100% (8/8) | 🟢 100% (0/0) | 🟢 100% (2/2) | 🟢 100% (8/8) |

## Lobby service

### Overall Coverage

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 88%   | 528/602       |
| **Branches**   | 🟢 80%   | 65/81         |
| **Functions**  | 🟢 92%   | 107/116       |
| **Lines**      | 🟢 88%   | 528/602       |

### Coverage by Directory

#### src

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟡 61%   | 46/76         |
| **Branches**   | 🟢 80%   | 4/5           |
| **Functions**  | 🟡 60%   | 9/15          |
| **Lines**      | 🟡 61%   | 46/76         |

| File      | Statements     | Branches      | Functions     | Lines          |
|-----------|----------------|---------------|---------------|----------------|
| server.ts | 🔴 0% (0/25)   | 🟢 100% (0/0) | 🔴 0% (0/5)   | 🔴 0% (0/25)   |
| App.ts    | 🟢 90% (46/51) | 🟢 80% (4/5)  | 🟢 90% (9/10) | 🟢 90% (46/51) |

#### src/repositories

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 85%   | 35/41         |
| **Branches**   | 🟢 100%  | 8/8           |
| **Functions**  | 🟢 100%  | 13/13         |
| **Lines**      | 🟢 85%   | 35/41         |

| File                  | Statements      | Branches      | Functions     | Lines           |
|-----------------------|-----------------|---------------|---------------|-----------------|
| MongoLobbyRepo.ts     | 🟡 77% (20/26)  | 🟢 100% (5/5) | 🟢 100% (5/5) | 🟡 77% (20/26)  |
| MongoUserLobbyRepo.ts | 🟢 100% (15/15) | 🟢 100% (3/3) | 🟢 100% (8/8) | 🟢 100% (15/15) |

#### src/middlewares

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 86%   | 65/76         |
| **Branches**   | 🟢 86%   | 25/29         |
| **Functions**  | 🟢 100%  | 7/7           |
| **Lines**      | 🟢 86%   | 65/76         |

| File                     | Statements     | Branches       | Functions     | Lines          |
|--------------------------|----------------|----------------|---------------|----------------|
| AuthMiddleware.ts        | 🔴 53% (9/17)  | 🔴 50% (1/2)   | 🟢 100% (1/1) | 🔴 53% (9/17)  |
| ErrorsMiddleware.ts      | 🟢 94% (33/35) | 🟢 91% (20/22) | 🟢 100% (3/3) | 🟢 94% (33/35) |
| ActiveLobbyMiddleware.ts | 🟢 96% (23/24) | 🟢 80% (4/5)   | 🟢 100% (3/3) | 🟢 96% (23/24) |

#### src/controllers

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 91%   | 135/149       |
| **Branches**   | 🔴 50%   | 2/4           |
| **Functions**  | 🟢 96%   | 25/26         |
| **Lines**      | 🟢 91%   | 135/149       |

| File               | Statements     | Branches      | Functions       | Lines          |
|--------------------|----------------|---------------|-----------------|----------------|
| KafkaProducer.ts   | 🟢 88% (49/56) | 🟢 100% (0/0) | 🟢 100% (11/11) | 🟢 88% (49/56) |
| LobbyController.ts | 🟢 92% (61/66) | 🔴 50% (1/2)  | 🟢 100% (8/8)   | 🟢 92% (61/66) |
| KafkaConsumer.ts   | 🟢 93% (25/27) | 🔴 50% (1/2)  | 🟢 86% (6/7)    | 🟢 93% (25/27) |

#### src/converters

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 91%   | 10/11         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟡 67%   | 2/3           |
| **Lines**      | 🟢 91%   | 10/11         |

| File                  | Statements    | Branches      | Functions     | Lines         |
|-----------------------|---------------|---------------|---------------|---------------|
| LobbyConverters.ts    | 🟢 86% (6/7)  | 🟢 100% (0/0) | 🔴 50% (1/2)  | 🟢 86% (6/7)  |
| UserLobbyConverter.ts | 🟢 100% (4/4) | 🟢 100% (0/0) | 🟢 100% (1/1) | 🟢 100% (4/4) |

#### src/services

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 92%   | 128/139       |
| **Branches**   | 🟡 67%   | 16/24         |
| **Functions**  | 🟢 100%  | 28/28         |
| **Lines**      | 🟢 92%   | 128/139       |

| File                | Statements       | Branches       | Functions       | Lines            |
|---------------------|------------------|----------------|-----------------|------------------|
| LobbyServiceImpl.ts | 🟢 92% (128/139) | 🟡 67% (16/24) | 🟢 100% (28/28) | 🟢 92% (128/139) |

#### src/errors

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 96%   | 22/23         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 91%   | 10/11         |
| **Lines**      | 🟢 96%   | 22/23         |

| File           | Statements     | Branches      | Functions      | Lines          |
|----------------|----------------|---------------|----------------|----------------|
| LobbyErrors.ts | 🟢 96% (22/23) | 🟢 100% (0/0) | 🟢 91% (10/11) | 🟢 96% (22/23) |

#### src/configs

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 1/1           |
| **Branches**   | 🟢 90%   | 9/10          |
| **Functions**  | 🟢 100%  | 0/0           |
| **Lines**      | 🟢 100%  | 1/1           |

| File      | Statements    | Branches      | Functions     | Lines         |
|-----------|---------------|---------------|---------------|---------------|
| config.ts | 🟢 100% (1/1) | 🟢 90% (9/10) | 🟢 100% (0/0) | 🟢 100% (1/1) |

#### src/domain/events

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 21/21         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 7/7           |
| **Lines**      | 🟢 100%  | 21/21         |

| File            | Statements      | Branches      | Functions     | Lines           |
|-----------------|-----------------|---------------|---------------|-----------------|
| EventFactory.ts | 🟢 100% (21/21) | 🟢 100% (0/0) | 🟢 100% (7/7) | 🟢 100% (21/21) |

#### src/models

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 11/11         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 1/1           |
| **Lines**      | 🟢 100%  | 11/11         |

| File              | Statements    | Branches      | Functions     | Lines         |
|-------------------|---------------|---------------|---------------|---------------|
| LobbyModel.ts     | 🟢 100% (7/7) | 🟢 100% (0/0) | 🟢 100% (1/1) | 🟢 100% (7/7) |
| UserLobbyModel.ts | 🟢 100% (4/4) | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (4/4) |

#### src/routes

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 16/16         |
| **Branches**   | 🟢 100%  | 0/0           |
| **Functions**  | 🟢 100%  | 1/1           |
| **Lines**      | 🟢 100%  | 16/16         |

| File           | Statements      | Branches      | Functions     | Lines           |
|----------------|-----------------|---------------|---------------|-----------------|
| LobbyRoutes.ts | 🟢 100% (16/16) | 🟢 100% (0/0) | 🟢 100% (1/1) | 🟢 100% (16/16) |

#### src/schemas

| Type           | Coverage | Covered/Total |
|----------------|----------|---------------|
| **Statements** | 🟢 100%  | 38/38         |
| **Branches**   | 🟢 100%  | 1/1           |
| **Functions**  | 🟢 100%  | 4/4           |
| **Lines**      | 🟢 100%  | 38/38         |

| File            | Statements      | Branches      | Functions     | Lines           |
|-----------------|-----------------|---------------|---------------|-----------------|
| Item.ts         | 🟢 100% (14/14) | 🟢 100% (1/1) | 🟢 100% (2/2) | 🟢 100% (14/14) |
| Lobby.ts        | 🟢 100% (11/11) | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (11/11) |
| LobbyFactory.ts | 🟢 100% (8/8)   | 🟢 100% (0/0) | 🟢 100% (2/2) | 🟢 100% (8/8)   |
| User.ts         | 🟢 100% (2/2)   | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (2/2)   |
| UserLobby.ts    | 🟢 100% (3/3)   | 🟢 100% (0/0) | 🟢 100% (0/0) | 🟢 100% (3/3)   |

## Api gateway

No coverage data available for this service.


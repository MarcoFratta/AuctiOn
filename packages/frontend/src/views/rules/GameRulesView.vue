<template>
  <Background>
    <div class="w-full max-w-4xl mx-auto overflow-y-auto mt-2 lg:mt-6 px-4 py-2 lg:py:4">
      <!-- Header -->
      <div class="mb-12 text-center">
        <Title class="text-4xl lg:text-5xl mb-4">Game Rules</Title>
        <p class="text-gray-600 dark:text-app-white text-xl">
          An online real-time auction game of bluffing, bidding, and resource management
        </p>
      </div>

      <!-- Introduction Section -->
      <section class="mb-10">
        <BaseCard>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
            <span class="mr-2">📜</span> Introduction
          </h2>
          <p class="text-gray-700 dark:text-app-white mb-6">
            AuctiOn is a turn-based auction game where players strategically buy and sell items to
            accumulate as much virtual currency as possible by the end of the game. Players must
            balance their inventory, engage in bidding wars, bluff, and manage their resources
            effectively.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <InnerCard class="flex flex-col justify-center items-center gap-1">
              <GameShapes size="lg" type="triangle" />
              <h2 class="text-violet-600 dark:text-app-violet-400 text-lg font-bold">Triangle</h2>
              <p class="text-gray-600 dark:text-app-violet-300 text-sm">Weight: 5</p>
            </InnerCard>
            <InnerCard class="flex flex-col justify-center items-center gap-1">
              <GameShapes size="lg" type="circle" />
              <h2 class="text-violet-600 dark:text-app-violet-400 text-lg font-bold">Circle</h2>
              <p class="text-gray-600 dark:text-app-violet-300 text-sm">Weight: 3</p>
            </InnerCard>
            <InnerCard class="flex flex-col justify-center items-center gap-1">
              <GameShapes size="lg" type="square" />
              <h2 class="text-violet-600 dark:text-app-violet-400 text-lg font-bold">Square</h2>
              <p class="text-gray-600 dark:text-app-violet-300 text-sm">Weight: 1</p>
            </InnerCard>
          </div>
        </BaseCard>
      </section>

      <!-- Objective and Setup Section -->
      <section class="mb-10">
        <BaseCard>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
            <span class="mr-2">🎯</span> Objective & Game Setup
          </h2>
          <div class="space-y-4">
            <InnerCard>
              <h3 class="text-xl text-zinc-900 dark:text-white font-semibold mb-2">Objective</h3>
              <p class="text-gray-700 dark:text-app-white">
                Players aim to accumulate the highest amount of virtual coins by the end of the game
                while meeting specific item requirements.
              </p>
            </InnerCard>
            <InnerCard>
              <h3 class="text-xl text-zinc-900 dark:text-white font-semibold mb-2">
                Starting Resources
              </h3>
              <ul class="list-disc list-inside text-gray-700 dark:text-app-white space-y-2">
                <li>
                  Each player starts with a random assortment of items (Squares, Triangles, Circles)
                </li>
              </ul>
            </InnerCard>
            <InnerCard>
              <h3 class="text-xl text-zinc-900 dark:text-white font-semibold mb-2">
                Turn Structure
              </h3>
              <p class="text-gray-700 dark:text-app-white">
                Each turn, one player acts as the "seller," while the others are "buyers." The
                seller offers a batch of items, revealing only the total weight.
              </p>
            </InnerCard>
          </div>
        </BaseCard>
      </section>

      <!-- Game Mechanics Section -->
      <section class="mb-10">
        <BaseCard>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
            <span class="mr-2">⚙️</span> Game Mechanics
          </h2>

          <div class="space-y-6">
            <!-- Selling Phase -->
            <InnerCard>
              <div class="flex items-center mb-3">
                <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                  <span class="text-xl">💎</span>
                </div>
                <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">Selling Phase</h3>
              </div>
              <p class="text-gray-700 dark:text-app-white mb-2">
                The seller selects a batch of items to sell and announces the total weight. Buyers
                do not know the exact quantity or types of items.
              </p>
              <StrategyTip>
                As a seller, consider creating batches that might confuse buyers about the true
                value.
              </StrategyTip>
            </InnerCard>

            <!-- Bidding Phase -->
            <InnerCard>
              <div class="flex items-center mb-3">
                <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                  <span class="text-xl">💰</span>
                </div>
                <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">Bidding Phase</h3>
              </div>
              <p class="text-gray-700 dark:text-app-white mb-2">
                Each buyer bids a number of coins. The highest bidder wins and receives the items.
                The seller earns the bid amount.
              </p>
              <StrategyTip>
                Consider the potential value of the items versus your current inventory needs when
                bidding.
              </StrategyTip>
            </InnerCard>

            <!-- Bluffing and Strategy -->
            <InnerCard>
              <div class="flex items-center mb-3">
                <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                  <span class="text-xl">🎭</span>
                </div>
                <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">
                  Bluffing & Strategy
                </h3>
              </div>
              <p class="text-gray-700 dark:text-app-white mb-2">
                Sellers can bluff to drive up bids; buyers must decide how much to risk based on
                limited information.
              </p>
              <StrategyTip>
                Pay attention to other players' bidding patterns to identify when they might be
                desperate for certain items.
              </StrategyTip>
            </InnerCard>

            <!-- Item Rules -->
            <InnerCard>
              <div class="flex items-center mb-3">
                <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                  <span class="text-xl">⚠️</span>
                </div>
                <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">
                  Item Requirements
                </h3>
              </div>
              <ul class="list-disc list-inside text-gray-700 dark:text-app-white space-y-2">
                <li>
                  Players must end the game with at least one item; those with zero items are
                  disqualified from winning.
                </li>
                <li>
                  Players cannot win if they finish the game with more items than any other player.
                </li>
              </ul>
              <StrategyTip label="Important">
                Balance your inventory! Too many or too few items will cost you the game.
              </StrategyTip>
            </InnerCard>
          </div>
        </BaseCard>
      </section>

      <!-- Victory Conditions Section -->
      <section class="mb-10">
        <BaseCard>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
            <span class="mr-2">🏆</span> Victory Conditions
          </h2>

          <InnerCard class="mb-6">
            <p class="text-gray-700 dark:text-app-white mb-4">
              When all turns are completed, players first calculate their Set Collection Bonus (see
              below), which is added to their coin total. Then, the player with the most coins, who
              also meets the item requirements, wins.
            </p>
            <!-- Existing Win Conditions Box -->
            <div
              class="bg-violet-50 dark:bg-neutral-800 p-4 rounded-lg border border-violet-200 dark:border-app-fuchsia-600/30"
            >
              <h3 class="text-xl text-violet-600 dark:text-app-fuchsia-400 font-semibold mb-2">
                To Win, You Must:
              </h3>
              <ul class="list-disc list-inside text-gray-700 dark:text-app-white space-y-2">
                <li>Have at least one item</li>
                <li>Not have the most items among all players</li>
                <li>
                  Have the highest number of coins (including Set Bonus) among eligible players
                </li>
              </ul>
            </div>
          </InnerCard>

          <!-- Set Collection Bonus Card -->
          <InnerCard>
            <div class="flex items-center mb-3">
              <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                <span class="text-xl">🎁</span>
                <!-- Using a gift box icon for bonus -->
              </div>
              <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">
                Set Collection Bonus
              </h3>
            </div>
            <p class="text-gray-700 dark:text-app-white mb-4">
              At the end of the game, after all rounds are complete, players earn bonus coins for
              collecting sets of identical items. A 'set' consists of exactly
              <strong>3</strong> identical items.
            </p>
            <p class="text-gray-700 dark:text-app-white mb-4">
              For each complete set you possess, you gain bonus coins equal to
              <strong>10 times the item's weight</strong>. Only complete sets count; leftover items
              do not contribute to this bonus.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div
                class="text-center p-3 bg-gray-50 dark:bg-neutral-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <GameShapes class="mx-auto mb-1" size="md" type="square" />
                <p class="font-semibold text-zinc-800 dark:text-gray-200">1 Set of Squares</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">(3 items)</p>
                <p class="text-lg font-bold text-violet-600 dark:text-app-violet-400">+10 Coins</p>
                <p class="text-xs text-gray-500 dark:text-gray-500">(10 x 1 weight)</p>
              </div>
              <div
                class="text-center p-3 bg-gray-50 dark:bg-neutral-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <GameShapes class="mx-auto mb-1" size="md" type="triangle" />
                <p class="font-semibold text-zinc-800 dark:text-gray-200">1 Set of Triangles</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">(3 items)</p>
                <p class="text-lg font-bold text-violet-600 dark:text-app-violet-400">+50 Coins</p>
                <p class="text-xs text-gray-500 dark:text-gray-500">(10 x 5 weight)</p>
              </div>
              <div
                class="text-center p-3 bg-gray-50 dark:bg-neutral-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <GameShapes class="mx-auto mb-1" size="md" type="circle" />
                <p class="font-semibold text-zinc-800 dark:text-gray-200">1 Set of Circles</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">(3 items)</p>
                <p class="text-lg font-bold text-violet-600 dark:text-app-violet-400">+30 Coins</p>
                <p class="text-xs text-gray-500 dark:text-gray-500">(10 x 3 weight)</p>
              </div>
            </div>
            <StrategyTip>
              Collecting sets, especially high-weight ones like Triangles, can significantly boost
              your final score! Balance set collection with the standard item requirements.
            </StrategyTip>
          </InnerCard>
        </BaseCard>
      </section>

      <!-- Future Expansions Section -->
      <section class="mb-10">
        <BaseCard class="overflow-hidden">
          <div class="relative">
            <!-- Remove the violet background gradient -->

            <div class="relative z-10">
              <!-- Header with animated stars -->
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-zinc-900 dark:text-white flex items-center">
                  <span class="mr-2">🚀</span> Coming Soon
                </h2>
                <div class="flex space-x-1">
                  <span class="animate-pulse-delayed-1 text-yellow-400">✨</span>
                  <span class="animate-pulse-delayed-2 text-yellow-400">✨</span>
                  <span class="animate-pulse-delayed-3 text-yellow-400">✨</span>
                </div>
              </div>

              <!-- Feature cards with hover effects -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Market Events -->
                <div class="feature-card group">
                  <div
                    class="absolute top-0 right-0 p-2 opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12"
                  >
                    <GameShapes animated color="violet" type="circle" />
                  </div>
                  <h3
                    class="text-violet-600 dark:text-app-fuchsia-400 text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform"
                  >
                    Market Events
                  </h3>
                  <p
                    class="text-gray-600 dark:text-app-violet-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors"
                  >
                    Periodic changes in item values or temporary bonuses for holding specific types
                    of items.
                  </p>
                  <div
                    class="mt-3 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-300"
                  ></div>
                </div>

                <!-- Power-ups -->
                <div class="feature-card group">
                  <div
                    class="absolute top-0 right-0 p-2 opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12"
                  >
                    <GameShapes animated color="fuchsia" type="triangle" />
                  </div>
                  <h3
                    class="text-violet-600 dark:text-app-fuchsia-400 text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform"
                  >
                    Power-ups
                  </h3>
                  <p
                    class="text-gray-600 dark:text-app-violet-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors"
                  >
                    Special abilities that let you inspect item types, block other players, or gain
                    auction advantages.
                  </p>
                  <div
                    class="mt-3 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-300"
                  ></div>
                </div>

                <!-- Friend System -->
                <div class="feature-card group">
                  <div
                    class="absolute top-0 right-0 p-2 opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12"
                  >
                    <GameShapes animated color="violet" type="square" />
                  </div>
                  <h3
                    class="text-violet-600 dark:text-app-fuchsia-400 text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform"
                  >
                    Friend System
                  </h3>
                  <p
                    class="text-gray-600 dark:text-app-violet-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors"
                  >
                    Connect with other players, send friend requests, and invite friends directly to
                    your game lobbies.
                  </p>
                  <div
                    class="mt-3 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-300"
                  ></div>
                </div>
              </div>

              <!-- Newsletter signup teaser - replace violet background with a subtle border -->
              <div
                class="mt-6 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between shadow-sm"
              >
                <div>
                  <h3 class="text-zinc-800 dark:text-white font-semibold mb-1">Stay Updated</h3>
                  <p class="text-gray-600 dark:text-gray-300 text-sm">
                    Be the first to know when new features are released!
                  </p>
                </div>
                <button
                  class="mt-3 sm:mt-0 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors shadow-sm hover:shadow-md"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>
    </div>
  </Background>
</template>

<script lang="ts" setup>
import Background from '@/components/common/Background.vue'
import GameShapes from '@/components/icons/GameShapes.vue'
import Title from '@/components/common/Title.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import InnerCard from '@/components/common/InnerCard.vue'
import StrategyTip from '@/components/rules/StrategyTip.vue'
</script>

<style scoped>
/* Smooth transitions */
.transform {
  transition: all 0.2s ease;
}

/* Subtle hover effects */
.bg-gray-50:hover {
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
}

.dark .bg-app-black-90:hover {
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.15);
}

/* List styling */
ul.list-disc {
  padding-left: 1rem;
}

ul.list-disc li {
  margin-bottom: 0.5rem;
}

ul.list-disc li::marker {
  color: #9ca3af;
}

/* Hide scrollbar completely while maintaining scroll functionality */
.overflow-y-auto {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.overflow-y-auto::-webkit-scrollbar {
  display: none;
}

/* Gradient text effect for title */
.dark .bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Feature card styling */
.feature-card {
  @apply relative p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300;
  @apply border border-violet-100 dark:border-violet-900/50;
  @apply overflow-hidden;
}

/* Pulse animations for stars */
@keyframes pulse-delayed-1 {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes pulse-delayed-2 {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes pulse-delayed-3 {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.animate-pulse-delayed-1 {
  animation: pulse-delayed-1 2s infinite;
}

.animate-pulse-delayed-2 {
  animation: pulse-delayed-2 2s infinite 0.6s;
}

.animate-pulse-delayed-3 {
  animation: pulse-delayed-3 2s infinite 1.2s;
}
</style>

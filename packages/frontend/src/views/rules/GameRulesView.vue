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
          <p class="text-gray-700 dark:text-app-white mb-4">
            AuctiOn is a turn-based auction game where players strategically buy and sell items to
            accumulate as much virtual currency as possible by the end of the game. Players must
            balance their inventory, engage in bidding wars, bluff, and manage their resources
            effectively.
          </p>
          <p class="text-gray-700 dark:text-app-white">
            The game revolves around limited information - sellers reveal only the total weight of
            their items, creating opportunities for strategic deception and calculated risk-taking.
          </p>
        </BaseCard>
      </section>

      <!-- Game Items Section -->
      <section class="mb-10">
        <BaseCard>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
            <span class="mr-2">🎲</span> Game Items
          </h2>
          <p class="text-gray-700 dark:text-app-white mb-6">
            The game features three types of items, each with different weights that determine their
            strategic value:
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InnerCard class="flex flex-col justify-center items-center gap-1">
              <GameShapes size="lg" type="triangle" />
              <h2 class="text-violet-600 dark:text-app-violet-400 text-lg font-bold">Triangle</h2>
              <p class="text-gray-600 dark:text-app-violet-300 text-sm">Weight: 5</p>
              <p class="text-gray-500 dark:text-gray-400 text-xs text-center">Highest value item</p>
            </InnerCard>
            <InnerCard class="flex flex-col justify-center items-center gap-1">
              <GameShapes size="lg" type="circle" />
              <h2 class="text-violet-600 dark:text-app-violet-400 text-lg font-bold">Circle</h2>
              <p class="text-gray-600 dark:text-app-violet-300 text-sm">Weight: 3</p>
              <p class="text-gray-500 dark:text-gray-400 text-xs text-center">Medium value item</p>
            </InnerCard>
            <InnerCard class="flex flex-col justify-center items-center gap-1">
              <GameShapes size="lg" type="square" />
              <h2 class="text-violet-600 dark:text-app-violet-400 text-lg font-bold">Square</h2>
              <p class="text-gray-600 dark:text-app-violet-300 text-sm">Weight: 1</p>
              <p class="text-gray-500 dark:text-gray-400 text-xs text-center">Basic value item</p>
            </InnerCard>
          </div>
          <StrategyTip>
            Item weights are crucial for both sellers (determining batch weight) and buyers
            (estimating value)!
          </StrategyTip>
        </BaseCard>
      </section>

      <!-- Game Setup Section -->
      <section class="mb-10">
        <BaseCard>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
            <span class="mr-2">⚙️</span> Game Setup
          </h2>
          <div class="space-y-4">
            <InnerCard>
              <h3 class="text-xl text-zinc-900 dark:text-white font-semibold mb-2">Players</h3>
              <p class="text-gray-700 dark:text-app-white">
                Multiple players can participate in each game session with no maximum limit.
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
                <li>All players begin with the same number of virtual coins for bidding</li>
                <li>Starting inventory is balanced to ensure fair gameplay</li>
                <li>No player knows the exact starting inventory of other players</li>
              </ul>
            </InnerCard>
            <InnerCard>
              <h3 class="text-xl text-zinc-900 dark:text-white font-semibold mb-2">Game Length</h3>
              <p class="text-gray-700 dark:text-app-white">
                Each player gets exactly one turn as the seller, making the total number of rounds
                equal to the number of players.
              </p>
            </InnerCard>
          </div>
        </BaseCard>
      </section>

      <!-- Turn Structure & Mechanics Section -->
      <section class="mb-10">
        <BaseCard>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
            <span class="mr-2">🔄</span> Turn Structure & Mechanics
          </h2>

          <div class="space-y-6">
            <!-- Turn Overview -->
            <InnerCard>
              <h3 class="text-xl text-zinc-900 dark:text-white font-semibold mb-3">
                Turn Overview
              </h3>
              <p class="text-gray-700 dark:text-app-white mb-4">
                Each turn, one player acts as the "seller," while all others become "buyers." The
                seller role rotates through all players until everyone has had one turn to sell.
              </p>
              <div
                class="bg-violet-50 dark:bg-neutral-800 p-4 rounded-lg border border-violet-200 dark:border-app-fuchsia-600/30"
              >
                <h4 class="text-lg font-semibold text-violet-600 dark:text-app-fuchsia-400 mb-2">
                  Turn Phases
                </h4>
                <ol class="list-decimal list-inside text-gray-700 dark:text-app-white space-y-1">
                  <li>Seller selects items to auction</li>
                  <li>Seller announces total weight only</li>
                  <li>Buyers place their bids simultaneously</li>
                  <li>Highest bidder wins the items</li>
                  <li>Coins and items are transferred</li>
                </ol>
              </div>
            </InnerCard>

            <!-- Selling Phase -->
            <InnerCard>
              <div class="flex items-center mb-3">
                <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                  <span class="text-xl">💎</span>
                </div>
                <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">Selling Phase</h3>
              </div>
              <p class="text-gray-700 dark:text-app-white mb-2">
                The seller selects a batch of items from their inventory to auction and announces
                only the total weight. Buyers do not know the exact quantity, types, or distribution
                of items in the batch.
              </p>
              <StrategyTip>
                As a seller, consider creating batches that might confuse buyers about the true
                value - mix high and low value items strategically!
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
              <p class="text-gray-700 dark:text-app-white mb-4">
                All buyers simultaneously place their bids using their available coins. The highest
                bidder wins the entire batch and pays their bid amount to the seller.
              </p>
              <div class="bg-gray-50 dark:bg-neutral-800 p-3 rounded border">
                <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Bidding Rules:</h4>
                <ul
                  class="list-disc list-inside text-gray-700 dark:text-app-white space-y-1 text-sm"
                >
                  <li>Bids are placed simultaneously and revealed together</li>
                  <li>Ties are resolved randomly</li>
                  <li>You cannot bid more coins than you currently have</li>
                  <li>Winning bidder receives all items in the batch</li>
                </ul>
              </div>
              <StrategyTip>
                Consider the potential value range based on weight and your current inventory needs
                when bidding!
              </StrategyTip>
            </InnerCard>
          </div>
        </BaseCard>
      </section>

      <!-- Strategic Elements Section -->
      <section class="mb-10">
        <BaseCard>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
            <span class="mr-2">🎭</span> Strategic Elements
          </h2>

          <div class="space-y-6">
            <!-- Bluffing and Deception -->
            <InnerCard>
              <div class="flex items-center mb-3">
                <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                  <span class="text-xl">🃏</span>
                </div>
                <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">
                  Bluffing & Information Warfare
                </h3>
              </div>
              <p class="text-gray-700 dark:text-app-white mb-2">
                Since only total weight is revealed, sellers can strategically mislead buyers about
                the actual contents. A weight of 15 could be 3 triangles (high value) or 15 squares
                (low value)!
              </p>
              <StrategyTip>
                Pay attention to other players' bidding patterns and inventory needs to identify
                when they might be desperate for certain items.
              </StrategyTip>
            </InnerCard>

            <!-- Resource Management -->
            <InnerCard>
              <div class="flex items-center mb-3">
                <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                  <span class="text-xl">⚖️</span>
                </div>
                <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">
                  Resource Management
                </h3>
              </div>
              <p class="text-gray-700 dark:text-app-white mb-2">
                Balance your coin spending with inventory management. Spending too much early might
                leave you unable to bid on crucial later auctions.
              </p>
              <StrategyTip>
                Remember that earning coins as a seller is just as important as winning auctions as
                a buyer!
              </StrategyTip>
            </InnerCard>
          </div>
        </BaseCard>
      </section>

      <!-- Item Requirements & Restrictions Section -->
      <section class="mb-10">
        <BaseCard>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
            <span class="mr-2">⚠️</span> Item Requirements & Restrictions
          </h2>

          <InnerCard>
            <p class="text-gray-700 dark:text-app-white mb-4">
              To be eligible for victory, players must meet specific inventory requirements at game
              end:
            </p>
            <div
              class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-600/30 mb-4"
            >
              <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                Disqualification Conditions:
              </h3>
              <ul class="list-disc list-inside text-gray-700 dark:text-app-white space-y-2">
                <li>
                  <strong>Zero items:</strong> Players with no items at game end are disqualified
                </li>
                <li>
                  <strong>Too many items:</strong> Players with the most items among all players
                  cannot win
                </li>
              </ul>
            </div>
            <StrategyTip label="Critical">
              Balance your inventory carefully! You need at least one item but cannot have the most
              items to win.
            </StrategyTip>
          </InnerCard>
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
              below), which is added to their coin total. The player with the most coins who also
              meets the item requirements wins.
            </p>
            <div
              class="bg-violet-50 dark:bg-neutral-800 p-4 rounded-lg border border-violet-200 dark:border-app-fuchsia-600/30"
            >
              <h3 class="text-xl text-violet-600 dark:text-app-fuchsia-400 font-semibold mb-2">
                To Win, You Must:
              </h3>
              <ol class="list-decimal list-inside text-gray-700 dark:text-app-white space-y-2">
                <li>Have at least one item in your inventory</li>
                <li>Not have the most items among all players</li>
                <li>
                  Have the highest number of coins (including Set Bonus) among eligible players
                </li>
              </ol>
            </div>
          </InnerCard>

          <!-- Set Collection Bonus Card -->
          <InnerCard>
            <div class="flex items-center mb-3">
              <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                <span class="text-xl">🎁</span>
              </div>
              <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">
                Set Collection Bonus
              </h3>
            </div>
            <p class="text-gray-700 dark:text-app-white mb-4">
              At game end, players earn bonus coins for collecting sets of identical items. A 'set'
              consists of exactly <strong>3</strong> identical items.
            </p>
            <p class="text-gray-700 dark:text-app-white mb-4">
              For each complete set, you gain bonus coins equal to
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
                <p class="text-xs text-gray-500 dark:text-gray-500">(10 × 1 weight)</p>
              </div>
              <div
                class="text-center p-3 bg-gray-50 dark:bg-neutral-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <GameShapes class="mx-auto mb-1" size="md" type="circle" />
                <p class="font-semibold text-zinc-800 dark:text-gray-200">1 Set of Circles</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">(3 items)</p>
                <p class="text-lg font-bold text-violet-600 dark:text-app-violet-400">+30 Coins</p>
                <p class="text-xs text-gray-500 dark:text-gray-500">(10 × 3 weight)</p>
              </div>
              <div
                class="text-center p-3 bg-gray-50 dark:bg-neutral-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <GameShapes class="mx-auto mb-1" size="md" type="triangle" />
                <p class="font-semibold text-zinc-800 dark:text-gray-200">1 Set of Triangles</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">(3 items)</p>
                <p class="text-lg font-bold text-violet-600 dark:text-app-violet-400">+50 Coins</p>
                <p class="text-xs text-gray-500 dark:text-gray-500">(10 × 5 weight)</p>
              </div>
            </div>
            <StrategyTip>
              Collecting sets, especially high-weight triangles, can significantly boost your final
              score! Balance set collection with meeting the item requirements.
            </StrategyTip>
          </InnerCard>
        </BaseCard>
      </section>

      <!-- Disconnection Handling Section -->
      <section class="mb-10">
        <BaseCard>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
            <span class="mr-2">🔌</span> Disconnection Handling
          </h2>

          <div class="space-y-4">
            <InnerCard>
              <div class="flex items-center mb-3">
                <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                  <span class="text-xl">⏰</span>
                </div>
                <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">Turn Skipping</h3>
              </div>
              <p class="text-gray-700 dark:text-app-white mb-2">
                If a player is disconnected when their turn to be the seller arrives, their turn is
                automatically skipped. The game continues with the next player in the rotation.
              </p>
              <div
                class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-600/30"
              >
                <p class="text-blue-800 dark:text-blue-300 text-sm">
                  <strong>Note:</strong> Skipped players lose their opportunity to earn coins as a
                  seller for that round.
                </p>
              </div>
            </InnerCard>

            <InnerCard>
              <div class="flex items-center mb-3">
                <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                  <span class="text-xl">🔄</span>
                </div>
                <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">
                  Reconnection Policy
                </h3>
              </div>
              <p class="text-gray-700 dark:text-app-white mb-4">
                Players can reconnect to the game at any time if they experience connection issues:
              </p>
              <div class="space-y-3">
                <div
                  class="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-600/30"
                >
                  <h4 class="font-semibold text-green-700 dark:text-green-400 mb-1">
                    ✅ Can Reconnect:
                  </h4>
                  <ul
                    class="list-disc list-inside text-green-800 dark:text-green-300 text-sm space-y-1"
                  >
                    <li>Temporary disconnections due to network issues</li>
                    <li>Browser crashes or accidental tab closures</li>
                    <li>Any intentional disconnection</li>
                  </ul>
                </div>
                <div
                  class="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-600/30"
                >
                  <h4 class="font-semibold text-red-700 dark:text-red-400 mb-1">
                    ❌ Cannot Reconnect:
                  </h4>
                  <ul
                    class="list-disc list-inside text-red-800 dark:text-red-300 text-sm space-y-1"
                  >
                    <li>Players who voluntarily leave the lobby/game</li>
                    <li>Players who are kicked by the host</li>
                  </ul>
                </div>
              </div>
            </InnerCard>

            <InnerCard>
              <div class="flex items-center mb-3">
                <div class="bg-violet-100 dark:bg-app-fuchsia-900/20 p-2 rounded-full mr-3">
                  <span class="text-xl">⚡</span>
                </div>
                <h3 class="text-xl text-zinc-900 dark:text-white font-semibold">Game Continuity</h3>
              </div>
              <p class="text-gray-700 dark:text-app-white mb-2">
                The game continues regardless of player disconnections. Disconnected players:
              </p>
              <ul class="list-disc list-inside text-gray-700 dark:text-app-white space-y-1 ml-4">
                <li>Cannot participate in bidding while disconnected</li>
                <li>Have their selling turns skipped if disconnected</li>
                <li>Retain their inventory and coins when they reconnect</li>
                <li>Can resume normal gameplay once reconnected</li>
              </ul>
            </InnerCard>
          </div>

          <StrategyTip label="Connection Tips">
            Ensure a stable internet connection throughout the game. Missing your selling turn means
            losing a valuable opportunity to earn coins!
          </StrategyTip>
        </BaseCard>
      </section>

      <!-- Future Expansions Section -->
      <section class="mb-10">
        <BaseCard class="overflow-hidden">
          <div class="relative">
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

              <!-- Newsletter signup teaser -->
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

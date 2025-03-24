<template>
  <div class="min-h-[80vh] w-full">
    <div class="w-full max-w-4xl mx-auto bg-gray-800 p-4 lg:p-8 rounded-lg shadow-lg">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl lg:text-4xl font-bold text-white mb-2">🔮 AuctiOn</h1>
        <p class="text-gray-400">
          An online real-time auction game of bluffing, bidding, and resource management
        </p>
      </div>

      <!-- Introduction Section -->
      <section class="mb-10">
        <div class="bg-gray-700 p-4 lg:p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
            <span class="mr-2">📜</span> Introduction
          </h2>
          <p class="text-gray-300 mb-4">
            AuctiOn is a turn-based auction game where players strategically buy and sell items to
            accumulate as much virtual currency as possible by the end of the game. Players must
            balance their inventory, engage in bidding wars, bluff, and manage their resources
            effectively.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div
              class="bg-gray-750 p-4 rounded-lg text-center transform hover:scale-105 transition-transform"
            >
              <div
                class="bg-blue-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"
              >
                <span class="text-2xl">🔵</span>
              </div>
              <div class="text-blue-400 text-lg font-bold mb-1">Circle</div>
              <div class="text-gray-400 text-sm">Weight: 1</div>
            </div>
            <div
              class="bg-gray-750 p-4 rounded-lg text-center transform hover:scale-105 transition-transform"
            >
              <div
                class="bg-green-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"
              >
                <span class="text-3xl">△</span>
              </div>
              <div class="text-green-400 text-lg font-bold mb-1">Triangle</div>
              <div class="text-gray-400 text-sm">Weight: 2</div>
            </div>
            <div
              class="bg-gray-750 p-4 rounded-lg text-center transform hover:scale-105 transition-transform"
            >
              <div
                class="bg-red-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"
              >
                <span class="text-2xl">⬜</span>
              </div>
              <div class="text-red-400 text-lg font-bold mb-1">Square</div>
              <div class="text-gray-400 text-sm">Weight: 3</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Objective and Setup Section -->
      <section class="mb-10">
        <div class="bg-gray-700 p-4 lg:p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
            <span class="mr-2">🎯</span> Objective & Game Setup
          </h2>
          <div class="space-y-4">
            <div class="bg-gray-750 p-4 rounded-lg">
              <h3 class="text-xl text-white font-semibold mb-2">Objective</h3>
              <p class="text-gray-300">
                Players aim to accumulate the highest amount of virtual coins by the end of the game
                while meeting specific item requirements.
              </p>
            </div>
            <div class="bg-gray-750 p-4 rounded-lg">
              <h3 class="text-xl text-white font-semibold mb-2">Starting Resources</h3>
              <ul class="list-disc list-inside text-gray-300 space-y-2">
                <li>
                  Each player starts with a random assortment of items (Squares, Triangles, Circles)
                </li>
                <li>Total starting item weight: 15</li>
                <li>Starting coins: 50</li>
              </ul>
            </div>
            <div class="bg-gray-750 p-4 rounded-lg">
              <h3 class="text-xl text-white font-semibold mb-2">Turn Structure</h3>
              <p class="text-gray-300">
                Each turn, one player acts as the "seller," while the others are "buyers." The
                seller offers a batch of items, revealing only the total weight.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Game Mechanics Section -->
      <section class="mb-10">
        <div class="bg-gray-700 p-4 lg:p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
            <span class="mr-2">⚙️</span> Game Mechanics
          </h2>

          <div class="space-y-6">
            <!-- Selling Phase -->
            <div class="bg-gray-750 p-4 rounded-lg">
              <div class="flex items-center mb-3">
                <div class="bg-purple-500/20 p-2 rounded-full mr-3">
                  <span class="text-xl">💎</span>
                </div>
                <h3 class="text-xl text-white font-semibold">Selling Phase</h3>
              </div>
              <p class="text-gray-300 mb-2">
                The seller selects a batch of items to sell and announces the total weight. Buyers
                do not know the exact quantity or types of items.
              </p>
              <div class="bg-gray-800/50 p-3 rounded border-l-4 border-purple-500 mt-3">
                <p class="text-gray-400 text-sm italic">
                  <span class="text-purple-400 font-semibold">Strategy Tip:</span> As a seller,
                  consider creating batches that might confuse buyers about the true value.
                </p>
              </div>
            </div>

            <!-- Bidding Phase -->
            <div class="bg-gray-750 p-4 rounded-lg">
              <div class="flex items-center mb-3">
                <div class="bg-yellow-500/20 p-2 rounded-full mr-3">
                  <span class="text-xl">💰</span>
                </div>
                <h3 class="text-xl text-white font-semibold">Bidding Phase</h3>
              </div>
              <p class="text-gray-300 mb-2">
                Each buyer secretly bids a number of coins. The highest bidder wins and receives the
                items. The seller earns the bid amount.
              </p>
              <div class="bg-gray-800/50 p-3 rounded border-l-4 border-yellow-500 mt-3">
                <p class="text-gray-400 text-sm italic">
                  <span class="text-yellow-400 font-semibold">Strategy Tip:</span> Consider the
                  potential value of the items versus your current inventory needs when bidding.
                </p>
              </div>
            </div>

            <!-- Bluffing and Strategy -->
            <div class="bg-gray-750 p-4 rounded-lg">
              <div class="flex items-center mb-3">
                <div class="bg-blue-500/20 p-2 rounded-full mr-3">
                  <span class="text-xl">🎭</span>
                </div>
                <h3 class="text-xl text-white font-semibold">Bluffing & Strategy</h3>
              </div>
              <p class="text-gray-300 mb-2">
                Sellers can bluff to drive up bids; buyers must decide how much to risk based on
                limited information.
              </p>
              <div class="bg-gray-800/50 p-3 rounded border-l-4 border-blue-500 mt-3">
                <p class="text-gray-400 text-sm italic">
                  <span class="text-blue-400 font-semibold">Strategy Tip:</span> Pay attention to
                  other players' bidding patterns to identify when they might be desperate for
                  certain items.
                </p>
              </div>
            </div>

            <!-- Item Rules -->
            <div class="bg-gray-750 p-4 rounded-lg">
              <div class="flex items-center mb-3">
                <div class="bg-red-500/20 p-2 rounded-full mr-3">
                  <span class="text-xl">⚠️</span>
                </div>
                <h3 class="text-xl text-white font-semibold">Item Requirements</h3>
              </div>
              <ul class="list-disc list-inside text-gray-300 space-y-2">
                <li>
                  Players must end the game with at least one item; those with zero items are
                  disqualified from winning.
                </li>
                <li>
                  Players cannot win if they finish the game with more items than any other player.
                </li>
              </ul>
              <div class="bg-gray-800/50 p-3 rounded border-l-4 border-red-500 mt-3">
                <p class="text-gray-400 text-sm italic">
                  <span class="text-red-400 font-semibold">Important:</span> Balance your inventory!
                  Too many or too few items will cost you the game.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Victory Conditions Section -->
      <section class="mb-10">
        <div class="bg-gray-700 p-4 lg:p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
            <span class="mr-2">🏆</span> Victory Conditions
          </h2>

          <div class="bg-gray-750 p-4 rounded-lg">
            <p class="text-gray-300 mb-4">
              When all turns are completed, players count their remaining coins. The player with the
              most coins, who also meets the item requirements, wins.
            </p>

            <div
              class="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 p-4 rounded-lg border border-yellow-500/30"
            >
              <h3 class="text-xl text-yellow-400 font-semibold mb-2">To Win, You Must:</h3>
              <ul class="list-disc list-inside text-gray-300 space-y-2">
                <li>Have at least one item</li>
                <li>Not have the most items among all players</li>
                <li>Have the highest number of coins among eligible players</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Future Expansions Section -->
      <section>
        <div class="bg-gray-700 p-4 lg:p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
            <span class="mr-2">🚀</span> Coming Soon
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              class="bg-gray-750 p-4 rounded-lg text-center transform hover:scale-105 transition-transform"
            >
              <div
                class="bg-indigo-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"
              >
                <span class="text-2xl">📊</span>
              </div>
              <h3 class="text-indigo-400 text-lg font-bold mb-1">Market Events</h3>
              <p class="text-gray-400 text-sm">
                Periodic changes in item values or temporary bonuses for holding specific types of
                items.
              </p>
            </div>

            <div
              class="bg-gray-750 p-4 rounded-lg text-center transform hover:scale-105 transition-transform"
            >
              <div
                class="bg-teal-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"
              >
                <span class="text-2xl">⚡</span>
              </div>
              <h3 class="text-teal-400 text-lg font-bold mb-1">Power-ups</h3>
              <p class="text-gray-400 text-sm">
                Special abilities, such as inspecting item types or blocking other players.
              </p>
            </div>

            <div
              class="bg-gray-750 p-4 rounded-lg text-center transform hover:scale-105 transition-transform"
            >
              <div
                class="bg-amber-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3"
              >
                <span class="text-2xl">⚔️</span>
              </div>
              <h3 class="text-amber-400 text-lg font-bold mb-1">Tiebreaker Round</h3>
              <p class="text-gray-400 text-sm">
                In the event of a tie, players with equal scores participate in a sudden-death
                auction.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
// No additional script needed for this static page
</script>

<style scoped>
/* Custom background color for darker cards */
.bg-gray-750 {
  background-color: rgba(31, 41, 55, 0.8);
}

/* Smooth transitions */
.transform {
  transition: all 0.2s ease;
}

/* Subtle hover effects */
.bg-gray-750:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
</style>

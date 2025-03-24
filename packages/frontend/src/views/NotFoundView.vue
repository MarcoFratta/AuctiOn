<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="w-full max-w-2xl mx-auto bg-gray-800 p-6 lg:p-8 rounded-lg shadow-lg">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-5xl lg:text-6xl font-bold text-white mb-2">
          <span class="text-gray-500">4</span>
          <span class="text-blue-500">0</span>
          <span class="text-gray-500">4</span>
        </h1>
        <p class="text-gray-400 text-lg">Page not found</p>
      </div>

      <!-- Content -->
      <div class="bg-gray-700 p-6 rounded-lg mb-8">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="bg-gray-800/50 p-5 rounded-full">
            <span class="text-5xl">🔍</span>
          </div>
          <div class="text-center md:text-left">
            <h2 class="text-2xl font-bold text-white mb-3">We've lost this page</h2>
            <p class="text-gray-300">
              The page you're looking for doesn't exist or has been moved to another location.
            </p>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div class="bg-gray-700 p-6 rounded-lg mb-8">
        <h3 class="text-xl font-semibold text-white mb-4">You might want to:</h3>
        <ul class="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>Check the URL for typos</li>
          <li>Go back to the previous page</li>
          <li>Visit our homepage</li>
        </ul>
      </div>

      <!-- Action Button -->
      <div class="flex justify-center">
        <router-link
          class="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all text-lg"
          to="/"
        >
          Return to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// No additional script needed for this static page
</script>

<style scoped>
/* Smooth transitions */
a {
  transition: all 0.2s ease;
}

a:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

a:active {
  transform: translateY(0);
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

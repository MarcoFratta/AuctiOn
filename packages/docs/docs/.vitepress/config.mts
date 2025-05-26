import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'AuctiOn Documentation',
  markdown: {
    math: true,
  },
  ignoreDeadLinks: true,
  description: 'Documentation for the AuctiOn real-time auction game platform.',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Architecture', link: '/architecture/' },
      { text: 'Game Rules', link: '/game-rules' },
      { text: 'API Reference', link: '/api-reference/auth-api' },
      { text: 'Final Report', link: '/report/index' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Development Setup', link: '/guide/development' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Game Overview', link: '/guide/game-overview' },
            { text: 'Auction Mechanics', link: '/guide/auction-mechanics' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: 'System Architecture',
          items: [
            { text: 'Overview', link: '/architecture/' },
            { text: 'API Gateway', link: '/architecture/api-gateway' },
            { text: 'Auth Service', link: '/architecture/auth-service' },
            { text: 'User Service', link: '/architecture/user-service' },
            { text: 'Lobby Service', link: '/architecture/lobby-service' },
            { text: 'Auction Service', link: '/architecture/auction-service' },
            { text: 'Event System', link: '/architecture/event-system' },
          ],
        },
      ],
      '/api-reference/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Auth API', link: '/api-reference/auth-api' },
            { text: 'User API', link: '/api-reference/user-api' },
            { text: 'Lobby API', link: '/api-reference/lobby-api' },
            { text: 'WebSocket Events', link: '/api-reference/websocket' },
          ],
        },
      ],
      '/report/': [
        {
          text: 'Final Report',
          items: [
            { text: 'Abstract', link: '/report/abstract' },
            { text: 'Goal & Requirements', link: '/report/goal' },
            { text: 'Requirements Analysis', link: '/report/analysis' },
            {
              text: 'Design',
              items: [
                { text: 'Overview', link: '/report/design' },
                {
                  text: 'Structure',
                  items: [
                    { text: 'Design overview', link: '/report/design/structure' },
                    { text: 'Authentication', link: '/report/design/structure/authentication' },
                    { text: 'Users', link: '/report/design/structure/users' },
                    { text: 'Lobbies', link: '/report/design/structure/lobbies' },
                    { text: 'Auction', link: '/report/design/structure/auction' },
                  ],
                },
                {
                  text: 'Behaviour',
                  items: [
                    { text: 'Overview', link: '/report/design/behaviour/' },
                    { text: 'Auction Service', link: '/report/design/behaviour/auction' },
                    { text: 'Lobby Service', link: '/report/design/behaviour/lobby' },
                    { text: 'Auth Service', link: '/report/design/behaviour/auth' },
                    { text: 'User Service', link: '/report/design/behaviour/user' },
                  ],
                },
                { text: 'Interaction', link: '/report/design/interaction' },
              ],
            },
            { text: 'Implementation Details', link: '/report/implementation' },
            {
              text: 'Self-assessment',
              items: [
                { text: 'Overview', link: '/report/self-assessment/index' },
                { text: 'Testing Overview', link: '/report/self-assessment/tests' },
                { text: 'Coverage Report', link: '/report/self-assessment/coverage' },
                { text: 'E2E Tests', link: '/report/self-assessment/e2e-tests' },
              ],
            },
            { text: 'Deployment Instructions', link: '/report/deployment' },
            { text: 'Usage Examples', link: '/report/usage' },
            { text: 'Conclusion', link: '/report/conclusion' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/MarcoFratta/AuctiOn' },
    ],

    footer: {
      message: 'Marco Frattarola',
    },
  },
})

import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'AuctiOn Documentation',
  markdown: {
    math: true,
  },
  description: 'Documentation for the AuctiOn real-time auction game platform.',
  // Set the base path for GitHub Pages deployment
  // This should match your repository name
  base: '/AuctiOn/',
  head: [
    ['link', { rel: 'icon', href: '/app-logo.svg' }],
  ],
  ignoreDeadLinks: [
    /^http:\/\/localhost/,
    /^https:\/\/localhost/,
  ],
  themeConfig: {
    logo: '/app-logo.svg',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Usage', link: '/report/usage' },
      { text: 'Game Rules', link: '/game-rules' },
      { text: 'API Reference', link: '/api-reference/auth-api' },
      { text: 'Documentation', link: '/report/index' },
    ],

    sidebar: {
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
              collapsed: true,
              items: [
                { text: 'Overview', link: '/report/design/' },
                {
                  text: 'Structure',
                  collapsed: true,
                  items: [
                    { text: 'Overview', link: '/report/design/structure/' },
                    { text: 'Authentication', link: '/report/design/structure/authentication' },
                    { text: 'Users', link: '/report/design/structure/users' },
                    { text: 'Lobbies', link: '/report/design/structure/lobbies' },
                    { text: 'Auction', link: '/report/design/structure/auction' },
                  ],
                },
                {
                  text: 'Behaviour',
                  collapsed: true,
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
              collapsed: true,
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
      { icon: 'gitlab', link: 'https://dvcs.apice.unibo.it/pika-lab/courses/ds/projects/ds-project-frattarola-ay2223' },

    ],

    footer: {
      message: 'Marco Frattarola',
    },
  },
})

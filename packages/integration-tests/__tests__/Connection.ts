import waitOn from 'wait-on'

export async function connectToServer(url: string) {
  console.log('Starting Docker Compose for tests...')

  // Wait for API Gateway to be ready
  await waitOn({
    resources: [`${url}/health`],
    timeout: 50000, // Wait up to 30 seconds
    log: true,
    delay: 5000,
    interval: 1000,
  })

  console.log('API Gateway is ready. Running tests...')
}

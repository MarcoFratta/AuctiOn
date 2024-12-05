import axios from 'axios'

export class AuthServiceClient {
    constructor(private authServiceUrl: string) {
    }

    async validateToken(token: string): Promise<object | null> {
        try {
            const { data } = await axios.post(`${this.authServiceUrl}/validate`, { token: token })
            return data ? data : null // Assume a 200 status indicates successful validation.
        } catch (error) {
            console.error('Token validation failed:', error)
            return null // Invalid token or auth service error.
        }
    }
}

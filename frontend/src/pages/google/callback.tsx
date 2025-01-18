import React, { useEffect, useState } from 'react'
import { storeGoogleAccessToken } from '@/utils/api'

const GoogleCallbackPage: React.FC = () => {
    const [statusMessage, setStatusMessage] = useState('Processing authentication...')
    const [isError, setIsError] = useState(false)

    useEffect(() => {
        const handleOAuthResponse = async () => {
            try {
                // Extract the token from the URL fragment
                const hash = window.location.hash.substring(1)
                const params = new URLSearchParams(hash)

                const accessToken = params.get('access_token')
                const expiresIn = params.get('expires_in')

                if (!accessToken) {
                    throw new Error('No access token found in the URL')
                }

                // Store the new token
                await storeGoogleAccessToken(accessToken, expiresIn)
                setStatusMessage('Token stored successfully! You may close this window.')
                window.close()
            } catch (error) {
                console.error('Error during authentication:', error)
                setStatusMessage('Authentication failed. Please try again.')
                setIsError(true)
            }
        }

        handleOAuthResponse()
    }, [])

    return (
        <div className="min-h-screen flex justify-center items-center">
            <p className={isError ? 'text-red-600' : ''}>{statusMessage}</p>
        </div>
    )
}

export default GoogleCallbackPage

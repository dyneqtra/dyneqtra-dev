import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { validateGoogleAccessToken } from '@/utils/api'

const GoogleAuthPage: React.FC = () => {
    const router = useRouter()

    useEffect(() => {
        const oauthSignIn = () => {
            // Google's OAuth 2.0 endpoint for requesting an access token
            const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth'

            const baseUrl = window.location.origin

            // Create <form> element to submit parameters to OAuth 2.0 endpoint.
            const form = document.createElement('form')
            form.setAttribute('method', 'GET') // Send as a GET request.
            form.setAttribute('action', oauth2Endpoint)

            // Parameters to pass to OAuth 2.0 endpoint.
            const params = {
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                redirect_uri: `${baseUrl}/google/callback`,
                scope: 'https://www.googleapis.com/auth/spreadsheets',
                include_granted_scopes: 'true',
                state: 'pass-through value',
                response_type: 'token',
            }

            // Add form parameters as hidden input values.
            for (const p in params) {
                if (params.hasOwnProperty(p)) {
                    const input = document.createElement('input')
                    input.setAttribute('type', 'hidden')
                    input.setAttribute('name', p)
                    input.setAttribute('value', params[p])
                    form.appendChild(input)
                }
            }

            // Add form to page and submit it to open the OAuth 2.0 endpoint.
            document.body.appendChild(form)
            form.submit()
        }

        // check if the token is already stored
        const validateStoredToken = async () => {
            const response = await validateGoogleAccessToken()
            if (response.is_valid) {
                router.push('/')
            } else {
                oauthSignIn()
            }
        }

        validateStoredToken()
    }, [router])

    return (
        <div className="min-h-screen flex justify-center items-center">
            <p>Redirecting to Google for authentication...</p>
        </div>
    )
}

export default GoogleAuthPage

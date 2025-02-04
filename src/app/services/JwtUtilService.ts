import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class JwtUtilService {

    // Function to extract email from JWT
    getEmailFromToken(token: string): string | null {
        if (!token) {
            return null;
        }

        try {
            const payload = token.split('.')[1]; // Get the payload part of the token
            const decodedPayload = atob(payload); // Decode the Base64 payload
            const payloadObject = JSON.parse(decodedPayload); // Convert JSON string to an object

            return payloadObject.email || payloadObject.userEmail || null; // Adjust the key based on your JWT structure
        } catch (error) {
            console.error('Invalid JWT Token:', error);
            return null;
        }
    }
}

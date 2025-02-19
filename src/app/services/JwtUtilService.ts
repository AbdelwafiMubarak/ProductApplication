import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class JwtUtilService {
    getEmailFromToken(token: string): string | null {
        if (!token) {
            return null;
        }
        try {
            const payload = token.split('.')[1];
            const decodedPayload = atob(payload);
            const payloadObject = JSON.parse(decodedPayload);

            return payloadObject.email || payloadObject.userEmail || null;
        } catch (error) {
            // console.error('Invalid JWT Token:', error);
            return null;
        }
    }
}

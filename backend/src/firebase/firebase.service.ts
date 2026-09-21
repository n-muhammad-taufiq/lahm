import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService {
    private readonly logger = new Logger(FirebaseService.name);
    private firebaseApp?: App;

    constructor(private readonly configService: ConfigService) {
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

        const apps = getApps();
        if (!apps.length) {
            if (projectId && clientEmail && privateKey) {
                this.firebaseApp = initializeApp({
                    credential: cert({
                        projectId,
                        clientEmail,
                        privateKey: privateKey.replace(/\\n/g, '\n'),
                    }),
                });
                this.logger.log('Firebase Admin SDK initialized successfully');
            } else {
                this.logger.warn('Firebase credentials not fully provided in environment variables');
            }
        } else {
            this.firebaseApp = apps[0];
        }
    }

    async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
        // Safe development fallback: allow simulated tokens in non-production for local testing
        if (process.env.NODE_ENV !== 'production' && idToken.startsWith('dev-simulated-')) {
            this.logger.warn('[FirebaseService] Non-production environment: accepting dev-simulated token');
            // Extract phone number if passed in format dev-simulated-token-<phone>, or default
            const parts = idToken.split(':');
            const phone = parts.length > 1 ? parts[1] : '+971501234567';
            return {
                uid: 'dev-user-uid',
                phone_number: phone,
                auth_time: Math.floor(Date.now() / 1000),
                iss: 'https://securetoken.google.com/lahm-app',
                aud: 'lahm-app',
                sub: 'dev-user-uid',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
                firebase: { identities: { phone: [phone] }, sign_in_provider: 'phone' },
            } as unknown as DecodedIdToken;
        }

        try {
            const auth = this.firebaseApp ? getAuth(this.firebaseApp) : getAuth();
            return await auth.verifyIdToken(idToken);
        } catch (error) {
            this.logger.error(`Firebase token verification failed: ${error.message}`);
            throw new UnauthorizedException('Invalid or expired Firebase ID token');
        }
    }
}

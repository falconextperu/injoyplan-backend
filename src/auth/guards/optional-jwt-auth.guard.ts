import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Attempts to authenticate using JWT if an Authorization header is present.
 * If the token is missing/invalid, it does NOT throw — it simply leaves req.user undefined.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override default behavior which throws when user is missing.
  handleRequest(err: any, user: any, info: any) {
    // If error (e.g. invalid signature) OR (no user AND info says it's because of strict validation failure vs just missing)
    // Actually, passport-jwt returns info as Error object if token is invalid/expired.
    // If token is missing, info might be "No auth token" or similar.

    // We want to Allow Guest (return null) ONLY if token is MISSING.
    // We want to Throw 401 if token is PRESENT but INVALID.

    if (err || !user) {
      // Check if the reason is "No auth token" (meaning guest)
      if (info && (info.message === 'No auth token' || info.message === 'No auth header')) {
        return null; // Guest mode
      }
      // Otherwise (expired, invalid signature, malformed), throw error to trigger 401
      throw err || new Error(info?.message || 'Unauthorized');
    }
    return user;
  }
}

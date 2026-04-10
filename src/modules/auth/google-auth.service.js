const { OAuth2Client } = require('google-auth-library');

const config = require('../../config');
const AppError = require('../../shared/errors/AppError');

let oauthClient;

function getOauthClient() {
  if (!oauthClient) {
    oauthClient = new OAuth2Client();
  }

  return oauthClient;
}

class GoogleAuthService {
  static isConfigured() {
    return config.google.clientIds.length > 0;
  }

  static async verifyCredential(credential) {
    if (!GoogleAuthService.isConfigured()) {
      throw AppError.badRequest(
        'Google sign-in is not configured on this server yet',
        'GOOGLE_AUTH_NOT_CONFIGURED'
      );
    }

    if (!credential) {
      throw AppError.badRequest(
        'Google credential is required',
        'GOOGLE_CREDENTIAL_REQUIRED'
      );
    }

    try {
      const ticket = await getOauthClient().verifyIdToken({
        idToken: credential,
        audience: config.google.clientIds,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.sub || !payload.email) {
        throw AppError.unauthorized(
          'Google account data is incomplete',
          'GOOGLE_PAYLOAD_INVALID'
        );
      }

      if (!payload.email_verified) {
        throw AppError.unauthorized(
          'Google email is not verified',
          'GOOGLE_EMAIL_NOT_VERIFIED'
        );
      }

      return {
        googleId: payload.sub,
        email: payload.email.toLowerCase(),
        emailVerified: Boolean(payload.email_verified),
        displayName: payload.name || payload.given_name || payload.email,
        avatarUrl: payload.picture || '',
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.unauthorized(
        'Google sign-in could not be verified',
        'GOOGLE_AUTH_FAILED'
      );
    }
  }
}

module.exports = GoogleAuthService;

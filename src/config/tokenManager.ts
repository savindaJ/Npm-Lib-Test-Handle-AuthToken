import { createTokenManager, createTokenDigest } from "@restingowlorg/owltokenguard";
import { minimumReauthAtBySub, refreshTokenStore } from "../db/mockDb";

const JWT_SECRET = "super-secret-key-that-is-at-least-64-characters-long-for-hmac-security-compliance";
const TOKEN_DIGEST_PEPPER = "internal-database-pepper-for-hashing-tokens";

export const tokenManager = createTokenManager({
  algorithm: "HS256",
  hmacSecret: JWT_SECRET,
  issuer: "https://my-identity-provider.com",
  trustedIssuers: ["https://my-identity-provider.com"],
  audience: "my-secure-api",
  expiresInSeconds: 900, 
  refreshTokenEnabled: true,
  refreshTokenExpiresInSeconds: 60 * 60 * 24 * 7, 

  onSessionTerminate: async ({ jti }) => {
    if (jti) {
      const digest = createTokenDigest(jti, { pepper: TOKEN_DIGEST_PEPPER });
      refreshTokenStore.delete(digest);
    }
  },

  onRefreshTokenIssued: async ({ refreshToken, refreshClaims }) => {
    const digest = createTokenDigest(refreshClaims.jti, { pepper: TOKEN_DIGEST_PEPPER });
    
    refreshTokenStore.set(digest, { iss: refreshClaims.iss as string, consumed: false });
    
    console.log(`\n✅ [Hook] Token Saved to In-memory DB. Total active sessions: ${refreshTokenStore.size}`);
  },

  consumeRefreshToken: async ({ jti }) => {
    const digest = createTokenDigest(jti, { pepper: TOKEN_DIGEST_PEPPER });
    const stored = refreshTokenStore.get(digest);
    
    if (!stored) {
      console.error(`\n❌ [Hook] consumeRefreshToken: Token Digest NOT FOUND in DB!`);
      return false; 
    }
    
    if (stored.consumed) {
      console.error(`\n❌ [Hook] consumeRefreshToken: Token ALREADY CONSUMED (Potential Replay Attack!)`);
      return false;
    }
    
    stored.consumed = true;
    refreshTokenStore.set(digest, stored);
    console.log(`\n✅ [Hook] Token Successfully Consumed for Rotation.`);
    
    return true; 
  },

  getMinimumReauthAt: async (sub) => {
    return minimumReauthAtBySub.get(sub);
  }
});
export const refreshTokenStore = new Map<string, { iss: string; consumed: boolean }>();
export const minimumReauthAtBySub = new Map<string, number>();
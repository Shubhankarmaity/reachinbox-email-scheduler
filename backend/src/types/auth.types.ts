export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface SessionUser {
  id: string;
}

export interface GoogleOAuthCallbackResult {
  profile: GoogleUserProfile;
  isNewUser: boolean;
}
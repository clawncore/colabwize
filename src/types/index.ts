export interface WaitlistSignup {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  institution?: string;
  position?: number;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  confirmedEmail?: boolean;
  createdAt?: string;
}

export interface FeatureVote {
  id?: string;
  waitlistId: string;
  featureName: string;
  createdAt?: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterSubscriber {
  email: string;
}

export interface Feature {
  id: string;
  icon: string;
  color: string;
  title: string;
  description: string;
  votes: number;
}

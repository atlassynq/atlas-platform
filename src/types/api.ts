export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string | null;
  bio: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  plan: string;
}

export interface EventCreator {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  coverPhoto: string | null;
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  creator: EventCreator;
  _count?: {
    confirmations: number;
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface EventConfirmation {
  id: string;
  confirmedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
  };
}

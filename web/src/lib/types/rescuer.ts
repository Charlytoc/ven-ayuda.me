export type RescuerProfile = {
  phone: string;
  latitude: string | null;
  longitude: string | null;
  action_radius_km: number;
  notifications_enabled: boolean;
  location_updated_at: string | null;
};

export type AuthMeResponse = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  rescuer_profile: RescuerProfile;
};

export type AuthTokenResponse = {
  access_token: string;
  token_type: string;
};

export type RescuerProfileUpdate = {
  phone?: string;
  latitude?: number;
  longitude?: number;
  action_radius_km?: number;
  notifications_enabled?: boolean;
};

export type PushSubscriptionPayload = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

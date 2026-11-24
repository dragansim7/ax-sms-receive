export type NumberCard = {
  id: string;
  e164: string;
  countryCode: string;
  countryName: string;
  label: string;
  carrier: string;
  dayCount: number;
  lastAt: string | null;
  preview: string | null;
  senderName: string | null;
};

export type SmsMessage = {
  id: number;
  fromNumber: string;
  senderName: string;
  body: string;
  receivedAt: string;
  source: string;
};

export type InboxPayload = {
  number: NumberCard;
  messages: SmsMessage[];
};

export type SetupInfo = {
  secretConfigured: boolean;
  numberCount: number;
  cap: number;
};

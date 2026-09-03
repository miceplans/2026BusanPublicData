export const INDUSTRIES = [
  '해양',
  '에너지테크',
  '미래모빌리티',
  '융합부품·소재',
  '라이프스타일',
  '디지털테크',
  '금융',
  '문화관광',
  '바이오헬스',
] as const;
export const PARTICIPATION_TYPES = ['예비창업팀', '신규창업기업'] as const;
export type ApplicationMember = {
  name: string;
  role: string;
  isLeader: boolean;
};
export type FaqItem = { question: string; answer: string };
export type SiteSettings = {
  is_public: boolean;
  editing_enabled: boolean;
  completion_message: string;
  contact: string | null;
  completion_email_body: string | null;
  item_summary_max_length: number | null;
  evidence_label: string | null;
  evidence_purpose: string | null;
  privacy_retention_policy: string | null;
  faqs: FaqItem[];
};

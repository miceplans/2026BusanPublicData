import { z } from 'zod';
import { INDUSTRIES, PARTICIPATION_TYPES } from '@/types';

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label}을(를) 입력해 주세요.`).max(max);
export function normalizeTeamName(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('ko-KR');
}
export function phoneDigits(value: string) {
  return value.replace(/\D/g, '');
}
export function formatPhoneNumber(value: string) {
  const digits = phoneDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`;
}
export function phoneLastFour(value: string) {
  return phoneDigits(value).slice(-4);
}
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.')
  .max(64)
  .refine(
    (value) =>
      [/[A-Za-z]/, /\d/, /[^A-Za-z\d\s]/].filter((r) => r.test(value)).length >=
      2,
    '영문, 숫자, 특수문자 중 2종류 이상을 포함해 주세요.',
  );
export const memberSchema = z.object({
  name: requiredText('팀원 이름', 50),
  role: requiredText('팀 내 역할', 100),
  isLeader: z.boolean(),
});
const applicationBaseSchema = z.object({
  idempotencyKey: z.uuid(),
  teamName: requiredText('팀명', 100),
  leaderName: requiredText('팀장 이름', 50),
  leaderEmail: z.email('올바른 이메일 주소를 입력해 주세요.').max(254),
  leaderPhone: z
    .string()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '올바른 연락처를 입력해 주세요.'),
  leaderRegion: requiredText('지역', 100),
  participationType: z.enum(PARTICIPATION_TYPES),
  industry: z.enum(INDUSTRIES),
  itemName: requiredText('아이템명', 200),
  itemSummary: requiredText('아이템 요약', 10000),
  members: z.array(memberSchema).min(2).max(4),
  isBusanBased: z.boolean(),
  eligibilityConfirmed: z.literal(true),
  exclusionConfirmed: z.literal(true),
  privacyAgreed: z.literal(true),
  requests: z.string().trim().max(2000).optional().default(''),
});
function validateLeader(
  data: { leaderName: string; members: { name: string; isLeader: boolean }[] },
  context: z.RefinementCtx,
) {
  const leaders = data.members.filter((member) => member.isLeader);
  if (leaders.length !== 1 || leaders[0]?.name !== data.leaderName)
    context.addIssue({
      code: 'custom',
      path: ['members'],
      message: '팀장을 팀원 목록에 한 번 포함해 주세요.',
    });
}
export const applicationSchema = applicationBaseSchema.superRefine(
  (data, context) => {
    validateLeader(data, context);
  },
);
export const applicationUpdateSchema = applicationBaseSchema
  .omit({
    idempotencyKey: true,
    privacyAgreed: true,
  })
  .partial()
  .required({
    teamName: true,
    leaderName: true,
    leaderEmail: true,
    leaderPhone: true,
    leaderRegion: true,
    participationType: true,
    industry: true,
    itemName: true,
    itemSummary: true,
    members: true,
    isBusanBased: true,
    eligibilityConfirmed: true,
    exclusionConfirmed: true,
  })
  .superRefine(validateLeader);
export const applicationLoginSchema = z.object({
  teamName: requiredText('팀명', 100),
  password: z.string().regex(/^\d{4}$/, '연락처 뒤 4자리를 입력해 주세요.'),
});
export const adminLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200),
});
export const adminPatchSchema = z
  .object({
    password: passwordSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, '변경할 값이 없습니다.');
export type ApplicationInput = z.infer<typeof applicationSchema>;

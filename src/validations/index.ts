import { z } from 'zod';
import {
  GENDERS,
  INDUSTRIES,
  INFORMATION_SOURCES,
  PARTICIPATION_TYPES,
} from '@/types';

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label}을(를) 입력해 주세요.`).max(max);
const birthDateField = (label: string) =>
  z
    .string()
    .regex(
      /^\d{6}$/,
      `${label}을(를) 생년월일 6자리(예: 260101)로 입력해 주세요.`,
    );
const genderField = (label: string) =>
  z.enum(GENDERS, { error: `${label}을(를) 선택해 주세요.` });
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
export const memberSchema = z.object({
  name: requiredText('팀원 이름', 50),
  role: requiredText('팀 내 역할', 100),
  isLeader: z.boolean(),
  org: requiredText('팀원 소속', 100),
  email: z.email('올바른 이메일 주소를 입력해 주세요.').max(254),
  phone: z
    .string()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '올바른 연락처를 입력해 주세요.'),
  birthDate: birthDateField('팀원 생년월일'),
  gender: genderField('팀원 성별'),
  residence: requiredText('팀원 거주지', 100),
});
const applicationBaseSchema = z.object({
  idempotencyKey: z.uuid(),
  teamName: requiredText('팀명', 100),
  leaderName: requiredText('팀장 이름', 50),
  leaderOrg: requiredText('팀장 소속', 100),
  leaderEmail: z.email('올바른 이메일 주소를 입력해 주세요.').max(254),
  leaderPhone: z
    .string()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '올바른 연락처를 입력해 주세요.'),
  leaderBirthDate: birthDateField('팀장 생년월일'),
  leaderGender: genderField('팀장 성별'),
  leaderResidence: requiredText('거주지', 100),
  participationType: z.enum(PARTICIPATION_TYPES),
  industry: z.enum(INDUSTRIES),
  informationSource: z.enum(INFORMATION_SOURCES, {
    error: '대회 정보 습득 경로를 선택해 주세요.',
  }),
  informationSourceOther: z.string().trim().max(100).optional().default(''),
  itemName: requiredText('아이템명', 20),
  itemSummary: requiredText('아이템 요약', 40),
  members: z.array(memberSchema).min(2).max(4),
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
function validateInformationSource(
  data: { informationSource: string; informationSourceOther?: string },
  context: z.RefinementCtx,
) {
  if (data.informationSource === '기타' && !data.informationSourceOther?.trim())
    context.addIssue({
      code: 'custom',
      path: ['informationSourceOther'],
      message: '기타 습득 경로를 입력해 주세요.',
    });
}
export const applicationSchema = applicationBaseSchema.superRefine(
  (data, context) => {
    validateLeader(data, context);
    validateInformationSource(data, context);
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
    leaderOrg: true,
    leaderEmail: true,
    leaderPhone: true,
    leaderBirthDate: true,
    leaderGender: true,
    leaderResidence: true,
    participationType: true,
    industry: true,
    informationSource: true,
    itemName: true,
    itemSummary: true,
    members: true,
    eligibilityConfirmed: true,
    exclusionConfirmed: true,
  })
  .superRefine((data, context) => {
    validateLeader(data, context);
    validateInformationSource(data, context);
  });
export const applicationLoginSchema = z.object({
  teamName: requiredText('팀명', 100),
  password: z.string().regex(/^\d{4}$/, '연락처 뒤 4자리를 입력해 주세요.'),
});
export const adminLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200),
});
export const adminSignupSchema = z
  .object({
    email: z.email('올바른 이메일 주소를 입력해 주세요.'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .max(200, '비밀번호는 200자 이하여야 합니다.')
      .regex(/[A-Za-z]/, '비밀번호에 영문자를 포함해 주세요.')
      .regex(/[0-9]/, '비밀번호에 숫자를 포함해 주세요.'),
    passwordConfirm: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않습니다.',
  });
export type ApplicationInput = z.infer<typeof applicationSchema>;

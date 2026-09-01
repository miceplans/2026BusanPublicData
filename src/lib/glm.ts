import 'server-only';
import { getServerEnv } from '@/lib/env/server';

const GLM_CHAT_COMPLETIONS_URL =
  'https://open.bigmodel.cn/api/coding/paas/v4/chat/completions';

export async function generatePasswordResetEmailBody(input: {
  teamName: string;
  receiptNumber: string;
  newPassword: string;
}): Promise<string | null> {
  const env = getServerEnv();
  if (!env.GLM_API_KEY) return null;
  try {
    const response = await fetch(GLM_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-5.2',
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: [
              '아래 정보를 바탕으로 참가팀에게 보낼 비밀번호 초기화 안내 이메일 본문을 한국어로 작성해줘.',
              '제목 없이 본문만, 정중하고 간결한 안내문으로 작성하고 줄바꿈으로 문단을 구분해줘. HTML 태그는 쓰지 마.',
              `팀명: ${input.teamName}`,
              `접수번호: ${input.receiptNumber}`,
              `새 비밀번호: ${input.newPassword}`,
            ].join('\n'),
          },
        ],
      }),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    const content = (
      data as {
        choices?: { message?: { content?: string } }[];
      }
    ).choices?.[0]?.message?.content;
    return typeof content === 'string' && content.trim() ? content.trim() : null;
  } catch {
    return null;
  }
}

'use client';

import { useEffect } from 'react';
import { useToast } from '@/components/toast';

export function SubmissionSuccessToast() {
  const { showToast } = useToast();

  useEffect(() => {
    showToast('참가 신청이 성공적으로 접수되었습니다.', 'success');
  }, [showToast]);

  return null;
}

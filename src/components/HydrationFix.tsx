'use client';

import { useEffect } from 'react';

export default function HydrationFix() {
  useEffect(() => {
    if (typeof window !== 'undefined' && document.body.hasAttribute('wotdisconnected')) {
      document.body.removeAttribute('wotdisconnected');
    }
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않고, 사이드 이펙트만 처리합니다.
}

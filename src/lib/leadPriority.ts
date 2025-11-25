/**
 * 리드 우선순위 시스템
 *
 * 스코어(0-100)를 기반으로 리드의 우선순위를 결정합니다.
 */

export type LeadPriority = '일반응대' | '우선 응대' | '매우 우선응대' | '최우선 응대';

export interface PriorityInfo {
  priority: LeadPriority;
  color: 'default' | 'primary' | 'warning' | 'error';
  backgroundColor: string;
  textColor: string;
  description: string;
}

/**
 * 스코어를 우선순위 레벨로 변환
 */
export function getLeadPriority(score: number): LeadPriority {
  if (score >= 86) {
    return '최우선 응대';
  } else if (score >= 71) {
    return '매우 우선응대';
  } else if (score >= 51) {
    return '우선 응대';
  } else {
    return '일반응대';
  }
}

/**
 * 우선순위에 따른 시각적 정보 반환
 */
export function getPriorityInfo(priority: LeadPriority): PriorityInfo {
  switch (priority) {
    case '최우선 응대':
      return {
        priority,
        color: 'error',
        backgroundColor: '#ffebee',
        textColor: '#c62828',
        description: '즉시 응대 필요 (스코어 86-100)'
      };
    case '매우 우선응대':
      return {
        priority,
        color: 'warning',
        backgroundColor: '#fff3e0',
        textColor: '#e65100',
        description: '빠른 응대 필요 (스코어 71-85)'
      };
    case '우선 응대':
      return {
        priority,
        color: 'primary',
        backgroundColor: '#e3f2fd',
        textColor: '#1565c0',
        description: '우선 응대 권장 (스코어 51-70)'
      };
    case '일반응대':
      return {
        priority,
        color: 'default',
        backgroundColor: '#f5f5f5',
        textColor: '#616161',
        description: '일반 응대 (스코어 0-50)'
      };
  }
}

/**
 * 스코어로부터 직접 우선순위 정보 가져오기
 */
export function getPriorityInfoFromScore(score: number): PriorityInfo {
  const priority = getLeadPriority(score);
  return getPriorityInfo(priority);
}

/**
 * 우선순위 표시 이름 (정렬 등에 사용)
 */
export const PRIORITY_DISPLAY_ORDER: Record<LeadPriority, number> = {
  '최우선 응대': 4,
  '매우 우선응대': 3,
  '우선 응대': 2,
  '일반응대': 1,
};

/**
 * 우선순위로 정렬하기 위한 비교 함수
 */
export function comparePriority(a: LeadPriority, b: LeadPriority): number {
  return PRIORITY_DISPLAY_ORDER[b] - PRIORITY_DISPLAY_ORDER[a]; // 내림차순 (최우선이 먼저)
}

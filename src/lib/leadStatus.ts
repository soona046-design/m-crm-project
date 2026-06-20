// 퍼널 6단계(노출→클릭→문의→상담→예약→계약)와 1:1 대응하는 리드 상태값
// 백엔드 leads.status enum과 동일한 영문 키를 사용한다.
export const STATUS_EN_TO_KR: Record<string, string> = {
  new: '신규',
  contacted: '상담완료',
  scheduled: '예약완료',
  converted: '계약완료',
  pending: '보류',
  rejected: '거절',
};

export const STATUS_KR_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_EN_TO_KR).map(([en, kr]) => [kr, en])
);

export const LEAD_STATUS_OPTIONS_KR = Object.values(STATUS_EN_TO_KR);

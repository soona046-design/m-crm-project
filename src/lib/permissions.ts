/**
 * 역할(Role) 기반 권한 시스템
 *
 * 역할 정의:
 * - super_admin: 슈퍼관리자 (전체 시스템 관리, 모든 권한)
 * - branch_manager: 지점관리자 (소속 지점의 모든 데이터 및 사용자 관리)
 * - counselor: 상담매니저 (리드/상담/예약 관리, 메모/태그 편집)
 * - marketer: 마케터 (캠페인/소재 코드, 리포트 접근)
 * - doctor: 의사 (일정·진료결과 요약 열람, 민감정보 최소화)
 */

export type Role = 'super_admin' | 'branch_manager' | 'counselor' | 'marketer' | 'doctor';

export type Permission =
  // 시스템 관리
  | 'system:manage'
  | 'users:manage'
  | 'clinics:manage'

  // 리드 관리
  | 'leads:view'
  | 'leads:create'
  | 'leads:edit'
  | 'leads:delete'
  | 'leads:assign'

  // 티켓 관리
  | 'tickets:view'
  | 'tickets:create'
  | 'tickets:edit'
  | 'tickets:delete'
  | 'tickets:assign'

  // 예약 관리
  | 'appointments:view'
  | 'appointments:create'
  | 'appointments:edit'
  | 'appointments:delete'

  // 커뮤니케이션
  | 'communications:view'
  | 'communications:send'

  // 대시보드 및 리포트
  | 'dashboards:view'
  | 'reports:view'
  | 'reports:export'

  // 캠페인 관리
  | 'campaigns:view'
  | 'campaigns:manage'

  // 감사 로그
  | 'audit_logs:view';

// 역할별 권한 매핑
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    // 모든 권한
    'system:manage',
    'users:manage',
    'clinics:manage',
    'leads:view',
    'leads:create',
    'leads:edit',
    'leads:delete',
    'leads:assign',
    'tickets:view',
    'tickets:create',
    'tickets:edit',
    'tickets:delete',
    'tickets:assign',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:delete',
    'communications:view',
    'communications:send',
    'dashboards:view',
    'reports:view',
    'reports:export',
    'campaigns:view',
    'campaigns:manage',
    'audit_logs:view',
  ],

  branch_manager: [
    // 소속 지점 관리
    'users:manage', // 소속 지점 사용자만
    'leads:view',
    'leads:create',
    'leads:edit',
    'leads:delete',
    'leads:assign',
    'tickets:view',
    'tickets:create',
    'tickets:edit',
    'tickets:delete',
    'tickets:assign',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:delete',
    'communications:view',
    'communications:send',
    'dashboards:view',
    'reports:view',
    'reports:export',
    'audit_logs:view',
  ],

  counselor: [
    // 상담 업무
    'leads:view',
    'leads:create',
    'leads:edit',
    'tickets:view',
    'tickets:create',
    'tickets:edit',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'communications:view',
    'communications:send',
    'dashboards:view',
  ],

  marketer: [
    // 마케팅 및 분석
    'leads:view',
    'tickets:view',
    'appointments:view',
    'dashboards:view',
    'reports:view',
    'reports:export',
    'campaigns:view',
    'campaigns:manage',
  ],

  doctor: [
    // 진료 관련
    'appointments:view',
    'communications:view',
    'dashboards:view',
  ],
};

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 */
export function hasPermission(userRole: string | undefined, permission: Permission): boolean {
  if (!userRole) return false;

  const role = userRole as Role;
  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions) return false;

  return permissions.includes(permission);
}

/**
 * 사용자가 여러 권한 중 하나라도 가지고 있는지 확인
 */
export function hasAnyPermission(userRole: string | undefined, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * 사용자가 모든 권한을 가지고 있는지 확인
 */
export function hasAllPermissions(userRole: string | undefined, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * 슈퍼관리자인지 확인
 */
export function isSuperAdmin(userRole: string | undefined): boolean {
  return userRole === 'super_admin';
}

/**
 * 지점 관리자인지 확인
 */
export function isBranchManager(userRole: string | undefined): boolean {
  return userRole === 'branch_manager';
}

/**
 * 역할 표시 이름
 */
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  super_admin: '슈퍼관리자',
  branch_manager: '지점관리자',
  counselor: '상담매니저',
  marketer: '마케터',
  doctor: '의사',
};

/**
 * 역할 표시 이름 가져오기
 */
export function getRoleDisplayName(role: string | undefined): string {
  if (!role) return '알 수 없음';
  return ROLE_DISPLAY_NAMES[role as Role] || role;
}

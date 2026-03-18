import {
  Users,
  DollarSign,
  Building2,
  Calendar,
  Shield,
  TrendingUp,
  Clock,
} from 'lucide-react';

export const menuStructure = {
  인력: {
    icon: Users,
    basePath: '/workforce',
    submenus: [
      { name: '사원목록', path: '/workforce/employees' },
      { name: '인사이동', path: '/workforce/movements' },
      { name: '퇴사관리', path: '/workforce/resignations' },
    ],
  },
  급여: {
    icon: DollarSign,
    basePath: '/salary',
    submenus: [
      { name: '관리', path: '/salary/manage' },
      { name: '명세서', path: '/salary/statements' },
    ],
  },
  부서: {
    icon: Building2,
    basePath: '/department',
    submenus: [
      { name: '관리', path: '/department/manage' },
      { name: '프로젝트 관리', path: '/department/projects' },
    ],
  },
  데이터: {
    icon: TrendingUp,
    basePath: '/data',
    submenus: [
      {
        name: '프로젝트 수행 현황',
        path: '/data/project-performance',
      },
      { name: '인력분포도', path: '/data/workforce-distribution' },
      { name: '근태표', path: '/data/attendance-table' },
      { name: '퇴직현황', path: '/data/resign-status' },
      { name: '개인 종합 평가', path: '/data/individual-evaluation' },
      { name: '부서별 평가(KPI)', path: '/data/department-kpi' },
    ],
  },
  근태: {
    icon: Calendar,
    basePath: '/attendance',
    submenus: [
      { name: '출퇴현황', path: '/attendance/status' },
      { name: '연차관리', path: '/attendance/annual-leave' },
    ],
  },
  이력: {
    icon: Clock,
    basePath: '/record',
    submenus: [
      { name: '로그조회', path: '/record/access-log' },
      { name: '급여관리이력', path: '/record/salary-history' },
      { name: '인력관리이력', path: '/record/workforce-history' },
      { name: '전자결재이력', path: '/record/approval-history' },
    ],
  },
  권한: {
    icon: Shield,
    basePath: '/authority',
    submenus: [{ name: '관리', path: '/authority/manage' }],
  },
};

export const defaultRoute = menuStructure.인력.submenus[0].path;

export const flatMenuList = Object.entries(menuStructure).flatMap(
  ([menuName, { submenus }]) =>
    submenus.map((submenu) => ({
      menuName,
      submenuName: submenu.name,
      path: submenu.path,
    })),
);

export const findMenuByPath = (pathname) => {
  const matchedMenu = flatMenuList.find(({ path }) => pathname === path);

  if (matchedMenu) {
    return matchedMenu;
  }

  return flatMenuList.find(({ path }) => pathname.startsWith(path)) ?? null;
};

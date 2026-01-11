
import React, { useState, useMemo, useCallback, useEffect, Suspense, lazy } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { ContainerType, CargoItem, PackedItem, ContainerSpec } from './types';
import { CONTAINER_SPECS } from './constants';
import { calculatePacking } from './services/packingService';
import LandingPage from './components/LandingPage';
import SelectionModal from './components/SelectionModal';
import { auth } from './lib/supabase';
import SEO, { schemas } from './components/SEO';

// Lazy load components for code splitting
const ContainerVisualizer = lazy(() => import('./components/ContainerVisualizer'));
const CargoControls = lazy(() => import('./components/CargoControls').then(m => ({ default: m.CargoControls })));
const PalletSimulator = lazy(() => import('./components/PalletSimulator'));
const CurrencyCalculator = lazy(() => import('./components/CurrencyCalculator'));
const Incoterms = lazy(() => import('./components/Incoterms'));
const WorldHolidays = lazy(() => import('./components/WorldHolidays'));
const CbmCalculator = lazy(() => import('./components/CbmCalculator'));
const ImportRegulations = lazy(() => import('./components/ImportRegulations'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const InsightDetail = lazy(() => import('./components/InsightDetail'));
const InsightsList = lazy(() => import('./components/InsightsList'));
const Tracker = lazy(() => import('./components/tracker').then(m => ({ default: m.Tracker })));
const FSSC = lazy(() => import('./components/fssc'));
const WorldClock = lazy(() => import('./components/WorldClock'));
const FeedbackModal = lazy(() => import('./components/FeedbackModal'));
const NotFound = lazy(() => import('./components/NotFound'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-slate-600">로딩 중...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  // Check if screen width is large enough
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<'home' | 'insights' | 'insight' | 'admin' | 'privacy' | 'terms' | 'container' | 'pallet' | 'currency' | 'incoterms' | 'holidays' | 'cbm' | 'regulations' | 'tracker' | 'fssc' | 'worldclock' | 'notfound'>('home');
  const [currentInsightId, setCurrentInsightId] = useState<string | null>(null);
  const [trackerCategory, setTrackerCategory] = useState<'container' | 'air' | 'courier' | 'post' | 'rail'>('container');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Check for route on mount and URL changes
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;

      // Check admin route
      setIsAdminRoute(path === '/admin');

      // Check other routes
      if (path.startsWith('/insight/')) {
        const id = path.split('/')[2];
        setCurrentRoute('insight');
        setCurrentInsightId(id);
      } else if (path === '/insights') {
        setCurrentRoute('insights');
      } else if (path === '/privacy') {
        setCurrentRoute('privacy');
      } else if (path === '/terms') {
        setCurrentRoute('terms');
      } else if (path === '/container') {
        setCurrentRoute('container');
      } else if (path === '/pallet') {
        setCurrentRoute('pallet');
      } else if (path === '/currency') {
        setCurrentRoute('currency');
      } else if (path === '/incoterms') {
        setCurrentRoute('incoterms');
      } else if (path === '/holidays') {
        setCurrentRoute('holidays');
      } else if (path === '/cbm') {
        setCurrentRoute('cbm');
      } else if (path === '/regulations') {
        setCurrentRoute('regulations');
      } else if (path === '/fssc') {
        setCurrentRoute('fssc');
      } else if (path === '/worldclock') {
        setCurrentRoute('worldclock');
      } else if (path.startsWith('/tracker')) {
        setCurrentRoute('tracker');
        setActiveTab('tracker');
        // Parse tracker sub-route
        const trackerPath = path.split('/')[2];
        if (trackerPath === 'air') {
          setTrackerCategory('air');
        } else if (trackerPath === 'courier') {
          setTrackerCategory('courier');
        } else if (trackerPath === 'post') {
          setTrackerCategory('post');
        } else if (trackerPath === 'rail') {
          setTrackerCategory('rail');
        } else {
          setTrackerCategory('container');
        }
      } else if (path === '/admin') {
        setCurrentRoute('admin');
      } else if (path === '/') {
        setCurrentRoute('home');
        setActiveTab('home');
      } else {
        setCurrentRoute('notfound');
      }
    };

    checkRoute();

    // Check for saved authentication
    const savedAuth = localStorage.getItem('adminAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', checkRoute);

    return () => {
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  // Listen for window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'container' | 'pallet' | 'currency' | 'incoterms' | 'holidays' | 'cbm' | 'regulations' | 'privacy' | 'terms' | 'tracker' | 'fssc' | 'worldclock'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  // ESC 키로 메가 메뉴 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && megaMenuOpen) {
        setMegaMenuOpen(false);
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [megaMenuOpen]);


  // Container Simulator State
  const [containerType, setContainerType] = useState<ContainerType>(ContainerType.FT20);
  const [cargoList, setCargoList] = useState<CargoItem[]>([]);
  const [packedItems, setPackedItems] = useState<PackedItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isArranging, setIsArranging] = useState<boolean>(false);
  const [globalPackingMode, setGlobalPackingMode] = useState<'bottom-first' | 'inner-first'>('bottom-first');

  // Pallet Simulator State
  const [palletItems, setPalletItems] = useState<any[]>([]);
  const [palletSize, setPalletSize] = useState({ width: 1100, height: 150, length: 1100 });

  // Stats calculation
  const stats = useMemo(() => {
    const currentContainer = CONTAINER_SPECS[containerType];
    const totalVolume = currentContainer.width * currentContainer.height * currentContainer.length;
    const usedVolume = packedItems.reduce((acc, i) => acc + (i.dimensions.width * i.dimensions.height * i.dimensions.length), 0);

    // 그룹별 아이템 개수 계산
    const groupCounts = new Set(packedItems.map(item => item.id));

    return {
      volumeEfficiency: totalVolume > 0 ? (usedVolume / totalVolume) * 100 : 0,
      count: packedItems.length,
      totalItems: packedItems.length,
      totalGroups: groupCounts.size
    };
  }, [packedItems, containerType]);

  // 모든 회전 방향 가져오기
  const getAllOrientations = (dims: { width: number, height: number, length: number }) => {
    const { width: w, height: h, length: l } = dims;
    return [
      { width: w, height: h, length: l },
      { width: l, height: h, length: w },
      { width: w, height: l, length: h },
      { width: h, height: l, length: w },
      { width: l, height: w, length: h },
      { width: h, height: w, length: l },
    ];
  };

  // 위치에 배치 가능한지 체크
  const canPlaceAt = (
    pos: { x: number, y: number, z: number },
    dims: { width: number, height: number, length: number },
    items: PackedItem[]
  ): boolean => {
    // 컨테이너 경계 체크
    if (pos.x < 0 || pos.y < 0 || pos.z < 0) return false;
    if (pos.x + dims.width > CONTAINER_SPECS[containerType].width) return false;
    if (pos.y + dims.height > CONTAINER_SPECS[containerType].height) return false;
    if (pos.z + dims.length > CONTAINER_SPECS[containerType].length) return false;

    // 충돌 체크
    for (const item of items) {
      if (!(pos.x >= item.position.x + item.dimensions.width ||
            pos.x + dims.width <= item.position.x ||
            pos.y >= item.position.y + item.dimensions.height ||
            pos.y + dims.height <= item.position.y ||
            pos.z >= item.position.z + item.dimensions.length ||
            pos.z + dims.length <= item.position.z)) {
        return false;
      }
    }
    return true;
  };

  // 지지율 계산 (아래 아이템들에 의해 몇 %가 지지되는지)
  const calculateSupportRatio = (
    pos: { x: number, y: number, z: number },
    dims: { width: number, height: number, length: number },
    existingItems: PackedItem[]
  ): number => {
    const itemArea = dims.width * dims.length;

    // 바닥에 놓이는 경우 100% 지지
    if (pos.y <= 0) {
      return 1.0;
    }

    // 새 아이템의 바닥 영역
    const itemLeft = pos.x;
    const itemRight = pos.x + dims.width;
    const itemFront = pos.z;
    const itemBack = pos.z + dims.length;

    let supportedArea = 0;

    // 아래 아이템들과의 겹침 면적 계산
    for (const item of existingItems) {
      const itemTop = item.position.y + item.dimensions.height;

      // 이 아이템이 새 아이템 바로 아래에 있는지 확인 (약간의 여유 허용)
      if (Math.abs(itemTop - pos.y) < 1) {
        // XZ 평면에서 겹치는 영역 계산
        const overlapLeft = Math.max(itemLeft, item.position.x);
        const overlapRight = Math.min(itemRight, item.position.x + item.dimensions.width);
        const overlapFront = Math.max(itemFront, item.position.z);
        const overlapBack = Math.min(itemBack, item.position.z + item.dimensions.length);

        if (overlapRight > overlapLeft && overlapBack > overlapFront) {
          const overlapArea = (overlapRight - overlapLeft) * (overlapBack - overlapFront);
          supportedArea += overlapArea;
        }
      }
    }

    return supportedArea / itemArea;
  };

  const MIN_SUPPORT_RATIO = 1.0; // 최소 100% 지지 필요

  // 최적 위치 찾기 - 바닥부터 채우기 방식
  const findBestPositionBottomFirst = (
    container: ContainerSpec,
    existingItems: PackedItem[],
    dims: { width: number, height: number, length: number }
  ) => {
    let bestPosition = { x: 0, y: 0, z: 0 };
    let lowestY = Infinity;
    let found = false;

    // 25mm 단위로 더 정밀하게 스캔
    for (let x = 0; x <= container.width - dims.width; x += 25) {
      for (let z = 0; z <= container.length - dims.length; z += 25) {
        let maxY = 0; // 이 위치에서의 바닥 높이

        // XZ 평면에서 겹치는 아이템들 찾기
        for (const item of existingItems) {
          if (x < item.position.x + item.dimensions.width &&
              x + dims.width > item.position.x &&
              z < item.position.z + item.dimensions.length &&
              z + dims.length > item.position.z) {
            // 겹친다면 그 아이템 위가 바닥이 됨
            const itemTop = item.position.y + item.dimensions.height;
            maxY = Math.max(maxY, itemTop);
          }
        }

        // 이 위치가 컨테이너 높이를 초과하지 않는지 확인
        if (maxY + dims.height <= container.height) {
          const pos = { x, y: maxY, z };
          // 지지율 체크 (90% 이상 지지되어야 함)
          const supportRatio = calculateSupportRatio(pos, dims, existingItems);
          if (supportRatio >= MIN_SUPPORT_RATIO) {
            // 가장 낮은 위치 선택
            if (maxY < lowestY) {
              lowestY = maxY;
              bestPosition = pos;
              found = true;
            }
          }
        }
      }
    }

    return found ? bestPosition : null;
  };

  // 최적 위치 찾기 - 안쪽부터 채우기 방식 (모서리 우선)
  const findBestPositionInnerFirst = (
    container: ContainerSpec,
    existingItems: PackedItem[],
    dims: { width: number, height: number, length: number }
  ) => {
    let bestPosition = null;
    let bestScore = Infinity;

    // 안쪽부터, 아래부터, 왼쪽부터 채우기
    for (let z = container.length - dims.length; z >= 0; z -= 25) {
      for (let y = 0; y <= container.height - dims.height; y += 25) {
        for (let x = 0; x <= container.width - dims.width; x += 25) {
          const pos = { x, y, z };

          if (canPlaceAt(pos, dims, existingItems)) {
            // 지지율 체크 (90% 이상 지지되어야 함)
            const supportRatio = calculateSupportRatio(pos, dims, existingItems);
            if (supportRatio >= MIN_SUPPORT_RATIO) {
              // 점수 계산: 안쪽 모서리부터 채우기
              // 1. z축 (뒤쪽 우선) - 가장 중요
              // 2. y축 (아래쪽 우선) - 두 번째 중요
              // 3. x축 (왼쪽 우선) - 세 번째 중요
              const score = (container.length - z - dims.length) * 1000000 + // 뒤쪽 벽에 가까울수록 우선
                           y * 1000 + // 바닥에 가까울수록 우선
                           x; // 왼쪽 벽에 가까울수록 우선

              if (score < bestScore) {
                bestScore = score;
                bestPosition = pos;
              }
            }
          }
        }
      }

      // 이미 위치를 찾았으면 더 이상 앞쪽을 검색하지 않음 (안쪽 우선)
      if (bestPosition && bestPosition.z === z) {
        break;
      }
    }

    return bestPosition;
  };

  const handleAddCargo = (newItem: Omit<CargoItem, 'id'> | CargoItem) => {
    const item: CargoItem = 'id' in newItem
      ? newItem  // 이미 id가 있으면 (편집 모드) 그대로 사용
      : {
          ...newItem,
          id: Math.random().toString(36).substr(2, 9),
        };

    // 편집 모드인 경우 기존 항목 먼저 제거
    if ('id' in newItem) {
      setCargoList(prev => prev.filter(c => c.id !== newItem.id));
      setPackedItems(prev => prev.filter(p => p.id !== newItem.id));
    }

    // 현재 globalPackingMode를 item에 추가
    item.packingMode = globalPackingMode;

    setCargoList(prev => [...prev, item]);
    setSelectedGroupId(item.id);
    const currentContainer = CONTAINER_SPECS[containerType];
    // 편집 모드인 경우 기존 아이템을 제외한 packedItems 사용
    let currentPackedItems = 'id' in newItem
      ? packedItems.filter(p => p.id !== newItem.id)
      : [...packedItems];

    // 화물 처리 (회전 고려한 최적 배치)
    for (let i = 0; i < item.quantity; i++) {
      const orientations = getAllOrientations(item.dimensions);
      let bestPosition = null;
      let bestOrientation = item.dimensions;
      let lowestY = Infinity;

      for (const orientation of orientations) {
        const position = item.packingMode === 'inner-first'
          ? findBestPositionInnerFirst(currentContainer, currentPackedItems, orientation)
          : findBestPositionBottomFirst(currentContainer, currentPackedItems, orientation);

        if (position) {
          if (item.packingMode === 'inner-first') {
            // 안쪽부터는 첫 번째 유효한 위치 선택
            bestPosition = position;
            bestOrientation = orientation;
            break;
          } else if (position.y < lowestY) {
            // 바닥부터는 가장 낮은 위치 선택
            lowestY = position.y;
            bestPosition = position;
            bestOrientation = orientation;
          }
        }
      }

      if (bestPosition) {
        const newInstance: PackedItem = {
          ...item,
          uniqueId: `${item.id}-${i}-${Date.now()}`,
          dimensions: bestOrientation,
          weight: item.weight,
          position: bestPosition
        };
        currentPackedItems.push(newInstance);
      } else {
        // 배치할 수 없으면 경고
        alert(`${item.name} ${i + 1}/${item.quantity}개를 배치할 공간이 없습니다.`);
        break;
      }
    }

    setPackedItems(currentPackedItems);
  };

  const handleRemoveCargo = (id: string) => {
    setCargoList(prev => prev.filter(item => item.id !== id));
    setPackedItems(prev => prev.filter(item => item.id !== id));
    if (selectedGroupId === id) setSelectedGroupId(null);
  };

  const handleClearCargo = () => {
    setCargoList([]);
    setPackedItems([]);
    setSelectedGroupId(null);
  };

  const handleRotateCargo = (id: string) => {
    setCargoList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, dimensions: { ...item.dimensions, width: item.dimensions.length, length: item.dimensions.width } };
      }
      return item;
    }));
    setPackedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, dimensions: { ...item.dimensions, width: item.dimensions.length, length: item.dimensions.width } };
      }
      return item;
    }));
  };

  const handleItemMove = useCallback((uniqueId: string, newPosition: {x: number, y: number, z: number}) => {
    setPackedItems(prev => prev.map(item => 
      item.uniqueId === uniqueId ? { ...item, position: newPosition } : item
    ));
  }, []);

  const handleAutoArrange = async () => {
    const currentContainer = CONTAINER_SPECS[containerType];
    if (cargoList.length === 0) return;

    // 로딩 시작
    setIsArranging(true);

    // 0.5초 동안 처리 중 표시
    await new Promise(resolve => setTimeout(resolve, 500));

    // 부피가 큰 것부터 정렬
    const sortedCargo = [...cargoList].sort((a, b) => {
      const volA = a.dimensions.width * a.dimensions.height * a.dimensions.length;
      const volB = b.dimensions.width * b.dimensions.height * b.dimensions.length;
      return volB - volA;
    });

    const arrangedItems: PackedItem[] = [];

    for (const cargo of sortedCargo) {
      for (let i = 0; i < cargo.quantity; i++) {
        const orientations = getAllOrientations(cargo.dimensions);
        let bestPosition = null;
        let bestOrientation = cargo.dimensions;
        let bestScore = Infinity;

        for (const orientation of orientations) {
          // 전역 packing mode에 따라 적절한 함수 사용
          const position = globalPackingMode === 'inner-first'
            ? findBestPositionInnerFirst(currentContainer, arrangedItems, orientation)
            : findBestPositionBottomFirst(currentContainer, arrangedItems, orientation);

          if (position) {
            // inner-first일 때는 다른 점수 계산 사용
            const score = globalPackingMode === 'inner-first'
              ? (currentContainer.length - position.z - orientation.length) * 1000000 +
                position.y * 1000 +
                position.x
              : position.y * 1000 +
                Math.abs(position.x + orientation.width/2 - currentContainer.width/2) +
                Math.abs(position.z + orientation.length/2 - currentContainer.length/2);

            if (score < bestScore) {
              bestScore = score;
              bestPosition = position;
              bestOrientation = orientation;
            }
          }
        }

        if (bestPosition) {
          arrangedItems.push({
            ...cargo,
            uniqueId: `${cargo.id}-${i}-${Date.now()}`,
            dimensions: bestOrientation,
            weight: cargo.weight,
            position: bestPosition
          });
        }
      }
    }

    setPackedItems(arrangedItems);

    // 로딩 종료
    setIsArranging(false);
  };

  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id);
  };

  const currentContainer = CONTAINER_SPECS[containerType];

  // Navigation handlers
  const navigate = (path: string, skipStateUpdate = false) => {
    window.history.pushState({}, '', path);
    if (!skipStateUpdate) {
      // Directly update route state instead of dispatching popstate
      const routeMap: Record<string, typeof currentRoute> = {
        '/': 'home',
        '/insights': 'insights',
        '/privacy': 'privacy',
        '/terms': 'terms',
        '/container': 'container',
        '/pallet': 'pallet',
        '/currency': 'currency',
        '/incoterms': 'incoterms',
        '/holidays': 'holidays',
        '/cbm': 'cbm',
        '/regulations': 'regulations',
        '/tracker': 'tracker',
        '/fssc': 'fssc',
        '/admin': 'admin',
      };

      // Handle dynamic insight route
      if (path.startsWith('/insight/')) {
        const id = path.split('/')[2];
        setCurrentRoute('insight');
        setCurrentInsightId(id);
        return;
      }

      // Handle tracker routes with categories
      if (path.startsWith('/tracker')) {
        setCurrentRoute('tracker');
        setActiveTab('tracker');
        const trackerPath = path.split('/')[2];
        if (trackerPath === 'air') {
          setTrackerCategory('air');
        } else if (trackerPath === 'courier') {
          setTrackerCategory('courier');
        } else if (trackerPath === 'post') {
          setTrackerCategory('post');
        } else if (trackerPath === 'rail') {
          setTrackerCategory('rail');
        } else {
          setTrackerCategory('container');
        }
        return;
      }

      const route = routeMap[path];
      if (route) {
        setCurrentRoute(route);
      }
    }
  };

  const handleNavigateToInsights = () => {
    navigate('/insights');
  };

  const handleNavigateToInsight = (id: string) => {
    navigate(`/insight/${id}`);
  };

  const handleNavigateBack = () => {
    navigate('/');
  };

  // Handle navigation from admin to home
  const handleAdminToHome = () => {
    setIsAdminRoute(false);
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    navigate('/');
  };

  // Handle login
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    // Supabase 인증
    try {
      const { data, error } = await auth.signIn(email, password);
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data && data.user) {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuthenticated', 'true');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Handle logout from login page
  const handleBackFromLogin = () => {
    setIsAdminRoute(false);
    navigate('/');
  };

  // SEO 설정 - 라우트별 메타 태그 및 JSON-LD
  const BASE_URL = 'https://www.shipdago.com';
  const getSEOConfig = () => {
    const seoConfigs: Record<string, { title?: string; description: string; keywords: string; canonicalUrl: string; jsonLd: object[] }> = {
      home: {
        description: '물류의 디지털 전환, SHIPDAGO와 함께하세요. 컨테이너 3D 시뮬레이션, 환율 계산, 화물 추적 등 물류 실무 도구를 무료로 제공합니다.',
        keywords: '쉽다고, SHIPDAGO, 십다고, 포워더, 포워딩, 무역, 수출입, 물류, 화물운송, 국제물류, 해상운송, 컨테이너 적재, 3D 시뮬레이터, 환율 계산기, CBM 계산기, 인코텀즈, 수입규제, 관세, HS코드',
        canonicalUrl: BASE_URL,
        jsonLd: [schemas.organization, schemas.website],
      },
      container: {
        title: '3D 컨테이너 적재 시뮬레이터',
        description: '무료 3D 컨테이너 적재 시뮬레이션으로 최적의 화물 배치를 계획하세요. 20ft, 40ft, 40ft HC 컨테이너 지원.',
        keywords: '컨테이너 적재, 3D 시뮬레이터, 화물 배치, 20ft 컨테이너, 40ft 컨테이너, 적재 최적화',
        canonicalUrl: `${BASE_URL}/container`,
        jsonLd: [schemas.softwareApplication('3D 컨테이너 적재 시뮬레이터', '무료 3D 컨테이너 적재 시뮬레이션으로 최적의 화물 배치를 계획하세요.', `${BASE_URL}/container`)],
      },
      pallet: {
        title: '팔레트 적재 시뮬레이터',
        description: '팔레트 위에 박스를 효율적으로 적재하는 시뮬레이션. 다양한 팔레트 크기 지원.',
        keywords: '팔레트 적재, 박스 적재, 팔레트 시뮬레이터, 적재 최적화',
        canonicalUrl: `${BASE_URL}/pallet`,
        jsonLd: [schemas.softwareApplication('팔레트 적재 시뮬레이터', '팔레트 위에 박스를 효율적으로 적재하는 시뮬레이션.', `${BASE_URL}/pallet`)],
      },
      currency: {
        title: '실시간 환율 계산기',
        description: '실시간 환율 정보로 빠르고 정확한 환율 계산. 주요 통화 지원, 무역 실무에 최적화.',
        keywords: '환율 계산기, 실시간 환율, 달러 환율, 위안 환율, 엔화 환율, 유로 환율',
        canonicalUrl: `${BASE_URL}/currency`,
        jsonLd: [schemas.softwareApplication('실시간 환율 계산기', '실시간 환율 정보로 빠르고 정확한 환율 계산.', `${BASE_URL}/currency`)],
      },
      cbm: {
        title: 'CBM 계산기',
        description: '화물의 CBM(입방미터)을 쉽고 빠르게 계산. 해상 운송비 산정에 필수.',
        keywords: 'CBM 계산기, 입방미터, 화물 부피, 해상 운송, 물류 계산',
        canonicalUrl: `${BASE_URL}/cbm`,
        jsonLd: [schemas.softwareApplication('CBM 계산기', '화물의 CBM(입방미터)을 쉽고 빠르게 계산.', `${BASE_URL}/cbm`)],
      },
      incoterms: {
        title: '인코텀즈 2020 가이드',
        description: 'Incoterms 2020 완벽 가이드. FOB, CIF, EXW 등 무역조건 비교 및 책임 범위 설명.',
        keywords: '인코텀즈, Incoterms 2020, FOB, CIF, EXW, DDP, 무역조건',
        canonicalUrl: `${BASE_URL}/incoterms`,
        jsonLd: [schemas.softwareApplication('인코텀즈 2020 가이드', 'Incoterms 2020 무역조건 완벽 가이드.', `${BASE_URL}/incoterms`)],
      },
      holidays: {
        title: '세계 공휴일 캘린더',
        description: '전 세계 주요 국가의 공휴일 정보. 수출입 일정 계획에 필수.',
        keywords: '세계 공휴일, 해외 공휴일, 국가별 휴일, 무역 캘린더',
        canonicalUrl: `${BASE_URL}/holidays`,
        jsonLd: [schemas.softwareApplication('세계 공휴일 캘린더', '전 세계 주요 국가의 공휴일 정보.', `${BASE_URL}/holidays`)],
      },
      regulations: {
        title: '수입규제 조회',
        description: '국가별 수입규제 정보 조회. 관세, 인증, 라벨링 요건 확인.',
        keywords: '수입규제, 관세, 수입인증, 라벨링, 무역규제',
        canonicalUrl: `${BASE_URL}/regulations`,
        jsonLd: [schemas.softwareApplication('수입규제 조회', '국가별 수입규제 정보 조회.', `${BASE_URL}/regulations`)],
      },
      tracker: {
        title: '화물 추적',
        description: '컨테이너, 항공화물, 택배 등 다양한 화물 추적 서비스. 실시간 위치 확인.',
        keywords: '화물 추적, 컨테이너 추적, 항공화물 추적, 택배 추적',
        canonicalUrl: `${BASE_URL}/tracker`,
        jsonLd: [schemas.softwareApplication('화물 추적', '컨테이너, 항공화물, 택배 등 실시간 화물 추적.', `${BASE_URL}/tracker`)],
      },
      fssc: {
        title: 'FSSC 22000 가이드',
        description: 'FSSC 22000 식품안전 인증 완벽 가이드. 인증 요건 및 절차 안내.',
        keywords: 'FSSC 22000, 식품안전 인증, ISO 22000, 식품 수출',
        canonicalUrl: `${BASE_URL}/fssc`,
        jsonLd: [schemas.softwareApplication('FSSC 22000 가이드', 'FSSC 22000 식품안전 인증 완벽 가이드.', `${BASE_URL}/fssc`)],
      },
      worldclock: {
        title: '세계 시간',
        description: '전 세계 주요 도시의 현재 시간 확인. 무역 파트너와의 업무 시간 조율에 유용.',
        keywords: '세계 시간, 도시별 시간, 시차, 타임존',
        canonicalUrl: `${BASE_URL}/worldclock`,
        jsonLd: [schemas.softwareApplication('세계 시간', '전 세계 주요 도시의 현재 시간 확인.', `${BASE_URL}/worldclock`)],
      },
      insights: {
        title: '물류 인사이트',
        description: '물류 트렌드, 규제 변화, 실무 팁 등 물류 전문 콘텐츠.',
        keywords: '물류 인사이트, 물류 트렌드, 물류 뉴스, 포워딩 팁',
        canonicalUrl: `${BASE_URL}/insights`,
        jsonLd: [schemas.organization],
      },
      privacy: {
        title: '개인정보처리방침',
        description: 'SHIPDAGO 개인정보처리방침',
        keywords: '개인정보처리방침, 프라이버시',
        canonicalUrl: `${BASE_URL}/privacy`,
        jsonLd: [],
      },
      terms: {
        title: '이용약관',
        description: 'SHIPDAGO 서비스 이용약관',
        keywords: '이용약관, 서비스 약관',
        canonicalUrl: `${BASE_URL}/terms`,
        jsonLd: [],
      },
    };

    return seoConfigs[currentRoute] || seoConfigs.home;
  };

  const seoConfig = getSEOConfig();

  // URL 라우트에 따라 activeTab 설정 - 모든 훅은 조건부 렌더링 전에 호출되어야 함
  React.useEffect(() => {
    if (currentRoute === 'container') {
      setActiveTab('container');
    } else if (currentRoute === 'pallet') {
      setActiveTab('pallet');
    } else if (currentRoute === 'currency') {
      setActiveTab('currency');
    } else if (currentRoute === 'incoterms') {
      setActiveTab('incoterms');
    } else if (currentRoute === 'holidays') {
      setActiveTab('holidays');
    } else if (currentRoute === 'cbm') {
      setActiveTab('cbm');
    } else if (currentRoute === 'regulations') {
      setActiveTab('regulations');
    } else if (currentRoute === 'tracker') {
      setActiveTab('tracker');
    } else if (currentRoute === 'fssc') {
      setActiveTab('fssc');
    } else if (currentRoute === 'home') {
      setActiveTab('home');
    }
  }, [currentRoute]);

  // Handle routing
  if (currentRoute === 'admin') {
    if (!isAuthenticated) {
      return (
        <>
          <SpeedInsights />
          <Analytics />
          <AdminLogin onLogin={handleLogin} onBack={handleBackFromLogin} />
        </>
      );
    }

    return (
      <>
        <SpeedInsights />
        <Analytics />
        <AdminDashboard onNavigateHome={handleAdminToHome} />
      </>
    );
  }

  if (currentRoute === 'insights') {
    return (
      <>
        <SEO
          title={seoConfig.title}
          description={seoConfig.description}
          keywords={seoConfig.keywords}
          canonicalUrl={seoConfig.canonicalUrl}
          jsonLd={seoConfig.jsonLd}
        />
        <SpeedInsights />
        <Analytics />
        <Suspense fallback={<LoadingFallback />}>
          <InsightsList
            onNavigateToInsight={handleNavigateToInsight}
            onNavigateBack={handleNavigateBack}
          />
        </Suspense>
      </>
    );
  }

  if (currentRoute === 'insight' && currentInsightId) {
    return (
      <>
        <SpeedInsights />
        <Analytics />
        <Suspense fallback={<LoadingFallback />}>
          <InsightDetail
            insightId={currentInsightId}
            onNavigateBack={() => navigate('/insights')}
            onNavigateToInsight={handleNavigateToInsight}
          />
        </Suspense>
      </>
    );
  }

  if (currentRoute === 'privacy') {
    return (
      <>
        <SEO
          title={seoConfig.title}
          description={seoConfig.description}
          keywords={seoConfig.keywords}
          canonicalUrl={seoConfig.canonicalUrl}
          jsonLd={seoConfig.jsonLd}
        />
        <SpeedInsights />
        <Analytics />
        <Suspense fallback={<LoadingFallback />}>
          <PrivacyPolicy />
        </Suspense>
      </>
    );
  }

  if (currentRoute === 'terms') {
    return (
      <>
        <SEO
          title={seoConfig.title}
          description={seoConfig.description}
          keywords={seoConfig.keywords}
          canonicalUrl={seoConfig.canonicalUrl}
          jsonLd={seoConfig.jsonLd}
        />
        <SpeedInsights />
        <Analytics />
        <Suspense fallback={<LoadingFallback />}>
          <TermsOfService />
        </Suspense>
      </>
    );
  }

  if (currentRoute === 'notfound') {
    return (
      <>
        <SpeedInsights />
        <Analytics />
        <Suspense fallback={<LoadingFallback />}>
          <NotFound onNavigateHome={() => navigate('/')} />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonicalUrl={seoConfig.canonicalUrl}
        jsonLd={seoConfig.jsonLd}
      />
      <SpeedInsights />
      <Analytics />
      {/* Tailwind CDN safelist - 시뮬레이터에서 사용하는 클래스를 미리 로드 */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:col-span-3 lg:col-span-1 lg:flex lg:flex-row lg:h-auto grid-cols-1" aria-hidden="true" />
      <div className="h-screen w-full bg-white flex flex-col font-sans overflow-hidden text-slate-900">
      {/* Premium Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-10 flex justify-between items-center shrink-0 z-50 h-[60px] md:h-[80px] relative">
        <div
          className="flex items-center gap-2 md:gap-4 cursor-pointer group"
          onClick={() => {
            setActiveTab('home');
            navigate('/');
          }}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center font-black text-white text-xl md:text-2xl shadow-md group-hover:shadow-lg transition-all duration-300">
            <svg width="20" height="20" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-none">SHIPDAGO</h1>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-medium tracking-wide mt-0.5 md:mt-1 flex items-center gap-1 md:gap-1.5">
              <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
              Container Loading Tool
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
           {/* HOME */}
           <button
             onClick={() => {
               setActiveTab('home');
               navigate('/');
               setOpenDropdown(null);
             }}
             className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-lg group ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
           >
             <span className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-indigo-50"></span>
             <span className="relative">HOME</span>
             {activeTab === 'home' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-500 rounded-full"></span>}
           </button>

           {/* Divider */}
           <div className="w-px h-5 bg-slate-200/80 mx-1"></div>

           {/* 시뮬레이터 Dropdown */}
           <div
             className="relative"
             onMouseEnter={() => !megaMenuOpen && setOpenDropdown('simulator')}
             onMouseLeave={() => !megaMenuOpen && setOpenDropdown(null)}
           >
             <button
               onClick={() => { setOpenDropdown(megaMenuOpen ? null : 'simulator'); setMegaMenuOpen(!megaMenuOpen); }}
               className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-lg flex items-center gap-1.5 group ${
                 activeTab === 'container' || activeTab === 'pallet' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
               }`}
             >
               <span className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-indigo-50"></span>
               <span className="relative">시뮬레이터</span>
               <svg className={`relative w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'simulator' || megaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
               </svg>
               {(activeTab === 'container' || activeTab === 'pallet') && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-500 rounded-full"></span>}
             </button>
             <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 transition-all duration-200 origin-top ${openDropdown === 'simulator' && !megaMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
               <div className="bg-white rounded-xl shadow-xl border border-slate-200/60 py-2 min-w-[180px] overflow-hidden">
                   <button
                     onClick={() => { setActiveTab('container'); navigate('/container'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'container' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">3D 컨테이너</div>
                     <div className="text-[10px] text-slate-400">적재 시뮬레이션</div>
                   </button>
                   <button
                     onClick={() => { setActiveTab('pallet'); navigate('/pallet'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'pallet' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">3D 팔레트</div>
                     <div className="text-[10px] text-slate-400">팔레타이징 시뮬레이션</div>
                   </button>
                 </div>
               </div>
           </div>

           {/* Divider */}
           <div className="w-px h-5 bg-slate-200/80 mx-1"></div>

           {/* 화물 추적 Dropdown */}
           <div
             className="relative"
             onMouseEnter={() => !megaMenuOpen && setOpenDropdown('tracker')}
             onMouseLeave={() => !megaMenuOpen && setOpenDropdown(null)}
           >
             <button
               onClick={() => { setOpenDropdown(megaMenuOpen ? null : 'tracker'); setMegaMenuOpen(!megaMenuOpen); }}
               className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-lg flex items-center gap-1.5 group ${
                 activeTab === 'tracker' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
               }`}
             >
               <span className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-indigo-50"></span>
               <span className="relative">화물 추적</span>
               <svg className={`relative w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'tracker' || megaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
               </svg>
               {activeTab === 'tracker' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-500 rounded-full"></span>}
             </button>
             <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 transition-all duration-200 origin-top ${openDropdown === 'tracker' && !megaMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
               <div className="bg-white rounded-xl shadow-xl border border-slate-200/60 py-2 min-w-[160px] overflow-hidden">
                   <button
                     onClick={() => { setActiveTab('tracker'); setTrackerCategory('container'); navigate('/tracker'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'tracker' && trackerCategory === 'container' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">컨테이너</div>
                     <div className="text-[10px] text-slate-400">해상 B/L 추적</div>
                   </button>
                   <button
                     onClick={() => { setActiveTab('tracker'); setTrackerCategory('air'); navigate('/tracker/air'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'tracker' && trackerCategory === 'air' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">항공 화물</div>
                     <div className="text-[10px] text-slate-400">AWB 추적</div>
                   </button>
                   <button
                     onClick={() => { setActiveTab('tracker'); setTrackerCategory('courier'); navigate('/tracker/courier'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'tracker' && trackerCategory === 'courier' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">택배/특송</div>
                     <div className="text-[10px] text-slate-400">국내외 택배</div>
                   </button>
                   <button
                     onClick={() => { setActiveTab('tracker'); setTrackerCategory('post'); navigate('/tracker/post'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'tracker' && trackerCategory === 'post' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">우편/EMS</div>
                     <div className="text-[10px] text-slate-400">국제우편 추적</div>
                   </button>
                   <button
                     onClick={() => { setActiveTab('tracker'); setTrackerCategory('rail'); navigate('/tracker/rail'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'tracker' && trackerCategory === 'rail' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">철도</div>
                     <div className="text-[10px] text-slate-400">철도화물 추적</div>
                   </button>
                 </div>
               </div>
           </div>

           {/* Divider */}
           <div className="w-px h-5 bg-slate-200/80 mx-1"></div>

           {/* 계산기 Dropdown */}
           <div
             className="relative"
             onMouseEnter={() => !megaMenuOpen && setOpenDropdown('calculator')}
             onMouseLeave={() => !megaMenuOpen && setOpenDropdown(null)}
           >
             <button
               onClick={() => { setOpenDropdown(megaMenuOpen ? null : 'calculator'); setMegaMenuOpen(!megaMenuOpen); }}
               className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-lg flex items-center gap-1.5 group ${
                 activeTab === 'cbm' || activeTab === 'currency' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
               }`}
             >
               <span className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-indigo-50"></span>
               <span className="relative">계산기</span>
               <svg className={`relative w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'calculator' || megaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
               </svg>
               {(activeTab === 'cbm' || activeTab === 'currency') && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-500 rounded-full"></span>}
             </button>
             <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 transition-all duration-200 origin-top ${openDropdown === 'calculator' && !megaMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
               <div className="bg-white rounded-xl shadow-xl border border-slate-200/60 py-2 min-w-[180px] overflow-hidden">
                   <button
                     onClick={() => { setActiveTab('cbm'); navigate('/cbm'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'cbm' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">CBM 계산기</div>
                     <div className="text-[10px] text-slate-400">CBM, R/T, M/T 계산</div>
                   </button>
                   <button
                     onClick={() => { setActiveTab('currency'); navigate('/currency'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'currency' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">환율 계산기</div>
                     <div className="text-[10px] text-slate-400">실시간 환율</div>
                   </button>
                 </div>
               </div>
           </div>

           {/* Divider */}
           <div className="w-px h-5 bg-slate-200/80 mx-1"></div>

           {/* 정보 Dropdown */}
           <div
             className="relative"
             onMouseEnter={() => !megaMenuOpen && setOpenDropdown('info')}
             onMouseLeave={() => !megaMenuOpen && setOpenDropdown(null)}
           >
             <button
               onClick={() => { setOpenDropdown(megaMenuOpen ? null : 'info'); setMegaMenuOpen(!megaMenuOpen); }}
               className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-lg flex items-center gap-1.5 group ${
                 activeTab === 'incoterms' || activeTab === 'holidays' || activeTab === 'regulations' || activeTab === 'fssc' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
               }`}
             >
               <span className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-indigo-50"></span>
               <span className="relative">수/출입 정보</span>
               <svg className={`relative w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'info' || megaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
               </svg>
               {(activeTab === 'incoterms' || activeTab === 'holidays' || activeTab === 'regulations' || activeTab === 'fssc' || activeTab === 'worldclock') && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-500 rounded-full"></span>}
             </button>
             <div className={`absolute top-full right-0 pt-2 z-50 transition-all duration-200 origin-top ${openDropdown === 'info' && !megaMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
               <div className="bg-white rounded-xl shadow-xl border border-slate-200/60 py-2 min-w-[180px] overflow-hidden">
                   <button
                     onClick={() => { setActiveTab('worldclock'); navigate('/worldclock'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'worldclock' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">세계 시간</div>
                     <div className="text-[10px] text-slate-400">주요 물류 거점 현지시간</div>
                   </button>
                   <button
                     onClick={() => { setActiveTab('holidays'); navigate('/holidays'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'holidays' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">세계 공휴일 달력</div>
                     <div className="text-[10px] text-slate-400">전세계 국가별 휴일</div>
                   </button>
                   <button
                     onClick={() => { setActiveTab('incoterms'); navigate('/incoterms'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'incoterms' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">인코텀즈</div>
                     <div className="text-[10px] text-slate-400">무역 거래조건</div>
                   </button>
                   <button
                     onClick={() => { setActiveTab('regulations'); navigate('/regulations'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'regulations' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">수입 규제</div>
                     <div className="text-[10px] text-slate-400">국가별 수입 규제</div>
                   </button>
                   <button
                     onClick={() => { setActiveTab('fssc'); navigate('/fssc'); setOpenDropdown(null); }}
                     className={`w-full px-5 py-2.5 text-center transition-all ${
                       activeTab === 'fssc' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className="text-sm font-bold">FS/SC 조회</div>
                     <div className="text-[10px] text-slate-400">유류할증료/보안료</div>
                   </button>
                 </div>
               </div>
           </div>

           {/* Spacer */}
           <div className="w-6"></div>

           {/* Desktop Hamburger Menu Button */}
           <button
             onClick={() => {
               // 현재 활성화된 탭에 따라 카테고리 설정 (기본값 없음)
               const getDefaultCategory = (): string | null => {
                 if (activeTab === 'container' || activeTab === 'pallet') return 'simulator';
                 if (activeTab === 'tracker') return 'tracker';
                 if (activeTab === 'cbm' || activeTab === 'currency') return 'calculator';
                 if (activeTab === 'worldclock' || activeTab === 'holidays' || activeTab === 'incoterms' || activeTab === 'regulations' || activeTab === 'fssc') return 'info';
                 return null;
               };
               if (!megaMenuOpen) {
                 setOpenDropdown(getDefaultCategory());
               } else {
                 setOpenDropdown(null);
               }
               setMegaMenuOpen(!megaMenuOpen);
             }}
             className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
               megaMenuOpen
                 ? 'bg-blue-600 text-white shadow-md'
                 : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
             }`}
             aria-label="전체 메뉴"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             </svg>
           </button>
        </nav>

        {/* Mega Menu - Speech Bubble Style */}
        <div className={`hidden md:block absolute top-full left-0 right-0 z-50 transition-all duration-300 ${megaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'}`}>
          {/* Menu Content */}
          <div className="bg-[#fdfdfe]/[0.98] shadow-xl border-t border-slate-200 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-6 py-6">
              <div className="flex gap-6 items-stretch h-[340px]">
                {/* 좌측 - 카테고리 */}
                <div className="w-72 flex flex-col pt-6">
                  <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-3 px-4">CATEGORIES</p>
                  <div className="space-y-1 flex-1">
                    {[
                      { id: 'simulator', label: '시뮬레이터', desc: '3D 적재 시뮬레이션', icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )},
                      { id: 'tracker', label: '화물 추적', desc: '실시간 위치 조회', icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )},
                      { id: 'calculator', label: '계산기', desc: 'CBM, 환율 계산', icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )},
                      { id: 'info', label: '수출입 정보', desc: '시간, 공휴일, FS/SC', icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )},
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onMouseEnter={() => setOpenDropdown(cat.id)}
                        className={`relative w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                          openDropdown === cat.id
                            ? 'bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.05)]'
                            : 'hover:bg-white/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          openDropdown === cat.id ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md' : 'bg-white shadow-[0_1px_8px_-2px_rgba(0,0,0,0.08)] text-slate-500'
                        }`}>
                          {cat.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800 text-sm">{cat.label}</div>
                          <div className="text-[11px] text-slate-400">{cat.desc}</div>
                        </div>
                        <svg className={`w-4 h-4 transition-colors ${openDropdown === cat.id ? 'text-blue-700' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 우측 - 세부 메뉴 */}
                <div className="flex-1">
                  <div className="bg-white rounded-xl shadow-[0_2px_12px_-3px_rgba(0,0,0,0.05)] p-5 h-full flex flex-col">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-4 px-2">
                      <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                        {openDropdown === 'simulator' && 'SIMULATION TOOLS'}
                        {openDropdown === 'tracker' && 'TRACKING SERVICES'}
                        {openDropdown === 'calculator' && 'CALCULATORS'}
                        {openDropdown === 'info' && 'INFORMATION'}
                      </p>
                      <button
                        onClick={() => { setMegaMenuOpen(false); setOpenDropdown(null); }}
                        className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {/* 시뮬레이터 메뉴 */}
                    {openDropdown === 'simulator' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { setActiveTab('container'); navigate('/container'); setMegaMenuOpen(false); setOpenDropdown(null); }}
                          className={`group flex items-center gap-2.5 p-3 rounded-lg transition-all text-left ${activeTab === 'container' ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                        >
                          <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <div className="leading-none">
                            <span className="text-sm font-semibold text-slate-700 block">3D 컨테이너</span>
                            <span className="text-[10px] text-slate-400 leading-tight">컨테이너 적재 시뮬레이션</span>
                          </div>
                        </button>
                        <button
                          onClick={() => { setActiveTab('pallet'); navigate('/pallet'); setMegaMenuOpen(false); setOpenDropdown(null); }}
                          className={`group flex items-center gap-2.5 p-3 rounded-lg transition-all text-left ${activeTab === 'pallet' ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                        >
                          <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                          <div className="leading-none">
                            <span className="text-sm font-semibold text-slate-700 block">3D 팔레트</span>
                            <span className="text-[10px] text-slate-400 leading-tight">팔레트 적재 시뮬레이션</span>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* 화물 추적 메뉴 */}
                    {openDropdown === 'tracker' && (
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { cat: 'container', route: '/tracker', label: '컨테이너', desc: '해상 컨테이너 추적', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> },
                          { cat: 'air', route: '/tracker/air', label: '항공 화물', desc: 'AWB 번호로 추적', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /> },
                          { cat: 'courier', route: '/tracker/courier', label: '택배/특송', desc: 'DHL, FedEx, UPS 등', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
                          { cat: 'post', route: '/tracker/post', label: '우편/EMS', desc: '국제 우편물 추적', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" /> },
                          { cat: 'rail', route: '/tracker/rail', label: '철도', desc: '철도 화물 추적', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h6m-6 0l6-6" /> },
                        ].map(item => (
                          <button
                            key={item.cat}
                            onClick={() => { setActiveTab('tracker'); setTrackerCategory(item.cat as any); navigate(item.route); setMegaMenuOpen(false); setOpenDropdown(null); }}
                            className={`group flex items-center gap-2.5 p-3 rounded-lg transition-all text-left ${activeTab === 'tracker' && trackerCategory === item.cat ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                          >
                            <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                            <div className="leading-none">
                              <span className="text-sm font-semibold text-slate-700 block">{item.label}</span>
                              <span className="text-[10px] text-slate-400 leading-tight">{item.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 계산기 메뉴 */}
                    {openDropdown === 'calculator' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { setActiveTab('cbm'); navigate('/cbm'); setMegaMenuOpen(false); setOpenDropdown(null); }}
                          className={`group flex items-center gap-2.5 p-3 rounded-lg transition-all text-left ${activeTab === 'cbm' ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                        >
                          <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <div className="leading-none">
                            <span className="text-sm font-semibold text-slate-700 block">CBM 계산기</span>
                            <span className="text-[10px] text-slate-400 leading-tight">부피/중량 계산</span>
                          </div>
                        </button>
                        <button
                          onClick={() => { setActiveTab('currency'); navigate('/currency'); setMegaMenuOpen(false); setOpenDropdown(null); }}
                          className={`group flex items-center gap-2.5 p-3 rounded-lg transition-all text-left ${activeTab === 'currency' ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                        >
                          <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="leading-none">
                            <span className="text-sm font-semibold text-slate-700 block">환율 계산기</span>
                            <span className="text-[10px] text-slate-400 leading-tight">실시간 환율 조회</span>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* 정보 메뉴 */}
                    {openDropdown === 'info' && (
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { tab: 'worldclock', route: '/worldclock', label: '세계 시간', desc: '주요 도시 현재 시각', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                          { tab: 'holidays', route: '/holidays', label: '세계 공휴일', desc: '국가별 공휴일 정보', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
                          { tab: 'incoterms', route: '/incoterms', label: '인코텀즈', desc: '무역 조건 가이드', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
                          { tab: 'regulations', route: '/regulations', label: '수입 규제', desc: '품목별 규제 확인', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> },
                          { tab: 'fssc', route: '/fssc', label: 'FS/SC 조회', desc: '유류할증료/보안료', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> },
                        ].map(item => (
                          <button
                            key={item.tab}
                            onClick={() => { setActiveTab(item.tab as any); navigate(item.route); setMegaMenuOpen(false); setOpenDropdown(null); }}
                            className={`group flex items-center gap-2.5 p-3 rounded-lg transition-all text-left ${activeTab === item.tab ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                          >
                            <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                            <div className="leading-none">
                              <span className="text-sm font-semibold text-slate-700 block">{item.label}</span>
                              <span className="text-[10px] text-slate-400 leading-tight">{item.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 하단 요청 섹션 */}
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Need more features?</p>
                          <p className="text-xs text-slate-400 mt-0.5">Let us know what you need</p>
                        </div>
                        <button
                          onClick={() => { setMegaMenuOpen(false); setOpenDropdown(null); setIsFeedbackModalOpen(true); }}
                          className="px-5 py-2 text-sm font-semibold text-slate-800 bg-white shadow-[0_1px_8px_-2px_rgba(0,0,0,0.1)] rounded-full hover:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.15)] transition-all"
                        >
                          Request
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mega Menu Overlay */}
        {megaMenuOpen && (
          <div
            className="hidden md:block fixed inset-0 z-40"
            onClick={() => { setMegaMenuOpen(false); setOpenDropdown(null); }}
          />
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="메뉴"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col p-3 space-y-1">
              {/* HOME */}
              <button
                onClick={() => {
                  setActiveTab('home');
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-3 rounded-lg font-bold transition-all ${
                  activeTab === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                HOME
              </button>

              {/* 시뮬레이터 Accordion */}
              <div className="rounded-lg overflow-hidden">
                <button
                  onClick={() => setMobileAccordion(mobileAccordion === 'simulator' ? null : 'simulator')}
                  className={`w-full text-left px-4 py-3 font-bold transition-all flex items-center justify-between ${
                    activeTab === 'container' || activeTab === 'pallet' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  시뮬레이터
                  <svg className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === 'simulator' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileAccordion === 'simulator' && (
                  <div className="bg-white py-2 px-2 space-y-1">
                    <button
                      onClick={() => { setActiveTab('container'); navigate('/container'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'container' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">3D 컨테이너</span>
                        <span className="text-[10px] text-slate-400 leading-tight">컨테이너 적재 시뮬레이션</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('pallet'); navigate('/pallet'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'pallet' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">3D 팔레트</span>
                        <span className="text-[10px] text-slate-400 leading-tight">팔레트 적재 시뮬레이션</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 화물추적 Accordion */}
              <div className="rounded-lg overflow-hidden">
                <button
                  onClick={() => setMobileAccordion(mobileAccordion === 'tracker' ? null : 'tracker')}
                  className={`w-full text-left px-4 py-3 font-bold transition-all flex items-center justify-between ${
                    activeTab === 'tracker' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  화물추적
                  <svg className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === 'tracker' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileAccordion === 'tracker' && (
                  <div className="bg-white py-2 px-2 space-y-1">
                    <button
                      onClick={() => { setActiveTab('tracker'); setTrackerCategory('container'); navigate('/tracker'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'tracker' && trackerCategory === 'container' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">컨테이너</span>
                        <span className="text-[10px] text-slate-400 leading-tight">해상 컨테이너 추적</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('tracker'); setTrackerCategory('air'); navigate('/tracker/air'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'tracker' && trackerCategory === 'air' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">항공 화물</span>
                        <span className="text-[10px] text-slate-400 leading-tight">AWB 번호로 추적</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('tracker'); setTrackerCategory('courier'); navigate('/tracker/courier'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'tracker' && trackerCategory === 'courier' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">택배/특송</span>
                        <span className="text-[10px] text-slate-400 leading-tight">DHL, FedEx, UPS 등</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('tracker'); setTrackerCategory('post'); navigate('/tracker/post'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'tracker' && trackerCategory === 'post' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">우편/EMS</span>
                        <span className="text-[10px] text-slate-400 leading-tight">국제 우편물 추적</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('tracker'); setTrackerCategory('rail'); navigate('/tracker/rail'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'tracker' && trackerCategory === 'rail' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h6m-6 0l6-6" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">철도</span>
                        <span className="text-[10px] text-slate-400 leading-tight">철도 화물 추적</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 계산기 Accordion */}
              <div className="rounded-lg overflow-hidden">
                <button
                  onClick={() => setMobileAccordion(mobileAccordion === 'calculator' ? null : 'calculator')}
                  className={`w-full text-left px-4 py-3 font-bold transition-all flex items-center justify-between ${
                    activeTab === 'cbm' || activeTab === 'currency' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  계산기
                  <svg className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === 'calculator' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileAccordion === 'calculator' && (
                  <div className="bg-white py-2 px-2 space-y-1">
                    <button
                      onClick={() => { setActiveTab('cbm'); navigate('/cbm'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'cbm' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">CBM 계산기</span>
                        <span className="text-[10px] text-slate-400 leading-tight">부피/중량 계산</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('currency'); navigate('/currency'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'currency' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">환율 계산기</span>
                        <span className="text-[10px] text-slate-400 leading-tight">실시간 환율 조회</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 정보 Accordion */}
              <div className="rounded-lg overflow-hidden">
                <button
                  onClick={() => setMobileAccordion(mobileAccordion === 'info' ? null : 'info')}
                  className={`w-full text-left px-4 py-3 font-bold transition-all flex items-center justify-between ${
                    activeTab === 'incoterms' || activeTab === 'holidays' || activeTab === 'regulations' || activeTab === 'fssc' || activeTab === 'worldclock' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  수/출입 정보
                  <svg className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === 'info' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileAccordion === 'info' && (
                  <div className="bg-white py-2 px-2 space-y-1">
                    <button
                      onClick={() => { setActiveTab('worldclock'); navigate('/worldclock'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'worldclock' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">세계 시간</span>
                        <span className="text-[10px] text-slate-400 leading-tight">주요 도시 현재 시각</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('holidays'); navigate('/holidays'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'holidays' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">세계 공휴일</span>
                        <span className="text-[10px] text-slate-400 leading-tight">국가별 공휴일 정보</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('incoterms'); navigate('/incoterms'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'incoterms' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">인코텀즈</span>
                        <span className="text-[10px] text-slate-400 leading-tight">무역 조건 가이드</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('regulations'); navigate('/regulations'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'regulations' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">수입 규제</span>
                        <span className="text-[10px] text-slate-400 leading-tight">품목별 규제 확인</span>
                      </div>
                    </button>
                    <button
                      onClick={() => { setActiveTab('fssc'); navigate('/fssc'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                        activeTab === 'fssc' ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-6 h-6 text-blue-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div className="leading-none">
                        <span className="text-sm font-semibold text-slate-700 block">FS/SC 조회</span>
                        <span className="text-[10px] text-slate-400 leading-tight">유류할증료/보안료</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 하단 요청 섹션 */}
              <div className="mt-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between px-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Need more features?</p>
                    <p className="text-xs text-slate-400 mt-0.5">Let us know what you need</p>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); setIsFeedbackModalOpen(true); }}
                    className="px-4 py-2 text-sm font-semibold text-slate-800 bg-white shadow-[0_1px_8px_-2px_rgba(0,0,0,0.1)] rounded-full hover:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.15)] transition-all"
                  >
                    Request
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Content Injection */}
      <Suspense fallback={<LoadingFallback />}>
      {activeTab === 'home' ? (
        <LandingPage
          onStart={() => setShowSelectionModal(true)}
          onPrivacy={() => setActiveTab('privacy')}
          onTerms={() => setActiveTab('terms')}
          onNavigateToInsights={handleNavigateToInsights}
          onNavigateToInsight={handleNavigateToInsight}
          onNavigateToContainer={() => { setActiveTab('container'); navigate('/container'); }}
          onNavigateToPallet={() => { setActiveTab('pallet'); navigate('/pallet'); }}
          onNavigateToIncoterms={() => { setActiveTab('incoterms'); navigate('/incoterms'); }}
          onNavigateToHolidays={() => { setActiveTab('holidays'); navigate('/holidays'); }}
          onNavigateToCbm={() => { setActiveTab('cbm'); navigate('/cbm'); }}
          onNavigateToCurrency={() => { setActiveTab('currency'); navigate('/currency'); }}
          onNavigateToRegulations={() => { setActiveTab('regulations'); navigate('/regulations'); }}
          onNavigateToTracker={() => { setActiveTab('tracker'); setTrackerCategory('container'); navigate('/tracker'); }}
          onNavigateToFssc={() => { setActiveTab('fssc'); navigate('/fssc'); }}
          onNavigateToWorldClock={() => { setActiveTab('worldclock'); navigate('/worldclock'); }}
        />
      ) : activeTab === 'privacy' ? (
        <PrivacyPolicy />
      ) : activeTab === 'terms' ? (
        <TermsOfService />
      ) : activeTab === 'currency' ? (
        <CurrencyCalculator />
      ) : activeTab === 'incoterms' ? (
        <Incoterms />
      ) : activeTab === 'holidays' ? (
        <WorldHolidays />
      ) : activeTab === 'cbm' ? (
        <CbmCalculator />
      ) : activeTab === 'regulations' ? (
        <ImportRegulations />
      ) : activeTab === 'tracker' ? (
        <Tracker
          category={trackerCategory}
          onNavigate={(cat) => {
            const path = cat === 'container' ? '/tracker' : `/tracker/${cat}`;
            navigate(path);
          }}
        />
      ) : activeTab === 'fssc' ? (
        <FSSC onNavigateBack={() => { setActiveTab('home'); navigate('/'); }} />
      ) : activeTab === 'worldclock' ? (
        <WorldClock />
      ) : activeTab === 'pallet' ? (
        !isLargeScreen ? (
          // Show message for small screens on pallet tab
          <div className="flex-1 bg-slate-50 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <svg className="w-24 h-24 mx-auto mb-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h1 className="text-2xl font-bold text-slate-800 mb-3">PC 버전 전용</h1>
              <p className="text-base text-slate-600 mb-6">
                팔레트 시뮬레이터는 1024px 이상의 화면에서만 이용 가능합니다.
              </p>
              <p className="text-sm text-slate-500">
                더 큰 화면의 기기에서 접속해 주세요.
              </p>
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  현재 화면: {window.innerWidth}px
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PalletSimulator
            key="pallet-simulator"
            palletItems={palletItems}
            setPalletItems={setPalletItems}
            palletSize={palletSize}
            setPalletSize={setPalletSize}
          />
        )
      ) : (
        !isLargeScreen ? (
          // Show message for small screens on container tab
          <div className="flex-1 bg-slate-50 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <svg className="w-24 h-24 mx-auto mb-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h1 className="text-2xl font-bold text-slate-800 mb-3">PC 버전 전용</h1>
              <p className="text-base text-slate-600 mb-6">
                컨테이너 시뮬레이터는 1024px 이상의 화면에서만 이용 가능합니다.
              </p>
              <p className="text-sm text-slate-500">
                더 큰 화면의 기기에서 접속해 주세요.
              </p>
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  현재 화면: {window.innerWidth}px
                </div>
              </div>
            </div>
          </div>
        ) : (
        <main className="flex-1 p-6 mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden bg-slate-50/50" style={{ height: 'calc(100vh - 80px)' }}>

          {/* Main Visualizer Area */}
          <div className="lg:col-span-3 flex h-full gap-4 min-w-0">
              {/* Main Content */}
              <div className="flex-1 flex flex-col gap-4 min-w-0" style={{ height: 'calc(100vh - 135px)' }}>
              <div className="flex justify-between items-end px-2 shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" fill="white" opacity="0.9"/>
                      </svg>
                    </div>
                    <div className="space-y-1">
                       <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          Container Loading Simulator
                          <span className="px-2 py-0.5 text-[8px] bg-green-100 text-green-700 rounded-full font-bold">BETA</span>
                       </h2>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">3D Real-time Visualization</p>
                    </div>
                 </div>
                 <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto scrollbar-hide max-w-[60%]">
                  {(Object.keys(CONTAINER_SPECS) as ContainerType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setContainerType(type)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                        containerType === type 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulator Slot with Ad Space Below */}
              <div className="flex flex-col gap-4 h-full">
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200/50" style={{ height: 'calc(100vh - 310px)' }}>
                  <ContainerVisualizer
                      container={currentContainer}
                      packedItems={packedItems}
                      onItemMove={handleItemMove}
                      selectedGroupId={selectedGroupId}
                      onSelectGroup={handleSelectGroup}
                      isArranging={isArranging}
                    />
                    
                    {/* Floating UI - Adjusted border-radius */}
                    <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
                      <div className="bg-white/90 backdrop-blur-xl shadow-xl p-5 rounded-2xl border border-white flex flex-col gap-1 min-w-[180px]">
                          <span className="text-[9px] text-blue-700 uppercase font-black tracking-[0.2em] leading-none mb-1.5">Efficiency</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">
                              {stats.volumeEfficiency.toFixed(1)}
                            </span>
                            <span className="text-sm text-slate-300 font-black">%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${stats.volumeEfficiency > 90 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                              style={{ width: `${stats.volumeEfficiency}%` }}
                              />
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                            <p className="text-[10px] text-slate-500">
                              <span className="font-black text-slate-700">아이템:</span> {stats.totalItems}개
                            </p>
                            <p className="text-[10px] text-slate-500">
                              <span className="font-black text-slate-700">그룹:</span> {stats.totalGroups}개
                            </p>
                          </div>
                      </div>
                    </div>
                </div>

              </div>
              </div>
          </div>

          {/* Sidebar Controls */}
          <div className="lg:col-span-1 overflow-hidden" style={{ height: 'calc(100vh - 135px)' }}>
            <CargoControls
              onAddCargo={handleAddCargo}
              cargoList={cargoList}
              onRemoveCargo={handleRemoveCargo}
              onClear={handleClearCargo}
              onRotateCargo={handleRotateCargo}
              onAutoArrange={handleAutoArrange}
              selectedGroupId={selectedGroupId}
              onSelectGroup={handleSelectGroup}
              isArranging={isArranging}
              packingMode={globalPackingMode}
              onPackingModeChange={setGlobalPackingMode}
            />
          </div>

        </main>
        )
      )}
      </Suspense>
      </div>

      {/* Selection Modal */}
      <SelectionModal
        isOpen={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        onSelect={(type) => {
          if (type === 'container') {
            setActiveTab('container');
            navigate('/container');
          } else {
            setActiveTab('pallet');
            navigate('/pallet');
          }
          setShowSelectionModal(false);
        }}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </>
  );
};

export default App;

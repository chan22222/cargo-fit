import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../../lib/supabase';
import { FSSCRecord, FSSCFormData, FSSCType, CurrencyType, AIRLINE_CODES, CHARGE_CODES } from '../../types/fssc';
import { getTodayString, getLocalDateString, getOffsetDateString } from '../../lib/date';

interface FSSCAdminProps {
  embedded?: boolean;
}

const FSSCAdmin: React.FC<FSSCAdminProps> = ({ embedded = false }) => {
  const [records, setRecords] = useState<FSSCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FSSCRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // 동기화 관련
  const [syncDate, setSyncDate] = useState(() => getTodayString());
  const [isSyncing, setIsSyncing] = useState(false);

  // 엑셀 업로드 관련
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'merge' | 'replace'>('merge');
  const [parsedData, setParsedData] = useState<FSSCFormData[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 폼 데이터
  const [formData, setFormData] = useState<FSSCFormData>({
    type: 'FS',
    carrier_code: '',
    carrier_name: '',
    start_date: getTodayString(),
    end_date: getOffsetDateString(30),
    currency: 'KRW',
    min_charge: null,
    over_charge: null,
    route: '',
    remark: '',
    charge_code: 'FSC'
  });

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await db.fssc.getAll();
      if (fetchError) throw new Error(fetchError.message);
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 외부 데이터 동기화 (강제 모드)
  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const { data, error } = await db.fssc.fetchFromExternal(syncDate, true); // force: true
      if (error) {
        alert('동기화 실패: ' + (error.message || '알 수 없는 오류'));
      } else if (data?.count > 0) {
        alert(`동기화 완료: ${data.count}건`);
        loadData();
      } else {
        alert('해당 날짜의 데이터가 없습니다.');
      }
    } catch (e) {
      alert('동기화 중 오류가 발생했습니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 날짜가 2050년 이후인지 확인 (기한 없음)
  const isNoExpiry = (dateStr: string) => {
    if (!dateStr) return false;
    const year = parseInt(dateStr.split('-')[0]);
    return year >= 2050;
  };

  // 날짜 표시 (2050년 이후는 "기한 없음", 형식: YY.MM.DD)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    if (isNoExpiry(dateStr)) return '기한 없음';
    const [year, month, day] = dateStr.split('-');
    return `${year.slice(-2)}.${month}.${day}`;
  };

  // 만료된 데이터 감지 (기한 없음 제외)
  const expiredRecords = useMemo(() => {
    const today = getTodayString();
    return records.filter(r => !isNoExpiry(r.end_date) && r.end_date < today);
  }, [records]);

  // 곧 만료될 데이터 (7일 이내, 기한 없음 제외)
  const expiringRecords = useMemo(() => {
    const todayStr = getTodayString();
    const weekLater = getOffsetDateString(7);
    return records.filter(r => !isNoExpiry(r.end_date) && r.end_date >= todayStr && r.end_date <= weekLater);
  }, [records]);

  // 엑셀 파일 파싱
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        // 헤더 찾기 (TYPE, 항공사 등이 있는 행)
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(5, jsonData.length); i++) {
          const row = jsonData[i];
          if (row && row.some((cell: any) =>
            String(cell).includes('TYPE') || String(cell).includes('항공사')
          )) {
            headerRowIndex = i;
            break;
          }
        }

        const headers = jsonData[headerRowIndex]?.map((h: any) => String(h).trim()) || [];
        const dataRows = jsonData.slice(headerRowIndex + 1);

        // 컬럼 인덱스 매핑
        const getColIndex = (names: string[]) => {
          return headers.findIndex((h: string) =>
            names.some(n => h.toLowerCase().includes(n.toLowerCase()))
          );
        };

        const typeIdx = getColIndex(['TYPE', '타입']);
        const carrierIdx = getColIndex(['항공사', 'CARRIER', 'AIR']);
        const startIdx = getColIndex(['적용시작', 'START', '시작']);
        const endIdx = getColIndex(['적용종료', 'END', '종료']);
        const currencyIdx = getColIndex(['화폐', 'CURRENCY', 'CUR']);
        const minIdx = getColIndex(['MIN', '최소']);
        const overIdx = getColIndex(['OVER', '초과', 'KG']);
        const routeIdx = getColIndex(['적용대상', 'ROUTE', '노선', '대상']);
        const remarkIdx = getColIndex(['REMARK', '비고', '참고']);
        const codeIdx = getColIndex(['CODE', '코드']);

        const parsed: FSSCFormData[] = [];

        dataRows.forEach((row: any[]) => {
          if (!row || row.length === 0) return;

          const type = String(row[typeIdx] || 'FS').trim().toUpperCase();
          const carrier = String(row[carrierIdx] || '').trim().toUpperCase();
          const route = String(row[routeIdx] || '').trim();

          if (!carrier || !route) return; // 필수 필드 없으면 스킵

          // 날짜 파싱 (엑셀 시리얼 넘버 또는 문자열)
          const parseDate = (val: any): string => {
            if (!val) return getTodayString();
            if (typeof val === 'number') {
              // 엑셀 시리얼 넘버
              const date = new Date((val - 25569) * 86400 * 1000);
              return getLocalDateString(date);
            }
            let str = String(val).trim();
            // 슬래시를 하이픈으로 변환
            str = str.replace(/\//g, '-');

            // YYYY-MM-DD 형식 체크
            const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (match) {
              const [, year, month, day] = match;
              // 유효하지 않은 월/일 보정 (예: 9999-99-99 → 9999-01-01)
              const validMonth = parseInt(month) > 12 || parseInt(month) < 1 ? '01' : month;
              const validDay = parseInt(day) > 31 || parseInt(day) < 1 ? '01' : day;
              return `${year}-${validMonth}-${validDay}`;
            }
            return getTodayString();
          };

          parsed.push({
            type: (type === 'FS' || type === 'SC' ? type : 'FS') as FSSCType,
            carrier_code: carrier,
            carrier_name: AIRLINE_CODES[carrier] || '',
            start_date: parseDate(row[startIdx]),
            end_date: parseDate(row[endIdx]),
            currency: (String(row[currencyIdx] || 'KRW').trim().toUpperCase() || 'KRW') as CurrencyType,
            min_charge: row[minIdx] ? Number(row[minIdx]) : null,
            over_charge: row[overIdx] ? Number(row[overIdx]) : null,
            route: route,
            remark: String(row[remarkIdx] || '').trim(),
            charge_code: String(row[codeIdx] || 'FSC').trim().toUpperCase()
          });
        });

        setParsedData(parsed);
        setShowUploadModal(true);
      } catch (err) {
        alert('엑셀 파일 파싱 중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 파싱된 데이터 DB에 저장
  const handleUploadConfirm = async () => {
    if (parsedData.length === 0) return;

    setUploading(true);
    try {
      if (uploadMode === 'replace') {
        // 기존 데이터 전체 삭제 후 새로 추가
        const allIds = records.map(r => r.id);
        if (allIds.length > 0) {
          await db.fssc.deleteMany(allIds);
        }
      }

      // 새 데이터 추가
      const { error } = await db.fssc.bulkCreate(parsedData);
      if (error) throw new Error(error.message);

      alert(`${parsedData.length}개의 데이터가 ${uploadMode === 'replace' ? '교체' : '추가'}되었습니다.`);
      setShowUploadModal(false);
      setParsedData([]);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      type: 'FS',
      carrier_code: '',
      carrier_name: '',
      start_date: getTodayString(),
      end_date: getOffsetDateString(30),
      currency: 'KRW',
      min_charge: null,
      over_charge: null,
      route: '',
      remark: '',
      charge_code: 'FSC'
    });
    setCarrierSearch('');
    setEditingRecord(null);
    setShowForm(false);
  };

  // 폼 열기 (수정)
  const openEditForm = (record: FSSCRecord) => {
    setEditingRecord(record);
    setCarrierSearch(record.carrier_code);
    setFormData({
      type: record.type,
      carrier_code: record.carrier_code,
      carrier_name: record.carrier_name || '',
      start_date: record.start_date,
      end_date: record.end_date,
      currency: record.currency,
      min_charge: record.min_charge ?? null,
      over_charge: record.over_charge ?? null,
      route: record.route,
      remark: record.remark || '',
      charge_code: record.charge_code
    });
    setShowForm(true);
  };

  // 저장
  const handleSave = async () => {
    if (!formData.carrier_code || !formData.route) {
      alert('항공사 코드와 적용대상은 필수입니다.');
      return;
    }

    try {
      if (editingRecord) {
        const { error } = await db.fssc.update(editingRecord.id, formData);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await db.fssc.create(formData);
        if (error) throw new Error(error.message);
      }
      resetForm();
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    }
  };

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const { error } = await db.fssc.delete(id);
      if (error) throw new Error(error.message);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  // 선택 삭제
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 항목을 선택하세요.');
      return;
    }
    if (!confirm(`${selectedIds.length}개 항목을 삭제하시겠습니까?`)) return;
    try {
      const { error } = await db.fssc.deleteMany(selectedIds);
      if (error) throw new Error(error.message);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  // 체크박스 토글
  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 전체 선택
  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r.id));
    }
  };

  // 항공사 자동완성
  const [carrierSearch, setCarrierSearch] = useState('');
  const [showCarrierSuggestions, setShowCarrierSuggestions] = useState(false);

  const carrierSuggestions = useMemo(() => {
    if (!carrierSearch.trim()) return [];
    const query = carrierSearch.toLowerCase();
    return Object.entries(AIRLINE_CODES)
      .filter(([code, name]) =>
        code.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [carrierSearch]);

  // 항공사 코드 입력 시 자동 이름 설정
  const handleCarrierCodeChange = (code: string) => {
    const upperCode = code.toUpperCase();
    setCarrierSearch(upperCode);
    setFormData({
      ...formData,
      carrier_code: upperCode,
      carrier_name: AIRLINE_CODES[upperCode] || formData.carrier_name
    });
    setShowCarrierSuggestions(true);
  };

  // 항공사 선택
  const selectCarrierSuggestion = (code: string, name: string) => {
    setCarrierSearch(code);
    setFormData({
      ...formData,
      carrier_code: code,
      carrier_name: name
    });
    setShowCarrierSuggestions(false);
  };

  const containerClass = embedded
    ? ""
    : "min-h-screen bg-slate-50 p-6";

  return (
    <div className={containerClass}>
      <div className={embedded ? "" : "max-w-7xl mx-auto"}>
        {/* 통계 */}
        <div className="mb-6 grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 font-semibold">전체</p>
            <p className="text-2xl font-bold text-gray-900">{records.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-blue-500 font-semibold">FSC</p>
            <p className="text-2xl font-bold text-blue-600">{records.filter(r => r.type === 'FS').length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-green-500 font-semibold">SCC</p>
            <p className="text-2xl font-bold text-green-600">{records.filter(r => r.type === 'SC').length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-red-500 font-semibold">만료됨</p>
            <p className="text-2xl font-bold text-red-600">{expiredRecords.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-yellow-500 font-semibold">곧 만료</p>
            <p className="text-2xl font-bold text-yellow-600">{expiringRecords.length}</p>
          </div>
        </div>

        {/* 동기화 위젯 */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium text-gray-900">데이터 동기화</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={syncDate}
                onChange={(e) => setSyncDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    동기화 중...
                  </>
                ) : (
                  '데이터 가져오기'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">FS/SC 데이터 관리</h2>
            <p className="text-sm text-gray-500">유류할증료 및 보안료 데이터를 관리합니다.</p>
          </div>
          <div className="flex gap-2">
            {/* 숨겨진 파일 입력 */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            {/* 엑셀 업로드 버튼 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              엑셀 업로드
            </button>
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                선택 삭제 ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 데이터 추가
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 폼 모달 */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingRecord ? 'FS/SC 데이터 수정' : '새 FS/SC 데이터 추가'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* TYPE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TYPE *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as FSSCType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="FS">FS (유류할증료)</option>
                      <option value="SC">SC (보안료)</option>
                    </select>
                  </div>

                  {/* 항공사 코드 */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">항공사 (코드/이름) *</label>
                    <input
                      type="text"
                      value={carrierSearch || formData.carrier_code}
                      onChange={(e) => handleCarrierCodeChange(e.target.value)}
                      onFocus={() => setShowCarrierSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCarrierSuggestions(false), 200)}
                      placeholder="KE, Korean Air..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {/* 자동완성 드롭다운 */}
                    {showCarrierSuggestions && carrierSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        {carrierSuggestions.map(([code, name]) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => selectCarrierSuggestion(code, name)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                          >
                            <span className="font-bold text-blue-600 w-8">{code}</span>
                            <span className="text-gray-600 truncate">{name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 항공사 이름 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">항공사 이름</label>
                    <input
                      type="text"
                      value={formData.carrier_name || ''}
                      onChange={(e) => setFormData({ ...formData, carrier_name: e.target.value })}
                      placeholder="예: Korean Air"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 화폐 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">화폐 *</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value as CurrencyType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="KRW">KRW</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="JPY">JPY</option>
                      <option value="CNY">CNY</option>
                    </select>
                  </div>

                  {/* 적용시작일 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">적용시작일 *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 적용종료일 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">적용종료일 *</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* MIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MIN 금액</label>
                    <input
                      type="number"
                      value={formData.min_charge ?? ''}
                      onChange={(e) => setFormData({ ...formData, min_charge: e.target.value ? Number(e.target.value) : null })}
                      placeholder="최소 금액"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* OVER */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OVER 금액 (kg당)</label>
                    <input
                      type="number"
                      value={formData.over_charge ?? ''}
                      onChange={(e) => setFormData({ ...formData, over_charge: e.target.value ? Number(e.target.value) : null })}
                      placeholder="kg당 금액"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* CODE */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">CODE *</label>
                    <div className="flex gap-2">
                      <select
                        value={Object.keys(CHARGE_CODES).includes(formData.charge_code) ? formData.charge_code : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            setFormData({ ...formData, charge_code: e.target.value });
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- 선택 또는 직접 입력 --</option>
                        {Object.entries(CHARGE_CODES).map(([code, desc]) => (
                          <option key={code} value={code}>{code} - {desc}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={formData.charge_code}
                        onChange={(e) => setFormData({ ...formData, charge_code: e.target.value.toUpperCase() })}
                        placeholder="직접 입력"
                        maxLength={10}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* 적용대상 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">적용대상 *</label>
                  <input
                    type="text"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    placeholder="예: 한국발 국제선 전노선"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* REMARK */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">비고</label>
                  <textarea
                    value={formData.remark || ''}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                    placeholder="추가 설명"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 데이터 테이블 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">등록된 데이터가 없습니다.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                첫 데이터 추가하기
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-2 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === records.length && records.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700 text-xs">TYPE</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700 text-xs">항공사</th>
                    <th className="px-2 py-2 text-center font-semibold text-gray-700 text-xs">적용기간</th>
                    <th className="px-2 py-2 text-center font-semibold text-gray-700 text-xs hidden md:table-cell">화폐</th>
                    <th className="px-2 py-2 text-right font-semibold text-gray-700 text-xs">OVER</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-700 text-xs hidden sm:table-cell">적용대상</th>
                    <th className="px-2 py-2 text-center font-semibold text-gray-700 text-xs">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 text-xs">
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(record.id)}
                          onChange={() => toggleSelect(record.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          record.type === 'FS' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-2 py-2 max-w-[90px]" title={record.carrier_name || AIRLINE_CODES[record.carrier_code] || ''}>
                        <span className="font-medium">{record.carrier_code}</span>
                        <span className="text-gray-400 text-[10px] block truncate">
                          {record.carrier_name || AIRLINE_CODES[record.carrier_code] || ''}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center text-gray-600">
                        {formatDate(record.start_date)}~{isNoExpiry(record.end_date) ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                            기한없음
                          </span>
                        ) : formatDate(record.end_date)}
                      </td>
                      <td className="px-2 py-2 text-center text-gray-500 hidden md:table-cell">{record.currency}</td>
                      <td className="px-2 py-2 text-right font-medium">
                        {record.over_charge?.toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate max-w-[180px] hidden sm:table-cell" title={record.route}>{record.route}</td>
                      <td className="px-2 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditForm(record)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="수정"
                          >
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                            title="삭제"
                          >
                            <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 페이지네이션 */}
          {records.length > itemsPerPage && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                총 {records.length}건 중 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, records.length)}건
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {Math.ceil(records.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(records.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(records.length / itemsPerPage)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>


        {/* 엑셀 업로드 확인 모달 */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">엑셀 데이터 업로드</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {parsedData.length}개의 데이터가 파싱되었습니다.
                </p>
              </div>

              {/* 업로드 모드 선택 */}
              <div className="p-6 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">업로드 방식 선택</p>
                <div className="flex gap-4">
                  <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    uploadMode === 'merge' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="uploadMode"
                      value="merge"
                      checked={uploadMode === 'merge'}
                      onChange={() => setUploadMode('merge')}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        uploadMode === 'merge' ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {uploadMode === 'merge' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">추가 (Merge)</p>
                        <p className="text-xs text-gray-500">기존 데이터 유지 + 새 데이터 추가</p>
                      </div>
                    </div>
                  </label>
                  <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    uploadMode === 'replace' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="uploadMode"
                      value="replace"
                      checked={uploadMode === 'replace'}
                      onChange={() => setUploadMode('replace')}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        uploadMode === 'replace' ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        {uploadMode === 'replace' && <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">교체 (Replace)</p>
                        <p className="text-xs text-gray-500">기존 데이터 삭제 후 새 데이터로 대체</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 미리보기 */}
              <div className="flex-1 overflow-auto p-6">
                <p className="text-sm font-medium text-gray-700 mb-3">데이터 미리보기 (상위 10개)</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-2 text-left">TYPE</th>
                        <th className="px-2 py-2 text-left">항공사</th>
                        <th className="px-2 py-2 text-center">시작일</th>
                        <th className="px-2 py-2 text-center">종료일</th>
                        <th className="px-2 py-2 text-right">OVER</th>
                        <th className="px-2 py-2 text-left">적용대상</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedData.slice(0, 10).map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              item.type === 'FS' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>{item.type}</span>
                          </td>
                          <td className="px-2 py-2 font-medium">{item.carrier_code}</td>
                          <td className="px-2 py-2 text-center text-gray-600">{formatDate(item.start_date)}</td>
                          <td className="px-2 py-2 text-center text-gray-600">
                            {isNoExpiry(item.end_date) ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                                기한없음
                              </span>
                            ) : formatDate(item.end_date)}
                          </td>
                          <td className="px-2 py-2 text-right">{item.over_charge?.toLocaleString()}</td>
                          <td className="px-2 py-2 text-gray-600 truncate max-w-[200px]">{item.route}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.length > 10 && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      ... 외 {parsedData.length - 10}개 더 있음
                    </p>
                  )}
                </div>
              </div>

              {/* 버튼 */}
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => { setShowUploadModal(false); setParsedData([]); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={uploading}
                >
                  취소
                </button>
                <button
                  onClick={handleUploadConfirm}
                  disabled={uploading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                    uploadMode === 'replace'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {uploading ? '업로드 중...' : `${parsedData.length}개 ${uploadMode === 'replace' ? '교체' : '추가'}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FSSCAdmin;

import React from 'react';
import { Carrier } from './types';
import { TrainIcon } from './icons';
import CarrierGrid from './CarrierGrid';

// 철도화물 데이터
const railCarriers: Carrier[] = [
  // 한국
  { name: 'KORAIL 화물 (코레일)', code: 'KORAIL', trackingUrl: 'https://logis.korail.go.kr/index.do', category: 'rail', region: 'Korea', isMajor: true },
  { name: '한국철도공사 물류', code: 'KRLG', trackingUrl: 'https://www.koraillogis.com/', category: 'rail', region: 'Korea' },
  // 중국-유럽 철도 (China-Europe Railway Express)
  { name: 'CR Express (中欧班列)', code: 'CRE', trackingUrl: 'https://www.crexpress.com/en/trackQuery.html', category: 'rail', region: 'China', isMajor: true },
  { name: 'China Railway (中国铁路)', code: 'CRCC', trackingUrl: 'https://www.12306.cn/', category: 'rail', region: 'China', isMajor: true },
  { name: 'CRCT (中铁集装箱)', code: 'CRCT', trackingUrl: 'https://www.crct.com/', category: 'rail', region: 'China' },
  { name: 'Sinotrans Rail', code: 'SNTR', trackingUrl: 'https://www.sinotrans.com/', category: 'rail', region: 'China' },
  { name: 'CELO (China-Europe Logistics)', code: 'CELO', trackingUrl: 'https://www.celog.com.cn/', category: 'rail', region: 'China' },
  // 러시아/CIS
  { name: 'Russian Railways (RZD)', code: 'RZD', trackingUrl: 'https://www.rzd.ru/en/', category: 'rail', region: 'Russia', isMajor: true },
  { name: 'Trans-Siberian Railway', code: 'TSR', trackingUrl: 'https://www.rzd.ru/en/', category: 'rail', region: 'Russia', isMajor: true },
  { name: 'TransContainer (Russia)', code: 'TRCU', trackingUrl: 'https://www.trcont.com/en/', category: 'rail', region: 'Russia' },
  { name: 'FESCO Rail', code: 'FSCR', trackingUrl: 'https://www.fesco.ru/en/', category: 'rail', region: 'Russia' },
  { name: 'UTLC ERA (Eurasian Rail)', code: 'UTLC', trackingUrl: 'https://www.utlc.com/', category: 'rail', region: 'Russia' },
  { name: 'Kazakhstan Railways (KTZ)', code: 'KTZ', trackingUrl: 'https://www.railways.kz/', category: 'rail', region: 'Kazakhstan' },
  { name: 'KTZ Express', code: 'KTZE', trackingUrl: 'https://www.ktzexpress.kz/', category: 'rail', region: 'Kazakhstan' },
  { name: 'Belarus Railway (BCH)', code: 'BCH', trackingUrl: 'https://www.rw.by/', category: 'rail', region: 'Belarus' },
  { name: 'Ukraine Railways (UZ)', code: 'UZ', trackingUrl: 'https://www.uz.gov.ua/', category: 'rail', region: 'Ukraine' },
  // 유럽
  { name: 'DB Cargo (Deutsche Bahn)', code: 'DBCG', trackingUrl: 'https://www.dbcargo.com/rail-de-en/tracking', category: 'rail', region: 'Europe', isMajor: true },
  { name: 'DB Schenker Rail', code: 'DBSR', trackingUrl: 'https://www.dbschenker.com/', category: 'rail', region: 'Europe' },
  { name: 'SNCF Fret (France)', code: 'SNCF', trackingUrl: 'https://www.sncf.com/fr/groupe/fret', category: 'rail', region: 'Europe' },
  { name: 'Trenitalia Cargo (Italy)', code: 'TRNT', trackingUrl: 'https://www.trenitalia.com/', category: 'rail', region: 'Europe' },
  { name: 'PKP Cargo (Poland)', code: 'PKPC', trackingUrl: 'https://www.pkpcargo.com/', category: 'rail', region: 'Europe' },
  { name: 'Rail Cargo Austria', code: 'RCA', trackingUrl: 'https://www.railcargo.com/', category: 'rail', region: 'Europe' },
  { name: 'SBB Cargo (Switzerland)', code: 'SBBC', trackingUrl: 'https://www.sbbcargo.com/', category: 'rail', region: 'Europe' },
  { name: 'Hupac Intermodal', code: 'HPAC', trackingUrl: 'https://www.hupac.com/', category: 'rail', region: 'Europe' },
  { name: 'Kombiverkehr (Germany)', code: 'KMBV', trackingUrl: 'https://www.kombiverkehr.de/', category: 'rail', region: 'Europe' },
  { name: 'Metrans (Czech)', code: 'MTRS', trackingUrl: 'https://www.metrans.eu/', category: 'rail', region: 'Europe' },
  { name: 'CD Cargo (Czech)', code: 'CDCG', trackingUrl: 'https://www.cdcargo.cz/', category: 'rail', region: 'Europe' },
  { name: 'GySEV Cargo (Hungary)', code: 'GYSV', trackingUrl: 'https://www.gysev.hu/', category: 'rail', region: 'Europe' },
  { name: 'BLS Cargo (Switzerland)', code: 'BLSC', trackingUrl: 'https://www.blscargo.ch/', category: 'rail', region: 'Europe' },
  { name: 'TX Logistik (Europe)', code: 'TXLG', trackingUrl: 'https://www.txlogistik.eu/', category: 'rail', region: 'Europe' },
  { name: 'Lineas (Belgium)', code: 'LNEA', trackingUrl: 'https://www.lineas.net/', category: 'rail', region: 'Europe' },
  { name: 'Green Cargo (Sweden)', code: 'GRCG', trackingUrl: 'https://www.greencargo.com/', category: 'rail', region: 'Europe' },
  { name: 'VTG Rail Europe', code: 'VTGR', trackingUrl: 'https://www.vtg.com/', category: 'rail', region: 'Europe' },
  // 북미
  { name: 'BNSF Railway (USA)', code: 'BNSF', trackingUrl: 'https://www.bnsf.com/ship-with-bnsf/ways-of-shipping/intermodal/', category: 'rail', region: 'Americas', isMajor: true },
  { name: 'Union Pacific (USA)', code: 'UP', trackingUrl: 'https://www.up.com/customers/track-record/', category: 'rail', region: 'Americas', isMajor: true },
  { name: 'CSX Transportation (USA)', code: 'CSX', trackingUrl: 'https://www.csx.com/', category: 'rail', region: 'Americas' },
  { name: 'Norfolk Southern (USA)', code: 'NS', trackingUrl: 'https://www.nscorp.com/', category: 'rail', region: 'Americas' },
  { name: 'Canadian National (CN)', code: 'CN', trackingUrl: 'https://www.cn.ca/', category: 'rail', region: 'Americas', isMajor: true },
  { name: 'Canadian Pacific (CPKC)', code: 'CPKC', trackingUrl: 'https://www.cpkcr.com/', category: 'rail', region: 'Americas' },
  { name: 'Kansas City Southern', code: 'KCS', trackingUrl: 'https://www.kcsouthern.com/', category: 'rail', region: 'Americas' },
  { name: 'Ferromex (Mexico)', code: 'FXMX', trackingUrl: 'https://www.ferromex.com.mx/', category: 'rail', region: 'Americas' },
  // 아시아/오세아니아
  { name: 'JR Freight (Japan)', code: 'JRFT', trackingUrl: 'https://www.jrfreight.co.jp/', category: 'rail', region: 'Asia', isMajor: true },
  { name: 'Indian Railways (CONCOR)', code: 'CONC', trackingUrl: 'https://www.concorindia.co.in/', category: 'rail', region: 'Asia' },
  { name: 'Aurizon (Australia)', code: 'AURZ', trackingUrl: 'https://www.aurizon.com.au/', category: 'rail', region: 'Oceania' },
  { name: 'Pacific National (Australia)', code: 'PACN', trackingUrl: 'https://www.pacificnational.com.au/', category: 'rail', region: 'Oceania' },
  { name: 'KiwiRail (New Zealand)', code: 'KIWI', trackingUrl: 'https://www.kiwirail.co.nz/', category: 'rail', region: 'Oceania' },
  { name: 'Transnet Freight (South Africa)', code: 'TRNT', trackingUrl: 'https://www.transnetfreightrail.net/', category: 'rail', region: 'Africa' },
];

interface TrackerRailProps {
  adSlot?: React.ReactNode;
}

const TrackerRail: React.FC<TrackerRailProps> = ({ adSlot }) => {
  return (
    <div className="space-y-4">
      {/* Ad Slot - 상단 */}
      {adSlot && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {adSlot}
        </div>
      )}

      <CarrierGrid
        carriers={railCarriers}
        title="철도화물"
        subtitle={`전세계 ${railCarriers.length}개+ 철도운송사 추적`}
        icon={<TrainIcon className="w-5 h-5 text-white" />}
        iconBgClass="bg-gradient-to-br from-slate-500 to-slate-600"
      />
    </div>
  );
};

export default TrackerRail;
export { railCarriers };

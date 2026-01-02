import React, { useState, useMemo } from 'react';
import { Carrier } from './types';
import { PlaneIcon, SearchIcon } from './icons';

// AWB Prefix Code 매핑 (3자리 IATA 항공사 숫자 코드)
const awbPrefixMap: Record<string, string> = {
  // 한국 항공사
  '180': 'KE',   // Korean Air
  '988': 'OZ',   // Asiana Airlines
  '991': 'LJ',   // Jin Air
  '992': '7C',   // Jeju Air
  '993': 'TW',   // T'way Air
  '994': 'YP',   // Air Premia
  // 미국 항공사
  '001': 'AA',   // American Airlines
  '006': 'DL',   // Delta Air Lines
  '016': 'UA',   // United Airlines
  '027': 'AS',   // Alaska Airlines
  '023': 'FX',   // FedEx
  '406': '5X',   // UPS Airlines
  '526': 'WN',   // Southwest Airlines
  // 유럽 항공사
  '020': 'LH',   // Lufthansa
  '057': 'AF',   // Air France
  '074': 'KL',   // KLM (AF-KL-MP uses AF code)
  '114': 'BA',   // British Airways (IAG)
  '235': 'TK',   // Turkish Airlines
  '047': 'AY',   // Finnair
  '053': 'SK',   // SAS
  '082': 'LO',   // LOT Polish Airlines
  '724': 'LX',   // Swiss International
  '172': 'CV',   // Cargolux
  // 아시아 항공사
  '131': 'JL',   // Japan Airlines
  '205': 'NH',   // All Nippon Airways (ANA)
  '138': 'KZ',   // Nippon Cargo Airlines
  '160': 'CX',   // Cathay Pacific
  '695': 'CI',   // China Airlines
  '695': 'BR',   // EVA Air (shares with CI sometimes)
  '618': 'SQ',   // Singapore Airlines
  '784': 'CA',   // Air China
  '297': 'CZ',   // China Southern
  '112': 'MU',   // China Eastern
  '999': 'CK',   // China Cargo Airlines
  '098': 'HU',   // Hainan Airlines
  '217': 'TG',   // Thai Airways
  '232': 'MH',   // Malaysia Airlines
  '126': 'GA',   // Garuda Indonesia
  '079': 'PR',   // Philippine Airlines
  '738': 'VN',   // Vietnam Airlines
  '851': 'AI',   // Air India
  '086': 'PK',   // Pakistan International
  // 중동 항공사
  '176': 'EK',   // Emirates
  '607': 'EY',   // Etihad Airways
  '157': 'QR',   // Qatar Airways
  '065': 'SV',   // Saudia
  '229': 'GF',   // Gulf Air
  '096': 'WY',   // Oman Air
  '186': 'RJ',   // Royal Jordanian
  '604': 'ME',   // Middle East Airlines
  // 아프리카 항공사
  '071': 'ET',   // Ethiopian Airlines
  '077': 'KQ',   // Kenya Airways
  '083': 'SA',   // South African Airways
  // 오세아니아 항공사
  '081': 'QF',   // Qantas
  '086': 'NZ',   // Air New Zealand
  // 아메리카 항공사
  '014': 'AC',   // Air Canada
  '045': 'LA',   // LATAM Airlines
  '044': 'AV',   // Avianca
  '230': 'CM',   // Copa Airlines
  '139': 'AM',   // Aeromexico
};

// 역매핑: 항공사 코드 -> AWB Prefix
const codeToPrefix: Record<string, string> = Object.entries(awbPrefixMap).reduce((acc, [prefix, code]) => {
  acc[code] = prefix;
  return acc;
}, {} as Record<string, string>);

// 항공화물 데이터
const airCarriers: Carrier[] = [
  // 한국 항공사
  { name: '대한항공 (Korean Air)', code: 'KE', trackingUrl: 'https://cargo.koreanair.com/tracking', category: 'air', region: 'Korea', isMajor: true },
  { name: '아시아나 (Asiana)', code: 'OZ', trackingUrl: 'https://flyasiana.com/C/US/EN/contents/cargo-tracking', category: 'air', region: 'Korea', isMajor: true },
  { name: '진에어 (Jin Air)', code: 'LJ', trackingUrl: 'https://www.jinair.com/cargo/tracking', category: 'air', region: 'Korea', isMajor: true },
  { name: '제주항공 (Jeju Air)', code: '7C', trackingUrl: 'https://www.jejuair.net/ko/cargo/tracking.do', category: 'air', region: 'Korea', isMajor: true },
  { name: '티웨이 (T\'way Air)', code: 'TW', trackingUrl: 'https://www.twayair.com/cargo', category: 'air', region: 'Korea', isMajor: true },
  { name: '에어프레미아 (Air Premia)', code: 'YP', trackingUrl: 'https://www.airpremia.com/cargo', category: 'air', region: 'Korea' },
  { name: '이스타항공 (Eastar Jet)', code: 'ZE', trackingUrl: 'https://www.eastarjet.com/cargo', category: 'air', region: 'Korea' },
  // A
  { name: 'Aegean Airlines', code: 'A3', trackingUrl: 'https://www.aegeanair.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Aerolineas Argentinas', code: 'AR', trackingUrl: 'https://www.aerolineas.com.ar/cargo', category: 'air', region: 'Americas' },
  { name: 'Aeromexico Cargo', code: 'AM', trackingUrl: 'https://www.aeromexicocargo.com/tracking', category: 'air', region: 'Americas' },
  { name: 'AF-KL-MP Cargo', code: 'AF', trackingUrl: 'https://www.afklcargo.com/WW/en/common/tracking.jsp', category: 'air', region: 'Europe', isMajor: true },
  { name: 'Air Astana', code: 'KC', trackingUrl: 'https://airastana.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Air Baltic', code: 'BT', trackingUrl: 'https://www.airbaltic.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Air Belgium', code: 'KF', trackingUrl: 'https://www.airbelgium.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Air Canada Cargo', code: 'AC', trackingUrl: 'https://www.aircanada.com/cargo/tracking', category: 'air', region: 'Americas', isMajor: true },
  { name: 'Air Changan', code: '9H', trackingUrl: 'https://www.airchangan.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Air China Cargo', code: 'CA', trackingUrl: 'https://www.airchinacargo.com/tracking', category: 'air', region: 'Asia', isMajor: true },
  { name: 'Air Corsica', code: 'XK', trackingUrl: 'https://www.aircorsica.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Air Côte d\'Ivoire', code: 'HF', trackingUrl: 'https://www.aircotedivoire.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Air Europa Cargo', code: 'UX', trackingUrl: 'https://www.aireuropa.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Air Greenland', code: 'GL', trackingUrl: 'https://www.airgreenland.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Air Guilin', code: 'GT', trackingUrl: 'https://www.airchina.com.cn/cargo', category: 'air', region: 'Asia' },
  { name: 'Air Hong Kong', code: 'LD', trackingUrl: 'https://www.airhongkong.com.hk/tracking', category: 'air', region: 'Asia' },
  { name: 'Air India Cargo', code: 'AI', trackingUrl: 'https://www.airindia.com/cargo', category: 'air', region: 'Asia', isMajor: true },
  { name: 'Air Inuit', code: '3H', trackingUrl: 'https://www.airinuit.com/cargo', category: 'air', region: 'Americas' },
  { name: 'Air Macau Cargo', code: 'NX', trackingUrl: 'https://www.airmacau.com.mo/cargo', category: 'air', region: 'Asia' },
  { name: 'Air Madagascar', code: 'MD', trackingUrl: 'https://www.airmadagascar.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Air Mauritius', code: 'MK', trackingUrl: 'https://www.airmauritius.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Air New Zealand Cargo', code: 'NZ', trackingUrl: 'https://www.airnzcargo.com/tracking', category: 'air', region: 'Oceania' },
  { name: 'Air Niugini', code: 'PX', trackingUrl: 'https://www.airniugini.com.pg/cargo', category: 'air', region: 'Oceania' },
  { name: 'Air Senegal', code: 'HC', trackingUrl: 'https://www.flyairsenegal.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Air Serbia', code: 'JU', trackingUrl: 'https://www.airserbia.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Air Seychelles', code: 'HM', trackingUrl: 'https://www.airseychelles.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Air Tahiti Nui', code: 'TN', trackingUrl: 'https://www.airtahitinui.com/cargo', category: 'air', region: 'Oceania' },
  { name: 'Air Tanzania', code: 'TC', trackingUrl: 'https://www.airtanzania.co.tz/cargo', category: 'air', region: 'Africa' },
  { name: 'Air Transat', code: 'TS', trackingUrl: 'https://www.airtransat.com/cargo', category: 'air', region: 'Americas' },
  { name: 'Airlink Cargo', code: '4Z', trackingUrl: 'https://www.flyairlink.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Akasa Air', code: 'QP', trackingUrl: 'https://www.akasaair.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Alaska Air Cargo', code: 'AS', trackingUrl: 'https://www.alaskaair.com/cargo', category: 'air', region: 'Americas' },
  { name: 'AlliedAir', code: '4W', trackingUrl: 'https://www.alliedair.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Aloha Air Cargo', code: 'KH', trackingUrl: 'https://www.alohaaircargo.com', category: 'air', region: 'Americas' },
  { name: 'American Airlines Cargo', code: 'AA', trackingUrl: 'https://www.aacargo.com/tracking', category: 'air', region: 'Americas', isMajor: true },
  { name: 'Amerijet International', code: 'M6', trackingUrl: 'https://www.amerijet.com/tracking', category: 'air', region: 'Americas' },
  { name: 'ANA Cargo', code: 'NH', trackingUrl: 'https://www.anacargo.jp/en/tracking/', category: 'air', region: 'Asia', isMajor: true },
  { name: 'ASL Airlines Belgium', code: '3V', trackingUrl: 'https://www.aslairlines.be/cargo', category: 'air', region: 'Europe' },
  { name: 'Astral Aviation', code: '8V', trackingUrl: 'https://www.astral-aviation.com', category: 'air', region: 'Africa' },
  { name: 'Atlantic Airways', code: 'RC', trackingUrl: 'https://www.atlanticairways.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Atlas Air', code: '5Y', trackingUrl: 'https://www.atlasair.com/tracking', category: 'air', region: 'Americas' },
  { name: 'Aurora Airlines', code: 'HZ', trackingUrl: 'https://www.flyaurora.ru/cargo', category: 'air', region: 'Asia' },
  { name: 'Avianca Cargo', code: 'AV', trackingUrl: 'https://www.aviancacargo.com/tracking', category: 'air', region: 'Americas' },
  { name: 'AZAL Cargo', code: 'J2', trackingUrl: 'https://www.azal.az/cargo', category: 'air', region: 'Asia' },
  { name: 'Azul Cargo', code: 'AD', trackingUrl: 'https://www.voeazul.com.br/cargo', category: 'air', region: 'Americas' },
  // B
  { name: 'Bangkok Airways', code: 'PG', trackingUrl: 'https://www.bangkokair.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Batik Air Indonesia', code: 'ID', trackingUrl: 'https://www.batikair.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Batik Air Malaysia', code: 'OD', trackingUrl: 'https://www.batikair.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Biman Bangladesh', code: 'BG', trackingUrl: 'https://www.bfrancargo.com', category: 'air', region: 'Asia' },
  { name: 'Bringer Air Cargo', code: 'E6', trackingUrl: 'https://www.bfrancargo.com', category: 'air', region: 'Americas' },
  // C
  { name: 'Cabo Verde Airlines', code: 'VR', trackingUrl: 'https://www.caboverdeairlines.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Calm Air', code: 'MO', trackingUrl: 'https://www.calmair.com/cargo', category: 'air', region: 'Americas' },
  { name: 'Capital Airlines', code: 'JD', trackingUrl: 'https://www.capitalairlines.com.cn/cargo', category: 'air', region: 'Asia' },
  { name: 'Cargojet', code: 'W8', trackingUrl: 'https://www.cargojet.com/tracking', category: 'air', region: 'Americas' },
  { name: 'Cargolux', code: 'CV', trackingUrl: 'https://www.cargolux.com/Our-Services/Shipment-Tracking', category: 'air', region: 'Europe', isMajor: true },
  { name: 'Cargolux Italia', code: 'C8', trackingUrl: 'https://www.cargolux.com/tracking', category: 'air', region: 'Europe' },
  { name: 'Caribbean Airlines', code: 'BW', trackingUrl: 'https://www.caribbean-airlines.com/cargo', category: 'air', region: 'Americas' },
  { name: 'Cathay Cargo', code: 'CX', trackingUrl: 'https://www.cathaypacificcargo.com/en/Track.aspx', category: 'air', region: 'Asia', isMajor: true },
  { name: 'Cayman Airways', code: 'KX', trackingUrl: 'https://www.caymanairways.com/cargo', category: 'air', region: 'Americas' },
  { name: 'Cebu Pacific Air', code: '5J', trackingUrl: 'https://www.cebupacificair.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Central Airlines', code: 'I9', trackingUrl: 'https://www.flycentralair.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Challenge Airlines BE', code: 'X7', trackingUrl: 'https://www.challengegroup.com/tracking', category: 'air', region: 'Europe' },
  { name: 'Challenge Airlines IL', code: '5C', trackingUrl: 'https://www.challengegroup.com/tracking', category: 'air', region: 'Middle East' },
  { name: 'Challenge Airlines MT', code: 'X6', trackingUrl: 'https://www.challengegroup.com/tracking', category: 'air', region: 'Europe' },
  { name: 'China Airlines Cargo', code: 'CI', trackingUrl: 'https://cargo.china-airlines.com/ccnetv2/TrackShipmentAction.do', category: 'air', region: 'Asia', isMajor: true },
  { name: 'China Cargo Airlines', code: 'CK', trackingUrl: 'https://www.ckair.com/tracking', category: 'air', region: 'Asia' },
  { name: 'China Southern Cargo', code: 'CZ', trackingUrl: 'https://cargo.csair.com/tracking', category: 'air', region: 'Asia', isMajor: true },
  { name: 'CMA CGM Air Cargo', code: '2C', trackingUrl: 'https://www.cma-cgm.com/tracking', category: 'air', region: 'Europe' },
  { name: 'Condor Cargo', code: 'DE', trackingUrl: 'https://www.condor.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Copa Cargo', code: 'CM', trackingUrl: 'https://cargo.copaair.com/tracking', category: 'air', region: 'Americas' },
  { name: 'Corendon Airlines', code: 'XC', trackingUrl: 'https://www.corendonairlines.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Corsair', code: 'SS', trackingUrl: 'https://www.flycorsair.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Croatia Airlines', code: 'OU', trackingUrl: 'https://www.croatiaairlines.com/cargo', category: 'air', region: 'Europe' },
  // D
  { name: 'Daallo Express', code: 'D3', trackingUrl: 'https://www.daallo.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Delta Cargo', code: 'DL', trackingUrl: 'https://www.deltacargo.com/tracking', category: 'air', region: 'Americas', isMajor: true },
  { name: 'DHL Aviation', code: 'ES', trackingUrl: 'https://www.dhl.com/tracking', category: 'air', region: 'Global' },
  // E
  { name: 'EgyptAir Cargo', code: 'MS', trackingUrl: 'https://cargo.egyptair.com/tracking', category: 'air', region: 'Africa' },
  { name: 'El Al Cargo', code: 'LY', trackingUrl: 'https://www.elal.com/cargo/tracking', category: 'air', region: 'Middle East' },
  { name: 'Emirates SkyCargo', code: 'EK', trackingUrl: 'https://www.skycargo.com/english/track/', category: 'air', region: 'Middle East', isMajor: true },
  { name: 'Estafeta', code: 'E7', trackingUrl: 'https://www.estafeta.com/tracking', category: 'air', region: 'Americas' },
  { name: 'Ethiopian Cargo', code: 'ET', trackingUrl: 'https://www.ethiopianairlines.com/AA/EN/cargo/track-your-cargo', category: 'air', region: 'Africa', isMajor: true },
  { name: 'Etihad Cargo', code: 'EY', trackingUrl: 'https://www.etihadcargo.com/en/tracking/', category: 'air', region: 'Middle East', isMajor: true },
  { name: 'EVA Air Cargo', code: 'BR', trackingUrl: 'https://www.evacargo.com/Tracking/TrackingCargo.aspx', category: 'air', region: 'Asia', isMajor: true },
  { name: 'Everts Air', code: '5V', trackingUrl: 'https://www.evertsair.com/cargo', category: 'air', region: 'Americas' },
  // F
  { name: 'FedEx Express', code: 'FX', trackingUrl: 'https://www.fedex.com/en-kr/tracking.html', category: 'air', region: 'Global', isMajor: true },
  { name: 'Fiji Airways', code: 'FJ', trackingUrl: 'https://www.fijiairways.com/cargo', category: 'air', region: 'Oceania' },
  { name: 'Finnair Cargo', code: 'AY', trackingUrl: 'https://cargo.finnair.com/tracking', category: 'air', region: 'Europe', isMajor: true },
  { name: 'Fly Jinnah', code: '9P', trackingUrl: 'https://www.flyjinnah.com/cargo', category: 'air', region: 'Asia' },
  { name: 'flydubai Cargo', code: 'FZ', trackingUrl: 'https://www.flydubai.com/cargo', category: 'air', region: 'Middle East' },
  { name: 'flynas', code: 'XY', trackingUrl: 'https://www.flynas.com/cargo', category: 'air', region: 'Middle East' },
  { name: 'Fuzhou Airlines', code: 'FU', trackingUrl: 'https://www.fuzhou-air.cn/cargo', category: 'air', region: 'Asia' },
  // G
  { name: 'Garuda Indonesia', code: 'GA', trackingUrl: 'https://cargo.garuda-indonesia.com/tracking', category: 'air', region: 'Asia' },
  { name: 'Greater Bay Airlines', code: 'HB', trackingUrl: 'https://www.greaterbayairlines.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Gulf Air Cargo', code: 'GF', trackingUrl: 'https://www.gulfair.com/cargo/track-shipment', category: 'air', region: 'Middle East' },
  { name: 'GX Airlines', code: 'GX', trackingUrl: 'https://www.gxairlines.com/cargo', category: 'air', region: 'Asia' },
  // H
  { name: 'Hainan Airlines Cargo', code: 'HU', trackingUrl: 'https://www.hnacargo.com/tracking', category: 'air', region: 'Asia' },
  { name: 'Hawaiian Airlines', code: 'HA', trackingUrl: 'https://www.hawaiianairlines.com/cargo', category: 'air', region: 'Americas' },
  { name: 'HK Express', code: 'UO', trackingUrl: 'https://www.hkexpress.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Hong Kong Air Cargo', code: 'RH', trackingUrl: 'https://www.hongkongaircargo.com/tracking', category: 'air', region: 'Asia' },
  // I
  { name: 'IAG Cargo', code: 'IB', trackingUrl: 'https://www.iagcargo.com/track-trace/', category: 'air', region: 'Europe', isMajor: true },
  { name: 'IBC Airways', code: 'II', trackingUrl: 'https://www.ibcairways.com/cargo', category: 'air', region: 'Americas' },
  { name: 'Icelandair Cargo', code: 'FI', trackingUrl: 'https://www.icelandaircargo.com/tracking', category: 'air', region: 'Europe' },
  { name: 'IndiGo CarGo', code: '6E', trackingUrl: 'https://www.goindigo.in/cargo', category: 'air', region: 'Asia' },
  { name: 'ITA Airways', code: 'AZ', trackingUrl: 'https://www.ita-airways.com/cargo', category: 'air', region: 'Europe' },
  // J
  { name: 'Jambojet', code: 'JM', trackingUrl: 'https://www.jambojet.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Japan Airlines Cargo', code: 'JL', trackingUrl: 'https://www.jalcargo.com/jcms/e/track/', category: 'air', region: 'Asia', isMajor: true },
  { name: 'Jazeera Air Cargo', code: 'J9', trackingUrl: 'https://www.jazeeraairways.com/cargo', category: 'air', region: 'Middle East' },
  { name: 'JetBlue', code: 'B6', trackingUrl: 'https://www.jetblue.com/cargo', category: 'air', region: 'Americas' },
  { name: 'Juneyao Airlines', code: 'HO', trackingUrl: 'https://www.juneyaoair.com/cargo', category: 'air', region: 'Asia' },
  // K
  { name: 'Kalitta Air', code: 'K4', trackingUrl: 'https://www.kalittaair.com/tracking', category: 'air', region: 'Americas' },
  { name: 'Kenya Airways Cargo', code: 'KQ', trackingUrl: 'https://cargo.kenya-airways.com/tracking', category: 'air', region: 'Africa' },
  { name: 'KM Malta Airlines', code: 'KM', trackingUrl: 'https://www.kmmaltairlines.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Kuwait Airways', code: 'KU', trackingUrl: 'https://www.kuwaitairways.com/cargo/tracking', category: 'air', region: 'Middle East' },
  // L
  { name: 'LAM Cargo', code: 'TM', trackingUrl: 'https://www.lam.co.mz/cargo', category: 'air', region: 'Africa' },
  { name: 'LATAM Cargo', code: 'LA', trackingUrl: 'https://www.latamcargo.com/en/trackshipment', category: 'air', region: 'Americas', isMajor: true },
  { name: 'Lion Air', code: 'JT', trackingUrl: 'https://www.lionair.co.id/cargo', category: 'air', region: 'Asia' },
  { name: 'LOT Cargo', code: 'LO', trackingUrl: 'https://www.lotcargo.com/tracking', category: 'air', region: 'Europe' },
  { name: 'Lucky Air', code: '8L', trackingUrl: 'https://www.luckyair.net/cargo', category: 'air', region: 'Asia' },
  { name: 'Lufthansa Cargo', code: 'LH', trackingUrl: 'https://lufthansa-cargo.com/tracking', category: 'air', region: 'Europe', isMajor: true },
  // M
  { name: 'MasAir', code: 'M7', trackingUrl: 'https://www.masair.com/tracking', category: 'air', region: 'Americas' },
  { name: 'MASkargo', code: 'MH', trackingUrl: 'https://www.maskargo.com/tracking', category: 'air', region: 'Asia', isMajor: true },
  { name: 'Middle East Airlines', code: 'ME', trackingUrl: 'https://www.mea.com.lb/cargo', category: 'air', region: 'Middle East' },
  { name: 'MNG Airlines', code: 'MB', trackingUrl: 'https://www.mngairlines.com/tracking', category: 'air', region: 'Europe' },
  { name: 'MSC Air Cargo', code: 'CP', trackingUrl: 'https://www.msc.com/tracking', category: 'air', region: 'Europe' },
  { name: 'My Freighter', code: 'C6', trackingUrl: 'https://www.myfreighter.com/tracking', category: 'air', region: 'Europe' },
  // N
  { name: 'Nauru Airlines', code: 'ON', trackingUrl: 'https://www.nauruairlines.com/cargo', category: 'air', region: 'Oceania' },
  { name: 'Neos', code: 'NO', trackingUrl: 'https://www.neosair.it/cargo', category: 'air', region: 'Europe' },
  { name: 'Nile Air', code: 'NP', trackingUrl: 'https://www.nileair.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Nippon Cargo Airlines', code: 'KZ', trackingUrl: 'https://www.nca.aero/tracking', category: 'air', region: 'Asia' },
  { name: 'Nordwind Airlines', code: 'N4', trackingUrl: 'https://www.nordwindairlines.ru/cargo', category: 'air', region: 'Europe' },
  { name: 'Norse Cargo', code: 'N0', trackingUrl: 'https://www.flynorse.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Northern Air Cargo', code: 'NC', trackingUrl: 'https://www.nac.aero/tracking', category: 'air', region: 'Americas' },
  { name: 'Norwegian Cargo', code: 'DY', trackingUrl: 'https://www.norwegian.com/cargo', category: 'air', region: 'Europe' },
  // O
  { name: 'Oman Air Cargo', code: 'WY', trackingUrl: 'https://www.omanair.com/cargo/tracking', category: 'air', region: 'Middle East' },
  // P
  { name: 'Pacific Coastal Airlines', code: '8P', trackingUrl: 'https://www.pacificcoastal.com/cargo', category: 'air', region: 'Americas' },
  { name: 'Pakistan International', code: 'PK', trackingUrl: 'https://www.piac.com.pk/cargo', category: 'air', region: 'Asia' },
  { name: 'Pegasus Cargo', code: 'PC', trackingUrl: 'https://www.flypgs.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Philippine Airlines', code: 'PR', trackingUrl: 'https://www.palcargo.com/tracking', category: 'air', region: 'Asia' },
  { name: 'PLAY', code: 'OG', trackingUrl: 'https://www.flyplay.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Plus Ultra', code: 'PU', trackingUrl: 'https://www.plusultra.com/cargo', category: 'air', region: 'Europe' },
  { name: 'PNG Air', code: 'CG', trackingUrl: 'https://www.pngair.com.pg/cargo', category: 'air', region: 'Oceania' },
  { name: 'Polar Air Cargo', code: 'PO', trackingUrl: 'https://www.polaraircargo.com/tracking', category: 'air', region: 'Americas' },
  // Q
  { name: 'Qantas Freight', code: 'QF', trackingUrl: 'https://freight.qantas.com/tracking', category: 'air', region: 'Oceania', isMajor: true },
  { name: 'Qatar Airways Cargo', code: 'QR', trackingUrl: 'https://www.qrcargo.com/s/track-shipment', category: 'air', region: 'Middle East', isMajor: true },
  // R
  { name: 'Royal Air Maroc', code: 'AT', trackingUrl: 'https://cargo.royalairmaroc.com/tracking', category: 'air', region: 'Africa' },
  { name: 'Royal Brunei', code: 'BI', trackingUrl: 'https://www.royalbrunei.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Royal Jordanian', code: 'RJ', trackingUrl: 'https://cargo.rj.com/tracking', category: 'air', region: 'Middle East' },
  { name: 'RwandAir', code: 'WB', trackingUrl: 'https://www.rwandair.com/cargo', category: 'air', region: 'Africa' },
  // S
  { name: 'S7 Cargo', code: 'S7', trackingUrl: 'https://www.s7.ru/cargo', category: 'air', region: 'Europe' },
  { name: 'SAS Cargo', code: 'SK', trackingUrl: 'https://www.sascargo.com/tracking', category: 'air', region: 'Europe' },
  { name: 'SATA', code: 'S4', trackingUrl: 'https://www.sata.pt/cargo', category: 'air', region: 'Europe' },
  { name: 'Saudia Cargo', code: 'SV', trackingUrl: 'https://www.saudiacargo.com/en/track-shipment', category: 'air', region: 'Middle East' },
  { name: 'SF Airlines', code: 'O3', trackingUrl: 'https://www.sf-airlines.com/tracking', category: 'air', region: 'Asia' },
  { name: 'Shenzhen Airlines', code: 'ZH', trackingUrl: 'https://cargo.shenzhenair.com/tracking', category: 'air', region: 'Asia' },
  { name: 'Sichuan Airlines', code: '3U', trackingUrl: 'https://www.sichuanair.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Silk Way Airlines', code: 'ZP', trackingUrl: 'https://www.silkwayairlines.com/tracking', category: 'air', region: 'Asia' },
  { name: 'Silk Way West Airlines', code: '7L', trackingUrl: 'https://www.silkwaywest.com/tracking', category: 'air', region: 'Asia' },
  { name: 'Singapore Airlines Cargo', code: 'SQ', trackingUrl: 'https://www.siacargo.com/tracking/', category: 'air', region: 'Asia', isMajor: true },
  { name: 'Smartwings', code: 'QS', trackingUrl: 'https://www.smartwings.com/cargo', category: 'air', region: 'Europe' },
  { name: 'South African Airways', code: 'SA', trackingUrl: 'https://www.flysaa.com/cargo/tracking', category: 'air', region: 'Africa' },
  { name: 'Southwest Airlines', code: 'WN', trackingUrl: 'https://www.southwest.com/cargo', category: 'air', region: 'Americas' },
  { name: 'SpiceJet Cargo', code: 'SG', trackingUrl: 'https://www.spicejet.com/cargo', category: 'air', region: 'Asia' },
  { name: 'SriLankan Cargo', code: 'UL', trackingUrl: 'https://www.srilankan.com/cargo', category: 'air', region: 'Asia' },
  { name: 'STARLUX', code: 'JX', trackingUrl: 'https://www.starlux-airlines.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Sunclass Airlines', code: 'DK', trackingUrl: 'https://www.sunclass.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Suparna Airlines', code: 'Y8', trackingUrl: 'https://www.suparna.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Super Air Jet', code: 'IU', trackingUrl: 'https://www.superairjet.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Swiss WorldCargo', code: 'LX', trackingUrl: 'https://www.swissworldcargo.com/tracking', category: 'air', region: 'Europe', isMajor: true },
  // T
  { name: 'TAAG Angola', code: 'DT', trackingUrl: 'https://www.taag.com/cargo', category: 'air', region: 'Africa' },
  { name: 'TAP Air Cargo', code: 'TP', trackingUrl: 'https://www.tapcargo.com/tracking', category: 'air', region: 'Europe' },
  { name: 'Tarom', code: 'RO', trackingUrl: 'https://www.tarom.ro/cargo', category: 'air', region: 'Europe' },
  { name: 'Thai Airways Cargo', code: 'TG', trackingUrl: 'https://www.thaicargo.com/tracking', category: 'air', region: 'Asia', isMajor: true },
  { name: 'Thai Lion Air', code: 'SL', trackingUrl: 'https://www.lionairthai.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Tianjin Air Cargo', code: 'HT', trackingUrl: 'https://www.tianjin-air.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Tianjin Airlines', code: 'GS', trackingUrl: 'https://www.tianjin-air.com/cargo', category: 'air', region: 'Asia' },
  { name: 'TUI Cargo', code: 'TB', trackingUrl: 'https://www.tui.com/cargo', category: 'air', region: 'Europe' },
  { name: 'Tunisair Cargo', code: 'TU', trackingUrl: 'https://www.tunisair.com/cargo', category: 'air', region: 'Africa' },
  { name: 'Turkish Cargo', code: 'TK', trackingUrl: 'https://www.turkishcargo.com.tr/en/e-services/track-trace', category: 'air', region: 'Europe', isMajor: true },
  { name: 'Turkmenistan Airlines', code: 'T5', trackingUrl: 'https://www.turkmenistanairlines.com/cargo', category: 'air', region: 'Asia' },
  // U
  { name: 'Uganda Airlines', code: 'UR', trackingUrl: 'https://www.ugandairlines.com/cargo', category: 'air', region: 'Africa' },
  { name: 'United Cargo', code: 'UA', trackingUrl: 'https://www.unitedcargo.com/tracking', category: 'air', region: 'Americas', isMajor: true },
  { name: 'UPS Airlines', code: '5X', trackingUrl: 'https://www.ups.com/track', category: 'air', region: 'Global', isMajor: true },
  { name: 'Ural Airlines', code: 'U6', trackingUrl: 'https://www.uralairlines.ru/cargo', category: 'air', region: 'Europe' },
  { name: 'Uzbekistan Airways', code: 'HY', trackingUrl: 'https://www.uzairways.com/cargo', category: 'air', region: 'Asia' },
  // V
  { name: 'VietJet Cargo', code: 'VJ', trackingUrl: 'https://www.vietjetair.com/cargo', category: 'air', region: 'Asia' },
  { name: 'Vietnam Airlines Cargo', code: 'VN', trackingUrl: 'https://cargo.vietnamairlines.com/tracking', category: 'air', region: 'Asia', isMajor: true },
  { name: 'Virgin Atlantic Cargo', code: 'VS', trackingUrl: 'https://cargo.virginatlantic.com/tracking', category: 'air', region: 'Europe' },
  { name: 'Virgin Australia Cargo', code: 'VA', trackingUrl: 'https://www.virginaustralia.com/cargo', category: 'air', region: 'Oceania' },
  { name: 'Volaris', code: 'Y4', trackingUrl: 'https://www.volaris.com/cargo', category: 'air', region: 'Americas' },
  // W
  { name: 'West Air', code: 'PN', trackingUrl: 'https://www.westair.cn/cargo', category: 'air', region: 'Asia' },
  { name: 'WestJet Cargo', code: 'WS', trackingUrl: 'https://www.westjet.com/cargo', category: 'air', region: 'Americas' },
  { name: 'Widerøe', code: 'WF', trackingUrl: 'https://www.wideroe.no/cargo', category: 'air', region: 'Europe' },
  { name: 'Wings Air', code: 'IW', trackingUrl: 'https://www.lionair.co.id/cargo', category: 'air', region: 'Asia' },
  // Y
  { name: 'YTO Cargo Airlines', code: 'YG', trackingUrl: 'https://www.yto.net.cn/tracking', category: 'air', region: 'Asia' },
];

// AWB 형식 검증 (123-12345678)
const validateAwbFormat = (awb: string): boolean => {
  const cleaned = awb.replace(/[\s-]/g, '');
  return /^\d{11}$/.test(cleaned);
};

// AWB 파싱 (prefix와 number 분리)
const parseAwb = (awb: string): { prefix: string; number: string } | null => {
  const cleaned = awb.replace(/[\s-]/g, '');
  if (cleaned.length !== 11) return null;
  return {
    prefix: cleaned.substring(0, 3),
    number: cleaned.substring(3),
  };
};

// AWB 포맷팅 (123-12345678 형식으로)
const formatAwb = (value: string): string => {
  const cleaned = value.replace(/[^\d]/g, '');
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 11)}`;
};

interface TrackerAirProps {
  adSlot?: React.ReactNode;
}

const TrackerAir: React.FC<TrackerAirProps> = ({ adSlot }) => {
  const [awbInput, setAwbInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMajorOnly, setShowMajorOnly] = useState(false);
  const [detectedCarrier, setDetectedCarrier] = useState<Carrier | null>(null);
  const [showManualSelect, setShowManualSelect] = useState(false);

  // AWB 입력 처리
  const handleAwbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAwb(e.target.value);
    setAwbInput(formatted);

    // 11자리 완성됐을 때만 감지 실행
    const cleaned = formatted.replace(/[^\d]/g, '');
    if (cleaned.length === 11) {
      const prefix = cleaned.substring(0, 3);
      const airlineCode = awbPrefixMap[prefix];
      if (airlineCode) {
        const carrier = airCarriers.find(c => c.code === airlineCode);
        setDetectedCarrier(carrier || null);
      } else {
        setDetectedCarrier(null);
      }
    } else {
      setDetectedCarrier(null);
    }
  };

  // 추적 실행
  const handleTrack = (carrier?: Carrier) => {
    const targetCarrier = carrier || detectedCarrier;
    if (!targetCarrier) return;

    window.open(targetCarrier.trackingUrl, '_blank', 'noopener,noreferrer');
  };

  // 수동 선택으로 추적
  const handleManualTrack = (carrier: Carrier) => {
    window.open(carrier.trackingUrl, '_blank', 'noopener,noreferrer');
    setShowManualSelect(false);
  };

  // 필터링된 운송사 목록
  const filteredCarriers = useMemo(() => {
    return airCarriers.filter(carrier => {
      const matchesSearch =
        carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carrier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (carrier.region?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesMajor = !showMajorOnly || carrier.isMajor;
      return matchesSearch && matchesMajor;
    });
  }, [searchTerm, showMajorOnly]);

  const sortedCarriers = useMemo(() => {
    return [...filteredCarriers].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredCarriers]);

  const isValidAwb = validateAwbFormat(awbInput);
  const parsed = parseAwb(awbInput);

  return (
    <div className="space-y-4">
      {/* AWB 자동 추적 섹션 */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* 설명 영역 */}
          <div className="lg:w-72 shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-teal-500 rounded-md flex items-center justify-center">
                <PlaneIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="font-bold text-slate-800">AWB 자동 추적</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              항공화물 번호 앞 3자리로 항공사를 자동 감지합니다.
              <span className="text-slate-400 block mt-0.5">예: <span className="font-mono">180</span>-12345678 → 대한항공</span>
            </p>
          </div>

          {/* 입력 영역 */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3 items-stretch">
            <div className={`relative transition-[flex,width] duration-300 ease-out ${
              awbInput && isValidAwb ? 'w-full sm:w-[40%] shrink-0' : 'flex-1'
            }`}>
              <input
                type="text"
                placeholder="000-00000000"
                value={awbInput}
                onChange={handleAwbChange}
                maxLength={12}
                className={`w-full h-full px-5 py-3.5 text-lg font-mono bg-white border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                  awbInput && !isValidAwb
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-400'
                }`}
              />
              {awbInput && (
                <button
                  onClick={() => {
                    setAwbInput('');
                    setDetectedCarrier(null);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* 감지 결과 & 버튼 */}
            {awbInput && isValidAwb ? (
              detectedCarrier ? (
                <div className="flex items-stretch gap-2 flex-1 animate-fade-in">
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-teal-50 to-white border border-teal-200 rounded-xl flex-1 min-w-0">
                    <div className="w-2 h-2 bg-teal-500 rounded-full shrink-0 animate-pulse"></div>
                    <span className="text-sm font-bold text-slate-800 truncate">{detectedCarrier.name}</span>
                    <span className="text-xs text-teal-600 font-mono bg-teal-100/80 px-2 py-0.5 rounded-md shrink-0">{parsed?.prefix}</span>
                  </div>
                  <button
                    onClick={() => handleTrack()}
                    className="px-5 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-bold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/25 shrink-0"
                  >
                    추적
                  </button>
                  <button
                    onClick={() => setShowManualSelect(!showManualSelect)}
                    className="px-3 py-3.5 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    변경
                  </button>
                </div>
              ) : (
                <div className="flex items-stretch gap-2 flex-1 animate-fade-in">
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-xl flex-1 min-w-0">
                    <div className="w-2 h-2 bg-amber-500 rounded-full shrink-0"></div>
                    <span className="text-sm font-medium text-slate-700">미등록 코드</span>
                    <span className="text-xs text-amber-600 font-mono bg-amber-100/80 px-2 py-0.5 rounded-md">{parsed?.prefix}</span>
                  </div>
                  <button
                    onClick={() => setShowManualSelect(true)}
                    className="px-5 py-3.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg shadow-slate-800/25 whitespace-nowrap shrink-0"
                  >
                    직접 선택
                  </button>
                </div>
              )
            ) : (
              <button
                disabled
                className="px-5 py-3.5 bg-slate-100 text-slate-400 text-sm font-medium rounded-xl cursor-not-allowed whitespace-nowrap shrink-0"
              >
                추적
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 수동 선택 모달/섹션 */}
      {showManualSelect && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-700">항공사 수동 선택</h3>
            <button
              onClick={() => setShowManualSelect(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="항공사 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-9 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {sortedCarriers.slice(0, 50).map((carrier, idx) => (
                <button
                  key={`${carrier.code}-${idx}`}
                  onClick={() => handleManualTrack(carrier)}
                  className="bg-white rounded border border-slate-200 px-3 py-2 hover:bg-teal-50 hover:border-teal-300 transition-all text-left"
                >
                  <span className="text-sm text-slate-700 block truncate">{carrier.name}</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {carrier.code}{codeToPrefix[carrier.code] ? ` / ${codeToPrefix[carrier.code]}` : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 전체 항공사 목록 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-700">전체 항공사 목록</h3>
              <p className="text-xs text-slate-500">직접 항공사를 선택하여 추적 페이지로 이동</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="항공사, 코드, 지역 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-9 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Ad Slot */}
        {adSlot && (
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            {adSlot}
          </div>
        )}

        <div className="p-4">
          {/* Results Count & Major Filter */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-700">{sortedCarriers.length}개</span> 항공사
              </p>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showMajorOnly}
                  onChange={(e) => setShowMajorOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500/20 cursor-pointer"
                />
                <span className="text-sm text-slate-600 font-medium">주요 항공사만</span>
              </label>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-teal-500 hover:text-teal-700 font-medium"
              >
                검색 초기화
              </button>
            )}
          </div>

          {/* Carrier Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
            {sortedCarriers.map((carrier, idx) => (
              <button
                key={`${carrier.code}-${idx}`}
                onClick={() => handleManualTrack(carrier)}
                className="bg-white rounded border border-slate-200 px-2 py-1.5 hover:bg-teal-50 hover:border-teal-300 transition-all text-left group flex items-center gap-1.5"
              >
                <div className="w-5 h-5 bg-teal-500 rounded flex items-center justify-center text-white shrink-0">
                  <PlaneIcon className="w-3 h-3" />
                </div>
                <span className="text-xs text-slate-700 truncate flex-1">{carrier.name}</span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {carrier.code}{codeToPrefix[carrier.code] ? `/${codeToPrefix[carrier.code]}` : ''}
                </span>
              </button>
            ))}
          </div>

          {/* Empty State */}
          {sortedCarriers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <SearchIcon className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">검색 결과 없음</h3>
              <p className="text-sm text-slate-500 mb-3">"{searchTerm}"에 해당하는 항공사를 찾을 수 없습니다.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-teal-500 text-white text-sm font-bold rounded-lg hover:bg-teal-600 transition-colors"
              >
                전체 목록 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackerAir;
export { airCarriers };

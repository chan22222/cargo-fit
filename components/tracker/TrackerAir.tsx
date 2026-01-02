import React from 'react';
import { Carrier } from './types';
import { PlaneIcon } from './icons';
import CarrierGrid from './CarrierGrid';

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

interface TrackerAirProps {
  adSlot?: React.ReactNode;
}

const TrackerAir: React.FC<TrackerAirProps> = ({ adSlot }) => {
  return (
    <CarrierGrid
      carriers={airCarriers}
      title="항공화물"
      subtitle={`전세계 ${airCarriers.length}개+ 항공사 추적`}
      icon={<PlaneIcon className="w-5 h-5 text-white" />}
      iconBgClass="bg-gradient-to-br from-purple-500 to-purple-600"
      adSlot={adSlot}
    />
  );
};

export default TrackerAir;
export { airCarriers };

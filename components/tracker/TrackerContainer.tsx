import React, { useState, useMemo } from 'react';
import { Carrier } from './types';
import { ShipIcon, SearchIcon } from './icons';

// 컨테이너 선사 데이터
const containerCarriers: Carrier[] = [
  // 글로벌 메이저
  { name: 'Maersk Line', code: 'MAEU', trackingUrl: 'https://www.maersk.com/tracking/', category: 'container', region: 'Global', isMajor: true },
  { name: 'MSC (Mediterranean Shipping)', code: 'MSCU', trackingUrl: 'https://www.msc.com/track-a-shipment', category: 'container', region: 'Global', isMajor: true },
  { name: 'CMA CGM', code: 'CMDU', trackingUrl: 'https://www.cma-cgm.com/ebusiness/tracking', category: 'container', region: 'Global', isMajor: true },
  { name: 'COSCO Shipping Lines', code: 'COSU', trackingUrl: 'https://elines.coscoshipping.com/ebusiness/cargoTracking', category: 'container', region: 'Global', isMajor: true },
  { name: 'Hapag-Lloyd', code: 'HLCU', trackingUrl: 'https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html', category: 'container', region: 'Global', isMajor: true },
  { name: 'ONE (Ocean Network Express)', code: 'ONEY', trackingUrl: 'https://ecomm.one-line.com/one-ecom/manage-shipment/cargo-tracking', category: 'container', region: 'Global', isMajor: true },
  { name: 'Evergreen Line', code: 'EGLV', trackingUrl: 'https://www.shipmentlink.com/tvs2/servlet/TDB1_CargoTracking.do', category: 'container', region: 'Global', isMajor: true },
  { name: 'Yang Ming', code: 'YMLU', trackingUrl: 'https://www.yangming.com/e-service/track_trace/track_trace_cargo_tracking.aspx', category: 'container', region: 'Global', isMajor: true },
  { name: 'HMM (Hyundai)', code: 'HDMU', trackingUrl: 'https://www.hmm21.com/cms/business/ebiz/trackTrace/trackTrace/index.jsp', category: 'container', region: 'Global', isMajor: true },
  { name: 'ZIM', code: 'ZIMU', trackingUrl: 'https://www.zim.com/tools/track-a-shipment', category: 'container', region: 'Global', isMajor: true },
  { name: 'PIL (Pacific Int\'l Lines)', code: 'PCIU', trackingUrl: 'https://www.pilship.com/en-our-solutions-ede-cargo-tracking/84/', category: 'container', region: 'Global', isMajor: true },
  { name: 'OOCL', code: 'OOLU', trackingUrl: 'https://www.oocl.com/eng/ourservices/eservices/cargotracking/', category: 'container', region: 'Global', isMajor: true },
  // A
  { name: 'ACL (Atlantic Container Line)', code: 'ACLU', trackingUrl: 'https://www.aclcargo.com/', category: 'container', region: 'Europe' },
  { name: 'ANL Container Line', code: 'ANLU', trackingUrl: 'https://www.anl.com.au/', category: 'container', region: 'Oceania' },
  { name: 'APL', code: 'APLU', trackingUrl: 'https://www.apl.com/ebusiness/tracking', category: 'container', region: 'Global', isMajor: true },
  { name: 'Arkas Line', code: 'ARKU', trackingUrl: 'https://arkasline.com.tr/en/online-tracking/', category: 'container', region: 'Europe' },
  { name: 'Asyad Line', code: 'ASYD', trackingUrl: 'https://www.asyadline.om/', category: 'container', region: 'Middle East' },
  { name: 'Avana Logistek', code: 'AVAN', trackingUrl: 'https://www.unifeeder.com/avana-logistek', category: 'container', region: 'Asia' },
  // B
  { name: 'Balticon', code: 'BLTU', trackingUrl: 'https://www.balticon.pl/', category: 'container', region: 'Europe' },
  { name: 'Blue Water Lines', code: 'BLWL', trackingUrl: 'https://bluewaterlines.net/', category: 'container', region: 'Europe' },
  { name: 'Bridgehead Logistics', code: 'BRHD', trackingUrl: 'http://www.bridgeheadcontainers.com/', category: 'container', region: 'Americas' },
  // C
  { name: 'Camellia Line', code: 'CMLA', trackingUrl: 'http://183.111.65.71/clt/CUP_HOM_3000.do', category: 'container', region: 'Asia' },
  { name: 'Carpenters Shipping', code: 'CRPS', trackingUrl: 'https://www.carpentersshipping.com/', category: 'container', region: 'Europe' },
  { name: 'CNC (Cheng Lie Navigation)', code: 'CNCU', trackingUrl: 'https://www.cnc-line.com/tracking', category: 'container', region: 'Asia' },
  { name: 'CONCOR (India)', code: 'CONC', trackingUrl: 'https://www.concorindia.co.in/', category: 'container', region: 'Asia' },
  { name: 'Consort Express Lines', code: 'CSRT', trackingUrl: 'https://www.consort.com.pg/', category: 'container', region: 'Africa' },
  { name: 'Cordelia Shipping', code: 'CRDA', trackingUrl: 'https://cordelialine.com/', category: 'container', region: 'Asia' },
  { name: 'Crowley', code: 'CMCU', trackingUrl: 'https://www.crowley.com/logistics/tracking', category: 'container', region: 'Americas' },
  { name: 'CULines', code: 'CULU', trackingUrl: 'https://www.culines.com/en/', category: 'container', region: 'Asia' },
  // D
  { name: 'Dalreftrans', code: 'DLRF', trackingUrl: 'https://www.dalreftrans.ru/en/', category: 'container', region: 'Russia' },
  { name: 'DHL Global Forwarding', code: 'DHLG', trackingUrl: 'https://www.dhl.com/', category: 'container', region: 'Global' },
  // E
  { name: 'Emirates Shipping Line', code: 'ESPU', trackingUrl: 'https://www.emiratesline.com/track-trace/', category: 'container', region: 'Middle East' },
  { name: 'Emkay Line', code: 'EMKY', trackingUrl: 'https://www.emkayline.com/', category: 'container', region: 'Asia' },
  { name: 'ESL Shipping', code: 'ESLS', trackingUrl: 'https://www.eslse.et/', category: 'container', region: 'Europe' },
  { name: 'Expressway', code: 'EXPW', trackingUrl: 'https://expresswayshipping.com/', category: 'container', region: 'Asia' },
  // F
  { name: 'FESCO', code: 'FESO', trackingUrl: 'https://www.fesco.ru/en/clients/tracking', category: 'container', region: 'Russia' },
  { name: 'Finnlines', code: 'FINN', trackingUrl: 'https://www.finnlines.com/freight', category: 'container', region: 'Europe' },
  // G
  { name: 'Globelink Unimar', code: 'GLBU', trackingUrl: 'https://globelink-unimar.com/home/', category: 'container', region: 'Asia' },
  { name: 'Gold Star Line', code: 'GSLU', trackingUrl: 'https://www.goldstarline.com/', category: 'container', region: 'Asia' },
  { name: 'Grimaldi Lines', code: 'GRIU', trackingUrl: 'https://www.grimaldi.napoli.it/', category: 'container', region: 'Europe' },
  { name: 'GS Lines', code: 'GSLN', trackingUrl: 'https://www.gslines.pt/en/', category: 'container', region: 'Asia' },
  // H
  { name: 'Hecny Group', code: 'HCNY', trackingUrl: 'https://www.hecny.com/', category: 'container', region: 'Asia' },
  { name: 'Hede Shipping', code: 'HEDE', trackingUrl: 'http://en.hedehk.com/', category: 'container', region: 'Asia' },
  { name: 'Heung-A Line', code: 'HASU', trackingUrl: 'http://www.heungaline.com/', category: 'container', region: 'Asia' },
  { name: 'Hikaru Shipping', code: 'HKRU', trackingUrl: 'https://www.hikaruline.com/', category: 'container', region: 'Asia' },
  // I
  { name: 'Inox Shipping', code: 'INOX', trackingUrl: 'https://www.inoxshipping.com/', category: 'container', region: 'Europe' },
  { name: 'Interasia Lines', code: 'IALU', trackingUrl: 'https://www.interasia.cc/', category: 'container', region: 'Asia' },
  { name: 'IRIS Lines', code: 'IRIU', trackingUrl: 'https://irislogistics.com/', category: 'container', region: 'Middle East' },
  { name: 'Italia Marittima', code: 'ITMU', trackingUrl: 'http://www.italiamarittima.it/', category: 'container', region: 'Europe' },
  // K
  { name: 'Kambara Kisen', code: 'KKLU', trackingUrl: 'https://www.kambara-kisen.co.jp/en/', category: 'container', region: 'Asia' },
  { name: 'Kanway Line', code: 'KWLU', trackingUrl: 'https://www.kanway.tw/en', category: 'container', region: 'Asia' },
  { name: 'Korea Marine Transport', code: 'KMTU', trackingUrl: 'https://www.ekmtc.com/tracking', category: 'container', region: 'Asia' },
  // L
  { name: 'LX Pantos', code: 'LXPT', trackingUrl: 'https://www.lxpantos.com/', category: 'container', region: 'Asia' },
  // M
  { name: 'MACS Shipping', code: 'MACS', trackingUrl: 'https://www.macship.com/', category: 'container', region: 'Africa' },
  { name: 'Marfret', code: 'MFTU', trackingUrl: 'https://www.marfret.fr/en/', category: 'container', region: 'Europe' },
  { name: 'Margarita Shipping', code: 'MRGT', trackingUrl: 'https://margritashipping.com/', category: 'container', region: 'Americas' },
  { name: 'Marguisa', code: 'MRGV', trackingUrl: 'https://www.marguisa.com/en/', category: 'container', region: 'Europe' },
  { name: 'Mariana Express Lines', code: 'MELL', trackingUrl: 'https://www.pilship.com/mell-mariana-express-lines/', category: 'container', region: 'Asia' },
  { name: 'Matson', code: 'MATS', trackingUrl: 'https://www.matson.com/shipment-tracking.html', category: 'container', region: 'Pacific' },
  { name: 'Maxicon Container Line', code: 'MXCN', trackingUrl: 'https://www.maxiconline.com/', category: 'container', region: 'Asia' },
  { name: 'MEDKON Lines', code: 'MDKN', trackingUrl: 'https://medkonlines.com/', category: 'container', region: 'Europe' },
  { name: 'Meratus Line', code: 'MRTU', trackingUrl: 'https://www.meratusline.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Messina Line', code: 'MSNU', trackingUrl: 'https://www.messinaline.it/tracking', category: 'container', region: 'Europe' },
  { name: 'Minsheng Ocean Shipping', code: 'MNSO', trackingUrl: 'http://www.mssco.net/', category: 'container', region: 'Asia' },
  // N
  { name: 'National Shipping of America', code: 'NSAU', trackingUrl: 'https://natship.us/', category: 'container', region: 'Americas' },
  { name: 'Nauka Lines', code: 'NKLN', trackingUrl: 'http://www.naukalines.com/', category: 'container', region: 'Europe' },
  { name: 'NCL (Shipping Line)', code: 'NCLU', trackingUrl: 'https://www.ncl.no/', category: 'container', region: 'Europe' },
  { name: 'Neptune Logistics', code: 'NPTN', trackingUrl: 'https://www.nep-logistics.com/en/', category: 'container', region: 'Africa' },
  { name: 'Nirint Shipping', code: 'NRNT', trackingUrl: 'https://nirint.com/', category: 'container', region: 'Europe' },
  { name: 'NPDL', code: 'NPDL', trackingUrl: 'https://npdlship.com/', category: 'container', region: 'Asia' },
  // O
  { name: 'Ocean Axis', code: 'OCAX', trackingUrl: 'https://www.oceanaxis.com/', category: 'container', region: 'Asia' },
  { name: 'Oceanic Star Line', code: 'OSLU', trackingUrl: 'https://star-liners.com/', category: 'container', region: 'Americas' },
  // P
  { name: 'Pan Ocean', code: 'PNOU', trackingUrl: 'https://container.panocean.com/', category: 'container', region: 'Asia' },
  { name: 'Pasha Hawaii', code: 'PSHI', trackingUrl: 'https://www.pashahawaii.com/', category: 'container', region: 'Pacific' },
  { name: 'PSL Navegação', code: 'PSLN', trackingUrl: 'https://pslnavegacao.com/', category: 'container', region: 'Europe' },
  // R
  { name: 'RCL (Regional Container Lines)', code: 'RCLU', trackingUrl: 'https://www.rclgroup.com/', category: 'container', region: 'Asia' },
  { name: 'Romocean', code: 'RMOC', trackingUrl: 'https://romocean.com/en/', category: 'container', region: 'Europe' },
  { name: 'Royal Cargo', code: 'RYLC', trackingUrl: 'https://www.royalcargo.com/', category: 'container', region: 'Asia' },
  // S
  { name: 'Samskip', code: 'SAMU', trackingUrl: 'https://www.samskip.com/', category: 'container', region: 'Europe' },
  { name: 'Samudera Shipping', code: 'SMDR', trackingUrl: 'https://www.samudera.id/', category: 'container', region: 'Asia' },
  { name: 'Sarjak Container Lines', code: 'SRJK', trackingUrl: 'https://sarjak.com/', category: 'container', region: 'Asia' },
  { name: 'SCI (Shipping Corp of India)', code: 'SCIU', trackingUrl: 'https://www.shipindia.com/', category: 'container', region: 'Asia' },
  { name: 'Sea Hawk Lines', code: 'SHWK', trackingUrl: 'http://www.shal.asia/', category: 'container', region: 'Asia' },
  { name: 'Seaboard Marine', code: 'SMLU', trackingUrl: 'https://www.seaboardmarine.com/tracking/', category: 'container', region: 'Americas' },
  { name: 'Sealand (Maersk)', code: 'SEAU', trackingUrl: 'https://www.sealandmaersk.com/tracking/', category: 'container', region: 'Americas' },
  { name: 'SeaLead Shipping', code: 'SLSD', trackingUrl: 'https://www.sea-lead.com/', category: 'container', region: 'Asia' },
  { name: 'Sinotrans', code: 'SNTU', trackingUrl: 'https://www.sinolines.com/', category: 'container', region: 'Asia' },
  { name: 'SITC', code: 'SITC', trackingUrl: 'https://api.sitcline.com/sitcline/query/cargoTrack', category: 'container', region: 'Asia' },
  { name: 'SM Line', code: 'SMLM', trackingUrl: 'https://www.smlines.com/cargo-tracking', category: 'container', region: 'Asia' },
  { name: 'Sofrana ANL', code: 'SFAN', trackingUrl: 'https://www.anl.com.au/', category: 'container', region: 'Oceania' },
  { name: 'SPIL (Salam Pacific)', code: 'SPIL', trackingUrl: 'https://www.spil.co.id/', category: 'container', region: 'Asia' },
  { name: 'STG Logistics', code: 'STGL', trackingUrl: 'https://www.stgusa.com/', category: 'container', region: 'Americas' },
  { name: 'Stolt Tank Containers', code: 'STLT', trackingUrl: 'https://www.stolttankcontainers.com/', category: 'container', region: 'Global' },
  { name: 'Sunmarine Shipping', code: 'SNMR', trackingUrl: 'http://www.sunmarine.com/', category: 'container', region: 'Asia' },
  { name: 'Swire Shipping', code: 'SWRE', trackingUrl: 'https://www.swireshipping.com/', category: 'container', region: 'Oceania' },
  // T
  { name: 'T.S. Lines', code: 'TSLU', trackingUrl: 'https://www.tslines.com/en/tracking', category: 'container', region: 'Asia' },
  { name: 'TAILWIND Shipping', code: 'TWND', trackingUrl: 'https://tailwind-shipping.com/en.html', category: 'container', region: 'Europe' },
  { name: 'Tanto Intim Line', code: 'TNTO', trackingUrl: 'https://www.tantonet.com/', category: 'container', region: 'Asia' },
  { name: 'Tarros', code: 'TRRS', trackingUrl: 'https://www.tarros.it/', category: 'container', region: 'Europe' },
  { name: 'TCI Seaways', code: 'TCIU', trackingUrl: 'https://tciseaways.com/', category: 'container', region: 'Asia' },
  { name: 'TIS-logistic', code: 'TISL', trackingUrl: 'https://tislogistic.com/', category: 'container', region: 'Europe' },
  { name: 'Topocean', code: 'TOPC', trackingUrl: 'https://topocean.com/', category: 'container', region: 'Americas' },
  { name: 'TOTE Maritime', code: 'TOTE', trackingUrl: 'https://www.totemaritime.com/', category: 'container', region: 'Americas' },
  { name: 'Trailer Bridge', code: 'TRBR', trackingUrl: 'https://www.trailerbridge.com/', category: 'container', region: 'Americas' },
  { name: 'Trans Asia Shipping', code: 'TASU', trackingUrl: 'https://www.tassgroup.com/', category: 'container', region: 'Asia' },
  { name: 'Transmar', code: 'TSMR', trackingUrl: 'https://www.transmar.com/', category: 'container', region: 'Europe' },
  { name: 'Transvision Shipping', code: 'TVSN', trackingUrl: 'https://transvisionshipping.com/', category: 'container', region: 'Middle East' },
  { name: 'Tropical Shipping', code: 'TSLA', trackingUrl: 'https://www.tropical.com/eTropical/Tracking', category: 'container', region: 'Caribbean' },
  { name: 'Turkon Line', code: 'TRKU', trackingUrl: 'https://www.turkon.com/en/track-trace', category: 'container', region: 'Europe' },
  // U
  { name: 'Unifeeder', code: 'UNFE', trackingUrl: 'https://www.unifeeder.com/track-trace', category: 'container', region: 'Europe' },
  { name: 'UWL', code: 'UWLU', trackingUrl: 'https://www.shipuwl.com/', category: 'container', region: 'Americas' },
  // V
  { name: 'Volta Shipping', code: 'VLTA', trackingUrl: 'https://voltacontainerline.com/', category: 'container', region: 'Africa' },
  // W
  { name: 'W.E.C. Lines', code: 'WECL', trackingUrl: 'https://www.weclines.com/', category: 'container', region: 'Europe' },
  { name: 'Wan Hai Lines', code: 'WHLC', trackingUrl: 'https://www.wanhai.com/views/cargoTrack/CargoTrack.xhtml', category: 'container', region: 'Asia' },
  { name: 'World Direct Shipping', code: 'WDSU', trackingUrl: 'https://www.worlddirectshipping.com/', category: 'container', region: 'Americas' },
  { name: 'World Transport Overseas', code: 'WTOU', trackingUrl: 'https://www.wtogroup.com/', category: 'container', region: 'Europe' },
  { name: 'WorldWide Alliance', code: 'WWAU', trackingUrl: 'https://www.wwalliance.com/', category: 'container', region: 'Global' },
  // X
  { name: 'X-Press Feeders', code: 'XPRS', trackingUrl: 'https://www.x-pressfeeders.com/track-and-trace', category: 'container', region: 'Global' },
  { name: 'Xi\'an International', code: 'XIAN', trackingUrl: 'https://www.xaport.net/', category: 'container', region: 'Asia' },
  // Y
  { name: 'YXE Line', code: 'YXEL', trackingUrl: 'http://www.yixinou.com/', category: 'container', region: 'Asia' },
  // Z
  { name: 'ZIM World Freight', code: 'ZIMW', trackingUrl: 'http://www.zline.in/', category: 'container', region: 'Global' },

  // B/L 추적 추가 (특수 선사)
  { name: 'Bahri (National Shipping)', code: 'BAHR', trackingUrl: 'https://www.bahri.sa/tracking', category: 'container', region: 'Middle East' },
  { name: 'Eimskip', code: 'EIMS', trackingUrl: 'https://www.eimskip.com/find-shipment/', category: 'container', region: 'Europe' },
  { name: 'EUKOR Car Carriers', code: 'EUKO', trackingUrl: 'https://www.eukor.com/tracking', category: 'container', region: 'Global' },
  { name: 'Höegh Autoliners', code: 'HOEG', trackingUrl: 'https://www.hoeghautoliners.com/tracking', category: 'container', region: 'Global' },
  { name: 'MOL ACE', code: 'MOLA', trackingUrl: 'https://www.molgroup.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Wallenius Wilhelmsen', code: 'WAWI', trackingUrl: 'https://www.walleniuswilhelmsen.com/tracking', category: 'container', region: 'Global' },

  // 한국 선사 (Korean Lines)
  { name: 'HMM (현대상선)', code: 'HDMU', trackingUrl: 'https://www.hmm21.com/cms/business/ebiz/trackTrace/trackTrace/index.jsp', category: 'container', region: 'Korea', isMajor: true },
  { name: '장금상선 (Sinokor)', code: 'SKLU', trackingUrl: 'https://ebiz.sinokor.co.kr/tracking', category: 'container', region: 'Korea', isMajor: true },
  { name: '고려해운 (KMTC)', code: 'KMTU', trackingUrl: 'https://www.ekmtc.com/index.html#/cargo-tracking', category: 'container', region: 'Korea', isMajor: true },
  { name: 'SM상선 (SM Line)', code: 'SMLM', trackingUrl: 'https://www.smlines.com/tracking', category: 'container', region: 'Korea', isMajor: true },
  { name: '흥아해운 (Heung-A)', code: 'HASU', trackingUrl: 'http://www.heungaline.com/', category: 'container', region: 'Korea', isMajor: true },
  { name: '범주해운 (Pan Continental)', code: 'PCLU', trackingUrl: 'https://www.pancon.co.kr/', category: 'container', region: 'Korea' },
  { name: '남성해운 (Namsung)', code: 'NSSU', trackingUrl: 'https://www.namsung.co.kr/', category: 'container', region: 'Korea' },
  { name: '천경해운 (CK Line)', code: 'CKLU', trackingUrl: 'https://www.ckline.co.kr/', category: 'container', region: 'Korea' },
  { name: '동영해운 (Dong Young)', code: 'DYSH', trackingUrl: 'https://www.pcsline.co.kr/', category: 'container', region: 'Korea' },
  { name: '동진상선 (Dongjin)', code: 'DJSC', trackingUrl: 'http://www.djship.co.kr/', category: 'container', region: 'Korea' },
  { name: 'HS라인 (HS Line)', code: 'HSLN', trackingUrl: 'http://www.hsln.co.kr/', category: 'container', region: 'Korea' },
  // 벌크/탱커 선사
  { name: '팬오션 (Pan Ocean)', code: 'PNOU', trackingUrl: 'https://www.panocean.com/', category: 'container', region: 'Korea' },
  { name: 'SK해운 (SK Shipping)', code: 'SKSH', trackingUrl: 'https://www.skshipping.com/', category: 'container', region: 'Korea' },
  { name: 'KSS해운 (KSS Marine)', code: 'KSSM', trackingUrl: 'https://www.kssline.com/', category: 'container', region: 'Korea' },
  // 자동차운반선
  { name: '유코카캐리어스 (EUKOR)', code: 'EUKO', trackingUrl: 'https://www.eukor.com/', category: 'container', region: 'Korea' },
  { name: '현대글로비스 (Hyundai Glovis)', code: 'GLVS', trackingUrl: 'https://www.glovis.net/', category: 'container', region: 'Korea', isMajor: true },
  // 카페리
  { name: '부관페리 (Pukwan Ferry)', code: 'PKFR', trackingUrl: 'https://www.pukwan.co.kr/', category: 'container', region: 'Korea' },
  { name: '팬스타라인', code: 'PNST', trackingUrl: 'https://www.panstar.co.kr/en/business/express/tracking#', category: 'container', region: 'Korea' },
  { name: '카멜리아라인 (Camellia)', code: 'CMLA', trackingUrl: 'https://www.camellia-line.co.jp/kr/', category: 'container', region: 'Korea' },
  // 중국 페리
  { name: '연운항훼리 (Lianyungang Ferry)', code: 'LYFR', trackingUrl: 'https://www.lygferry.com/freight/search.html', category: 'container', region: 'China' },
];

// BL Prefix → 선사 코드 매핑 (4자리 코드만)
const blPrefixMap: Record<string, string> = {
  // 글로벌 메이저
  'MAEU': 'MAEU', // Maersk
  'MSKU': 'MAEU', // Maersk (alternative)
  'MRKU': 'MAEU', // Maersk (alternative)
  'MAEI': 'MAEU', // Maersk (alternative)
  'MSCU': 'MSCU', // MSC
  'MEDU': 'MSCU', // MSC (alternative)
  'MSDU': 'MSCU', // MSC (alternative)
  'CMDU': 'CMDU', // CMA CGM
  'ANLU': 'CMDU', // CMA CGM (ANL)
  'APHU': 'CMDU', // CMA CGM (APL Hub)
  'COSU': 'COSU', // COSCO
  'CBHU': 'COSU', // COSCO (alternative)
  'CCLU': 'COSU', // COSCO (alternative)
  'CSNU': 'COSU', // COSCO (alternative)
  'HLCU': 'HLCU', // Hapag-Lloyd
  'HLXU': 'HLCU', // Hapag-Lloyd (alternative)
  'ONEY': 'ONEY', // ONE
  'NYKU': 'ONEY', // ONE (NYK)
  'MOLU': 'ONEY', // ONE (MOL)
  'KLLU': 'ONEY', // ONE (K-Line)
  'EGLV': 'EGLV', // Evergreen
  'EGHU': 'EGLV', // Evergreen (alternative)
  'EGSU': 'EGLV', // Evergreen (alternative)
  'EITU': 'EGLV', // Evergreen (alternative)
  'YMLU': 'YMLU', // Yang Ming
  'YMMU': 'YMLU', // Yang Ming (alternative)
  'HDMU': 'HDMU', // HMM
  'HMMU': 'HDMU', // HMM (alternative)
  'ZIMU': 'ZIMU', // ZIM
  'ZCSU': 'ZIMU', // ZIM (alternative)
  'PCIU': 'PCIU', // PIL
  'PILU': 'PCIU', // PIL (alternative)
  'OOLU': 'OOLU', // OOCL
  'OOCU': 'OOLU', // OOCL (alternative)
  'APLU': 'APLU', // APL
  'AELU': 'APLU', // APL (alternative)

  // 한국 선사
  'SKLU': 'SKLU', // Sinokor
  'SNKO': 'SKLU', // Sinokor (alternative prefix)
  'SKOK': 'SKLU', // Sinokor (alternative prefix)
  'KMTU': 'KMTU', // KMTC
  'KMTC': 'KMTU', // KMTC (alternative prefix)
  'SMLM': 'SMLM', // SM Line
  'SMLI': 'SMLM', // SM Line (alternative)
  'HASU': 'HASU', // Heung-A
  'HASL': 'HASU', // Heung-A (alternative)
  'PCLU': 'PCLU', // Pan Continental
  'NSSU': 'NSSU', // Namsung
  'CKLU': 'CKLU', // CK Line

  // 아시아 선사
  'WHLC': 'WHLC', // Wan Hai
  'WHLU': 'WHLC', // Wan Hai (alternative)
  'SITC': 'SITC', // SITC
  'SITU': 'SITC', // SITC (alternative - SITINTA 등)
  'SITI': 'SITC', // SITC (alternative prefix)
  'TSLU': 'TSLU', // T.S. Lines
  'RCLU': 'RCLU', // RCL
  'IALU': 'IALU', // Interasia
  'CNCU': 'CNCU', // CNC Line
  'LYFR': 'LYFR', // 연운항훼리 (Lianyungang Ferry)
  'PNOU': 'PNOU', // Pan Ocean
  'CULU': 'CULU', // CULines
  'MRTU': 'MRTU', // Meratus

  // 일본/대만 선사
  'KKLU': 'KKLU', // Kambara Kisen
  'KWLU': 'KWLU', // Kanway Line

  // 유럽 선사
  'GRIU': 'GRIU', // Grimaldi
  'SAMU': 'SAMU', // Samskip
  'UNFE': 'UNFE', // Unifeeder
  'FINN': 'FINN', // Finnlines
  'ACLU': 'ACLU', // ACL
  'WECL': 'WECL', // WEC Lines

  // 중동/인도
  'ESPU': 'ESPU', // Emirates
  'IRIU': 'IRIU', // IRIS Lines
  'SCIU': 'SCIU', // SCI India

  // 미주 선사
  'CMCU': 'CMCU', // Crowley
  'SMLU': 'SMLU', // Seaboard Marine
  'SEAU': 'SEAU', // Sealand
  'SLND': 'SEAU', // Sealand (alternative)
  'MATS': 'MATS', // Matson
  'TOTE': 'TOTE', // TOTE Maritime
  'TRBR': 'TRBR', // Trailer Bridge
  'PSHI': 'PSHI', // Pasha Hawaii
  'TSLA': 'TSLA', // Tropical Shipping

  // 러시아
  'FESO': 'FESO', // FESCO
  'FESU': 'FESO', // FESCO (alternative)

  // 터키
  'TRKU': 'TRKU', // Turkon
  'ARKU': 'ARKU', // Arkas

  // 기타
  'XPRS': 'XPRS', // X-Press Feeders
  'XPRU': 'XPRS', // X-Press Feeders (alternative)
  'SNTU': 'SNTU', // Sinotrans
  'GLBU': 'GLBU', // Globelink Unimar
  'SWRE': 'SWRE', // Swire Shipping

  // 추가 선사 prefix 매핑
  'GSLU': 'GSLU', // Gold Star Line
  'EMKY': 'EMKY', // Emkay Line
  'MELL': 'MELL', // Mariana Express Lines (PIL)
  'MXCN': 'MXCN', // Maxicon
  'MDKN': 'MDKN', // MEDKON Lines
  'MSNU': 'MSNU', // Messina Line
  'SPIL': 'SPIL', // SPIL
  'SMDR': 'SMDR', // Samudera
  'SRJK': 'SRJK', // Sarjak
  'TNTO': 'TNTO', // Tanto
  'TCIU': 'TCIU', // TCI Seaways
  'TRRS': 'TRRS', // Tarros
  'BLTU': 'BLTU', // Balticon
  'STLT': 'STLT', // Stolt Tank
  'DLRF': 'DLRF', // Dalreftrans
  'NRNT': 'NRNT', // Nirint
  'RMOC': 'RMOC', // Romocean
  'VLTA': 'VLTA', // Volta
  'MACS': 'MACS', // MACS
  'MRGV': 'MRGV', // Marguisa
  'PSLN': 'PSLN', // PSL Navegação
  'TWND': 'TWND', // Tailwind
  'TISL': 'TISL', // TIS-logistic
  'TVSN': 'TVSN', // Transvision
  'SLSD': 'SLSD', // SeaLead
  'SEAD': 'SEAD', // SeaLead (alternative)
  'SHWK': 'SHWK', // Sea Hawk
  'SETH': 'SETH', // SETH Shipping
  'TRTN': 'TRTN', // Triton International
  'HCNY': 'HCNY', // Hecny
  'HEDE': 'HEDE', // Hede
  'INOX': 'INOX', // Inox
  'CRDA': 'CRDA', // Cordelia
  'EXPW': 'EXPW', // Expressway
  'NPDL': 'NPDL', // NPDL
  'OCAX': 'OCAX', // Ocean Axis
  'OSLU': 'OSLU', // Oceanic Star
  'STGL': 'STGL', // STG Logistics
  'UWLU': 'UWLU', // UWL
  'TOPC': 'TOPC', // Topocean
  'TSMR': 'TSMR', // Transmar
  'TASU': 'TASU', // Trans Asia
  'WDSU': 'WDSU', // World Direct
  'WTOU': 'WTOU', // WTO
  'WWAU': 'WWAU', // WorldWide Alliance
  'NSAU': 'NSAU', // National Shipping America
  'NKLN': 'NKLN', // Nauka Lines
  'NCLU': 'NCLU', // NCL
  'NPTN': 'NPTN', // Neptune
  'RYLC': 'RYLC', // Royal Cargo
  'HKRU': 'HKRU', // Hikaru
  'ASYD': 'ASYD', // Asyad
  'AVAN': 'AVAN', // Avana
  'BRHD': 'BRHD', // Bridgehead
  'BLWL': 'BLWL', // Blue Water Lines
  'CRPS': 'CRPS', // Carpenters
  'CSRT': 'CSRT', // Consort
  'GSLN': 'GSLN', // GS Lines
  'MRGT': 'MRGT', // Margarita
  'MNSO': 'MNSO', // Minsheng
  'SNMR': 'SNMR', // Sunmarine
  'YXEL': 'YXEL', // YXE Line
  'XIAN': 'XIAN', // Xi'an
  'ZIMW': 'ZIMW', // ZIM World Freight
  'SFAN': 'SFAN', // Sofrana ANL
  'CONC': 'CONC', // CONCOR
  'DHLG': 'DHLG', // DHL
  'ESLS': 'ESLS', // ESL
  'LXPT': 'LXPT', // LX Pantos

  // 한국 선사 추가
  'DYSH': 'DYSH', // 동영해운
  'DJSC': 'DJSC', // 동진상선
  'HSLN': 'HSLN', // HS라인

  // 특수 선사
  'BAHR': 'BAHR', // Bahri
  'EIMS': 'EIMS', // Eimskip
  'HOEG': 'HOEG', // Höegh
  'MOLA': 'MOLA', // MOL ACE
  'WAWI': 'WAWI', // Wallenius Wilhelmsen
  'GLVS': 'GLVS', // Hyundai Glovis
  'PKFR': 'PKFR', // 부관페리
  'PNST': 'PNST', // 팬스타라인
};

// 선사 코드로 선사 정보 찾기
const findCarrierByCode = (code: string): Carrier | undefined => {
  return containerCarriers.find(c => c.code === code);
};

// BL 번호에서 prefix 추출 (4자리 알파벳만)
const extractBlPrefix = (bl: string): string | null => {
  const cleaned = bl.replace(/[\s-]/g, '').toUpperCase();
  // 4자리만 시도 (3자리는 탐지하지 않음)
  const match4 = cleaned.match(/^([A-Z]{4})/);
  if (match4) {
    return match4[1];
  }
  return null;
};

// 한글 포함 여부 체크
const containsKorean = (text: string): boolean => {
  return /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text);
};

// BL 번호 포맷팅
const formatBl = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

// BL 번호 유효성 검사 (최소 3-4자리 prefix + 알파벳/숫자 혼합)
const validateBlFormat = (bl: string): boolean => {
  const cleaned = bl.replace(/[\s-]/g, '').toUpperCase();
  return /^[A-Z]{3,4}[A-Z0-9]{4,}$/.test(cleaned);
};

// ISO 6346 컨테이너 체크 디지트 검증
const containerCheckDigitMap: Record<string, number> = {
  A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19,
  J: 20, K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29,
  S: 30, T: 31, U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
};

const validateContainerCheckDigit = (containerNo: string): boolean => {
  const cleaned = containerNo.replace(/[\s-]/g, '').toUpperCase();

  // 11자리 컨테이너 번호 (4글자 + 7숫자)
  if (/^[A-Z]{4}[0-9]{7}$/i.test(cleaned)) {
    let sum = 0;
    const chars = cleaned.substring(0, 10);
    for (let i = 0; i < chars.length; i++) {
      const val = containerCheckDigitMap[chars[i]];
      if (val === undefined) return false;
      sum += val * Math.pow(2, i);
    }
    let checkDigit = sum % 11;
    if (checkDigit === 10) checkDigit = 0;
    return checkDigit === parseInt(cleaned.slice(-1));
  }

  // 10자리 컨테이너 번호 (4글자 + 6숫자) - 체크 디지트 없이 유효
  if (/^[A-Z]{4}[0-9]{6}$/i.test(cleaned)) {
    return true;
  }

  return false;
};

// 컨테이너 번호 포맷 체크 (4글자 + 6-7숫자, 끝이 U로 끝나는 prefix)
const isContainerFormat = (input: string): boolean => {
  const cleaned = input.replace(/[\s-]/g, '').toUpperCase();
  // XXX + U + 6-7 숫자 형식 (표준 컨테이너 번호)
  if (/^[A-Z]{3}U[0-9]{6,7}$/i.test(cleaned)) {
    return true;
  }
  // 4글자 + 6-7 숫자 (일반적인 컨테이너 형식)
  if (/^[A-Z]{4}[0-9]{6,7}$/i.test(cleaned)) {
    return true;
  }
  return false;
};

// 입력 타입 감지 (컨테이너 vs B/L)
type InputType = 'container' | 'bol' | 'unknown';
const detectInputType = (input: string): InputType => {
  const cleaned = input.replace(/[\s-]/g, '').toUpperCase();

  // 컨테이너 형식 체크 (XXX + U + 숫자 6-7개)
  if (/^[A-Z]{3}U[0-9]{6,7}$/i.test(cleaned)) {
    return 'container';
  }

  // 4글자 + 숫자만 6-7개 = 컨테이너 가능성
  if (/^[A-Z]{4}[0-9]{6,7}$/i.test(cleaned)) {
    // 체크 디지트 검증으로 확인
    if (validateContainerCheckDigit(cleaned)) {
      return 'container';
    }
    // 6자리 숫자면 컨테이너일 가능성 높음
    if (/^[A-Z]{4}[0-9]{6}$/i.test(cleaned)) {
      return 'container';
    }
  }

  // B/L 형식: 4글자 prefix + 알파벳/숫자 혼합 (예: SITINTA083063G)
  if (/^[A-Z]{4}[A-Z0-9]+$/i.test(cleaned) && cleaned.length >= 8) {
    return 'bol';
  }

  return 'unknown';
};

// 선사별 BL 추적 URL 빌더
const buildBlTrackingUrl = (carrier: Carrier, bl: string): string => {
  const cleaned = bl.replace(/[\s-]/g, '').toUpperCase();

  const urlPatterns: Record<string, () => string> = {
    // 글로벌 메이저
    'MAEU': () => `https://www.maersk.com/tracking/${cleaned}`,
    'MSCU': () => `https://www.msc.com/en/track-a-shipment?agencyPath=msc&link=defined&bookingReference=${cleaned}`,
    'CMDU': () => `https://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=BL&Reference=${cleaned}`,
    'COSU': () => `https://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=BOOKING&number=${cleaned}`,
    'HLCU': () => `https://www.hapag-lloyd.com/en/online-business/track/track-by-booking-solution.html?blno=${cleaned}`,
    'ONEY': () => {
      const trackNo = cleaned.startsWith('ONEY') ? cleaned.slice(4) : cleaned;
      return `https://ecomm.one-line.com/one-ecom/manage-shipment/cargo-tracking?trakNoParam=${trackNo}&trakNoTpCdParam=B`;
    },
    'EGLV': () => `https://ct.shipmentlink.com/servlet/TDB1_CargoTracking.do?TYPE=BL&BL=${cleaned}&NO=${cleaned}&SEL=s_bl`,
    'YMLU': () => `https://www.yangming.com/e-service/track_trace/track_trace_cargo_tracking.aspx?TYPE=BL&NO=${cleaned}`,
    'HDMU': () => `https://www.hmm21.com/cms/business/ebiz/trackTrace/trackTrace/index.jsp?type=bl&number=${cleaned}`,
    'ZIMU': () => `https://www.zim.com/tools/track-a-shipment?consnumber=${cleaned}`,
    'PCIU': () => `https://www.pilship.com/digital-solutions/?tab=customer&id=track-trace&label=containerTandT&module=TrackTraceBL&refNo=${cleaned}`,
    'OOLU': () => `https://www.oocl.com/eng/ourservices/eservices/cargotracking/?bl=${cleaned}`,
    'APLU': () => `https://www.apl.com/ebusiness/tracking?SearchBy=BL&Reference=${cleaned}`,

    // 한국 선사
    'SKLU': () => `https://ebiz.sinokor.co.kr/Tracking?blno=${cleaned}&cntrno=`,
    'KMTU': () => `https://www.ekmtc.com/index.html#/cargo-tracking?searchType=BL&searchNumber=${cleaned}`,
    'SMLM': () => `https://esvc.smlines.com/smline/CUP_HOM_3301.do?blNo=${cleaned}`,
    'HASU': () => `https://ebiz.heungaline.com/Tracking?blno=${cleaned}`,
    'PCLU': () => `http://www.pancon.co.kr/eng/trace/trace.asp?bl=${cleaned}`,
    'NSSU': () => `https://www.namsung.co.kr/cargo/cargoresult?blNo=${cleaned}`,
    'PNOU': () => `https://container.panocean.com/trace?bl=${cleaned}`,
    'DJSC': () => `https://esvc.djship.co.kr/gnoss/CUP_HOM_3301.do?sessLocale=en&trakNoTpCdParam=B&trakNoParam=${cleaned}`,

    // 아시아 선사
    'WHLC': () => `https://www.wanhai.com/views/cargoTrack/CargoTrack.xhtml?bl=${cleaned}`,
    'SITC': () => `https://api.sitcline.com/sitcline/query/cargoTrack?cargoNo=${cleaned}&type=BL`,
    'TSLU': () => `https://www.tslines.com/en/tracking?type=bl&no=${cleaned}`,
    'CNCU': () => `https://www.cnc-line.com/ebusiness/tracking/search?SearchBy=BL&Reference=${cleaned}`,
    'RCLU': () => `https://www.rclgroup.com/tracking/?number=${cleaned}&type=bl`,
    'IALU': () => `https://www.interasia.cc/tracking?bl=${cleaned}`,
    'CULU': () => `https://www.culines.com/en/site/bill?reg=${cleaned}`,
    'MRTU': () => `https://www.meratus.com/en/guest/quick-tracking?query=${cleaned}`,
    'LYFR': () => `https://www.lygferry.com/freight/search.html?bl=${cleaned}`,
    'CRDA': () => `https://cordelialine.com/container-tracking/?contno=${cleaned}`,
    'KKLU': () => `https://algesvc.kambara-kisen.co.jp/gnoss/CUP_HOM_3301.do?redir=Y&trakNoTpCdParam=B&trakNoParam=${cleaned}&sessLocale=en`,
    'HCNY': () => `https://www.hecny.com/en/track-and-trace?keyword=${cleaned}`,
    'INOX': () => `https://www.inoxshipping.com/track-shipment.php?ref=${cleaned}`,
    'LXPT': () => `https://view.lxpantos.com/portal/openapi/getQuickSearch?inpSrch=${cleaned}`,

    // 유럽 선사
    'ACLU': () => `https://www.aclcargo.com/track-cargo/?ShipmentNumber=${cleaned}`,
    'GRIU': () => `https://www.grimaldi.napoli.it/tracking?bl=${cleaned}`,
    'SAMU': () => `https://www.samskip.com/tracking/?number=${cleaned}`,
    'UNFE': () => `https://www.unifeeder.com/track-trace?bl=${cleaned}`,
    'ARKU': () => `https://arkasline.com.tr/en/online-tracking/`,
    'TRKU': () => `https://www.turkon.com/en/track-trace?bl=${cleaned}`,
    'MFTU': () => `https://www.marfret.fr/en/tracking?bl=${cleaned}`,
    'ITMU': () => `https://ct.shipmentlink.com/servlet/TDB1_CargoTracking.do?TYPE=BL&BL=${cleaned}&NO=${cleaned}&SEL=s_bl`,

    // 미주 선사
    'CMCU': () => `https://www.crowley.com/logistics/tracking?bl=${cleaned}`,
    'SMLU': () => `https://www.seaboardmarine.com/tracking/?bl=${cleaned}`,
    'SEAU': () => `https://www.sealandmaersk.com/tracking/${cleaned}`,
    'MATS': () => `https://www.matson.com/shipment-tracking.html?bl=${cleaned}`,
    'TOTE': () => `https://www.totemaritime.com/tracking?bl=${cleaned}`,
    'TRBR': () => `https://www.trailerbridge.com/tracking/?bl=${cleaned}`,
    'PSHI': () => `https://www.pashahawaii.com/tracking?bl=${cleaned}`,
    'TSLA': () => `https://www.tropical.com/eTropical/Tracking?bl=${cleaned}`,

    // 러시아
    'FESO': () => `https://www.fesco.ru/en/clients/tracking?bl=${cleaned}`,

    // 중동/인도
    'ESPU': () => `https://www.emiratesline.com/cargo-tracking/?url=${cleaned}`,
    'SCIU': () => `https://www.shipindia.com/tracking?bl=${cleaned}`,
    'IRIU': () => `https://rocmnl.webtracker.wisegrid.net/Login/Login.aspx?ContainerQuickViewNumber=${cleaned}`,

    // 오세아니아
    'SWRE': () => `https://www.swireshipping.com/tracking?bl=${cleaned}`,
    'ANLU': () => `https://www.anl.com.au/ebusiness/tracking/search?SearchViewModel.Reference=${cleaned}&SearchViewModel.SearchBy=BL`,

    // 기타
    'XPRS': () => `https://www.x-pressfeeders.com/track-and-trace?bl=${cleaned}`,
    'BLWL': () => `https://bluewaterlines.net/Login/BLCntrTracking?RefType=BL&RefID=${cleaned}`,
    'DLRF': () => `https://my.fesco.com/tracking?tab=${cleaned}`,
    'CSRT': () => `https://cpeprd.webtracker.wisegrid.net/Login/Login.aspx?ContainerQuickViewNumber=${cleaned}`,
    'GLBU': () => `https://globelink-unimar.com/online-freight-tracking/?trackId=${cleaned}`,
    'MRGT': () => `https://margritashipping.com/track_record?tracking_number=${cleaned}`,
    'MDKN': () => `https://portal.medkonlines.com/Home/Tracking?ContainerNo=${cleaned}`,
    'NSAU': () => `https://n48prd.webtracker.wisegrid.net/Login/Login.aspx?ContainerQuickViewNumber=${cleaned}`,
    'NPDL': () => `https://nepprd.webtracker.wisegrid.net/Login/Login.aspx?ContainerQuickViewNumber=${cleaned}`,
    'NPTN': () => `https://oms.nbstrans.com/tracerQuery?num=${cleaned}`,
    'PSLN': () => `https://tracking.pslnavegacao.com:8081/tracking_resposta.asp?contrNumber=${cleaned}`,
    'SETH': () => `https://www.sethshipping.com/tracking_shipment?id=${cleaned}`,
    'STLT': () => `https://track.stolttankcontainers.com/trackandtrace/trackbookingfromurl.aspx?SearchValue=${cleaned}`,
    'VLTA': () => `https://voltacontainerline.com/track-shipment/?bill_id=${cleaned}`,
    'TRTN': () => `https://tools.tritoncontainer.com/tritoncontainer/unitStatus/show/${cleaned}`,
    'SEAD': () => `https://www.sea-lead.com/track-shipment/?container_id=${cleaned}`,
    'SLSD': () => `https://www.sea-lead.com/track-shipment/?container_id=${cleaned}`,
    'SPIL': () => `https://www.myspil.com/myspilcom/Front/tracktrace?blorcont=${cleaned}`,

    // 한국 페리/특수
    'CMLA': () => `http://183.111.65.71/clt/CUP_HOM_3301.do?sessLocale=en&trakNoTpCdParam=B&trakNoParam=${cleaned}`,
    'EIMS': () => `https://www.eimskip.com/find-shipment/?id=${cleaned}`,
    'PNST': () => `https://www.panstar.co.kr/en/business/express/tracking#`,
    'MELL': () => `https://www.pilship.com/digital-solutions/?tab=customer&id=track-trace&label=containerTandT&module=TrackTraceBL&refNo=${cleaned}`,
    'DHLG': () => `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${cleaned}`,
  };

  if (urlPatterns[carrier.code]) {
    return urlPatterns[carrier.code]();
  }

  // 기본 fallback: prefix로 선사 찾기
  const prefix = cleaned.substring(0, 4);
  if (blPrefixMap[prefix]) {
    const mappedCode = blPrefixMap[prefix];
    if (urlPatterns[mappedCode]) {
      return urlPatterns[mappedCode]();
    }
  }

  return carrier.trackingUrl;
};

// 컨테이너 번호 전용 추적 URL 빌더
const buildContainerTrackingUrl = (carrier: Carrier, containerNo: string): string => {
  const cleaned = containerNo.replace(/[\s-]/g, '').toUpperCase();

  const urlPatterns: Record<string, () => string> = {
    // 글로벌 메이저
    'MAEU': () => `https://www.maersk.com/tracking/${cleaned}`,
    'MSCU': () => `https://www.msc.com/en/track-a-shipment?agencyPath=msc&link=defined&bookingReference=${cleaned}`,
    'CMDU': () => `https://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=Container&Reference=${cleaned}`,
    'COSU': () => `https://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=CONTAINER&number=${cleaned}`,
    'HLCU': () => `https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html?container=${cleaned}`,
    'ONEY': () => `https://ecomm.one-line.com/one-ecom/manage-shipment/cargo-tracking?trakNoParam=${cleaned}&trakNoTpCdParam=C`,
    'EGLV': () => `https://ct.shipmentlink.com/servlet/TDB1_CargoTracking.do?TYPE=CNTR&CNTR=${cleaned}&NO=${cleaned}&SEL=s_cntr`,
    'YMLU': () => `https://www.yangming.com/e-service/track_trace/track_trace_cargo_tracking.aspx?TYPE=CT&NO=${cleaned}`,
    'HDMU': () => `https://www.hmm21.com/cms/business/ebiz/trackTrace/trackTrace/index.jsp?type=container&number=${cleaned}`,
    'ZIMU': () => `https://www.zim.com/tools/track-a-shipment?consnumber=${cleaned}`,
    'PCIU': () => `https://www.pilship.com/digital-solutions/?tab=customer&id=track-trace&label=containerTandT&module=TrackTraceContainer&refNo=${cleaned}`,
    'OOLU': () => `https://www.oocl.com/eng/ourservices/eservices/cargotracking/?cntr=${cleaned}`,
    'APLU': () => `https://www.apl.com/ebusiness/tracking?SearchBy=Container&Reference=${cleaned}`,

    // 한국 선사
    'SKLU': () => `https://ebiz.sinokor.co.kr/Tracking?blno=&cntrno=${cleaned}`,
    'KMTU': () => `https://www.ekmtc.com/index.html#/cargo-tracking?searchType=CNTR&searchNumber=${cleaned}`,
    'HASU': () => `https://ebiz.heungaline.com/Tracking?cntrno=${cleaned}`,
    'SMLM': () => `https://esvc.smlines.com/smline/CUP_HOM_3301.do?cntrNo=${cleaned}`,
    'PCLU': () => `http://www.pancon.co.kr/eng/trace/trace.asp?cntr=${cleaned}`,
    'NSSU': () => `https://www.namsung.co.kr/cargo/cargoresult?cntrNo=${cleaned}`,
    'PNOU': () => `https://container.panocean.com/trace?cntr=${cleaned}`,
    'DJSC': () => `https://esvc.djship.co.kr/gnoss/CUP_HOM_3301.do?sessLocale=en&trakNoTpCdParam=C&trakNoParam=${cleaned}`,

    // 아시아 선사
    'WHLC': () => `https://www.wanhai.com/views/cargoTrack/CargoTrack.xhtml?cntr=${cleaned}`,
    'SITC': () => `https://api.sitcline.com/sitcline/query/cargoTrack?cargoNo=${cleaned}&type=CNTR`,
    'TSLU': () => `https://www.tslines.com/en/tracking?type=container&no=${cleaned}`,
    'CNCU': () => `https://www.cnc-line.com/ebusiness/tracking/search?SearchBy=Container&Reference=${cleaned}`,
    'RCLU': () => `https://www.rclgroup.com/tracking/?number=${cleaned}&type=container`,
    'IALU': () => `https://www.interasia.cc/tracking?cntr=${cleaned}`,
    'CULU': () => `https://www.culines.com/en/site/bill?reg=${cleaned}`,
    'MRTU': () => `https://www.meratus.com/en/guest/quick-tracking?query=${cleaned}`,
    'CRDA': () => `https://cordelialine.com/container-tracking/?contno=${cleaned}`,
    'KKLU': () => `https://algesvc.kambara-kisen.co.jp/gnoss/CUP_HOM_3301.do?redir=Y&trakNoTpCdParam=C&trakNoParam=${cleaned}&sessLocale=en`,
    'HCNY': () => `https://www.hecny.com/en/track-and-trace?keyword=${cleaned}`,
    'INOX': () => `https://www.inoxshipping.com/track-shipment.php?ref=${cleaned}`,
    'LXPT': () => `https://view.lxpantos.com/portal/openapi/getQuickSearch?inpSrch=${cleaned}`,

    // 유럽 선사
    'ACLU': () => `https://www.aclcargo.com/track-cargo/?ShipmentNumber=${cleaned}`,
    'GRIU': () => `https://www.grimaldi.napoli.it/tracking?container=${cleaned}`,
    'SAMU': () => `https://www.samskip.com/tracking/?number=${cleaned}`,
    'UNFE': () => `https://www.unifeeder.com/track-trace?container=${cleaned}`,
    'FINN': () => `https://www.finnlines.com/freight/tracking?container=${cleaned}`,
    'ARKU': () => `https://arkasline.com.tr/en/online-tracking/`,
    'TRKU': () => `https://www.turkon.com/en/track-trace?container=${cleaned}`,
    'MFTU': () => `https://www.marfret.fr/en/tracking?cntr=${cleaned}`,
    'ITMU': () => `https://ct.shipmentlink.com/servlet/TDB1_CargoTracking.do?TYPE=CNTR&CNTR=${cleaned}&NO=${cleaned}&SEL=s_cntr`,

    // 미주 선사
    'CMCU': () => `https://www.crowley.com/logistics/tracking?container=${cleaned}`,
    'SMLU': () => `https://www.seaboardmarine.com/tracking/?container=${cleaned}`,
    'SEAU': () => `https://www.sealandmaersk.com/tracking/${cleaned}`,
    'MATS': () => `https://www.matson.com/shipment-tracking.html?container=${cleaned}`,
    'TOTE': () => `https://www.totemaritime.com/tracking?cntr=${cleaned}`,
    'TRBR': () => `https://www.trailerbridge.com/tracking/?container=${cleaned}`,
    'PSHI': () => `https://www.pashahawaii.com/tracking?container=${cleaned}`,
    'TSLA': () => `https://www.tropical.com/eTropical/Tracking?container=${cleaned}`,

    // 러시아
    'FESO': () => `https://www.fesco.ru/en/clients/tracking?container=${cleaned}`,

    // 중동/인도
    'ESPU': () => `https://www.emiratesline.com/cargo-tracking/?url=${cleaned}`,
    'SCIU': () => `https://www.shipindia.com/tracking?cntr=${cleaned}`,
    'IRIU': () => `https://rocmnl.webtracker.wisegrid.net/Login/Login.aspx?ContainerQuickViewNumber=${cleaned}`,

    // 오세아니아
    'SWRE': () => `https://www.swireshipping.com/tracking?container=${cleaned}`,
    'ANLU': () => `https://www.anl.com.au/ebusiness/tracking/search?SearchViewModel.Reference=${cleaned}&SearchViewModel.SearchBy=Container`,

    // 기타
    'XPRS': () => `https://www.x-pressfeeders.com/track-and-trace?container=${cleaned}`,
    'BLWL': () => `https://bluewaterlines.net/Login/BLCntrTracking?RefType=Container&RefID=${cleaned}`,
    'DLRF': () => `https://my.fesco.com/tracking?tab=${cleaned}`,
    'CSRT': () => `https://cpeprd.webtracker.wisegrid.net/Login/Login.aspx?ContainerQuickViewNumber=${cleaned}`,
    'GLBU': () => `https://globelink-unimar.com/online-freight-tracking/?trackId=${cleaned}`,
    'MRGT': () => `https://margritashipping.com/track_record?tracking_number=${cleaned}`,
    'MDKN': () => `https://portal.medkonlines.com/Home/Tracking?ContainerNo=${cleaned}`,
    'NSAU': () => `https://n48prd.webtracker.wisegrid.net/Login/Login.aspx?ContainerQuickViewNumber=${cleaned}`,
    'NPDL': () => `https://nepprd.webtracker.wisegrid.net/Login/Login.aspx?ContainerQuickViewNumber=${cleaned}`,
    'NPTN': () => `https://oms.nbstrans.com/tracerQuery?num=${cleaned}`,
    'PSLN': () => `https://tracking.pslnavegacao.com:8081/tracking_resposta.asp?contrNumber=${cleaned}`,
    'SETH': () => `https://www.sethshipping.com/tracking_shipment?id=${cleaned}`,
    'STLT': () => `https://track.stolttankcontainers.com/trackandtrace/trackbookingfromurl.aspx?SearchValue=${cleaned}`,
    'VLTA': () => `https://voltacontainerline.com/track-shipment/?bill_id=${cleaned}`,
    'TRTN': () => `https://tools.tritoncontainer.com/tritoncontainer/unitStatus/show/${cleaned}`,
    'SEAD': () => `https://www.sea-lead.com/track-shipment/?container_id=${cleaned}`,
    'SLSD': () => `https://www.sea-lead.com/track-shipment/?container_id=${cleaned}`,
    'SPIL': () => `https://www.myspil.com/myspilcom/Front/tracktrace?blorcont=${cleaned}`,

    // 한국 페리/특수
    'CMLA': () => `http://183.111.65.71/clt/CUP_HOM_3301.do?sessLocale=en&trakNoTpCdParam=C&trakNoParam=${cleaned}`,
    'EIMS': () => `https://www.eimskip.com/find-shipment/?id=${cleaned}`,
    'PNST': () => `https://www.panstar.co.kr/en/business/express/tracking#`,
    'MELL': () => `https://www.pilship.com/digital-solutions/?tab=customer&id=track-trace&label=containerTandT&module=TrackTraceContainer&refNo=${cleaned}`,
    'DHLG': () => `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${cleaned}`,
  };

  if (urlPatterns[carrier.code]) {
    return urlPatterns[carrier.code]();
  }

  // 기본 fallback: prefix로 선사 찾기
  const prefix = cleaned.substring(0, 4);
  if (blPrefixMap[prefix]) {
    const mappedCode = blPrefixMap[prefix];
    if (urlPatterns[mappedCode]) {
      return urlPatterns[mappedCode]();
    }
  }

  return carrier.trackingUrl;
};

// 자동 BL 지원 선사 코드 목록 (직접 추적 URL이 있는 선사들)
const autoBlCodes = new Set([
  // 글로벌 메이저
  'MAEU', 'MSCU', 'CMDU', 'COSU', 'HLCU', 'ONEY', 'EGLV', 'YMLU', 'HDMU', 'ZIMU',
  'PCIU', 'OOLU', 'APLU',
  // 한국 선사
  'SKLU', 'KMTU', 'SMLM', 'HASU', 'PCLU', 'NSSU', 'PNOU', 'DJSC',
  // 아시아 선사
  'WHLC', 'SITC', 'TSLU', 'CNCU', 'RCLU', 'IALU', 'CULU', 'MRTU', 'LYFR', 'CRDA',
  'KKLU', 'HCNY', 'INOX', 'LXPT',
  // 유럽 선사
  'ACLU', 'GRIU', 'SAMU', 'UNFE', 'FINN', 'ARKU', 'TRKU', 'MFTU', 'ITMU', 'BLWL',
  // 미주 선사
  'CMCU', 'SMLU', 'SEAU', 'MATS', 'TOTE', 'TRBR', 'PSHI', 'TSLA',
  // 러시아/기타
  'FESO', 'XPRS', 'DLRF', 'CSRT', 'GLBU', 'MRGT', 'MDKN', 'NSAU', 'NPDL', 'NPTN',
  'PSLN', 'SETH', 'STLT', 'VLTA', 'TRTN', 'SEAD', 'SLSD', 'SPIL',
  // 중동/인도
  'ESPU', 'SCIU', 'IRIU',
  // 오세아니아
  'SWRE', 'ANLU',
  // 특수 선사
  'CMLA', 'EIMS', 'PNST', 'MELL', 'DHLG',
]);

interface TrackerContainerProps {
  adSlot?: React.ReactNode;
}

const TrackerContainer: React.FC<TrackerContainerProps> = ({ adSlot }) => {
  const [blInput, setBlInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMajorOnly, setShowMajorOnly] = useState(false);
  const [detectedCarrier, setDetectedCarrier] = useState<Carrier | null>(null);
  const [showManualSelect, setShowManualSelect] = useState(false);
  const [showKoreanWarning, setShowKoreanWarning] = useState(false);
  const [inputType, setInputType] = useState<InputType>('unknown');
  const [isValidContainer, setIsValidContainer] = useState(false);

  // BL 입력 처리
  const handleBlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // 한글 입력 감지 시 경고 표시
    if (containsKorean(rawValue)) {
      setShowKoreanWarning(true);
      setTimeout(() => setShowKoreanWarning(false), 1500);
    }

    const formatted = formatBl(rawValue);
    setBlInput(formatted);

    // 입력 타입 감지 (컨테이너 vs B/L)
    const detectedType = detectInputType(formatted);
    setInputType(detectedType);

    // 컨테이너 번호 유효성 검사 (체크 디지트)
    if (detectedType === 'container' && formatted.length === 11) {
      setIsValidContainer(validateContainerCheckDigit(formatted));
    } else {
      setIsValidContainer(detectedType === 'container');
    }

    // 4자리 이상일 때 prefix 감지 (4자리 prefix만 지원)
    if (formatted.length >= 4) {
      const prefix = extractBlPrefix(formatted);
      if (prefix && blPrefixMap[prefix]) {
        const carrierCode = blPrefixMap[prefix];
        const carrier = findCarrierByCode(carrierCode);
        setDetectedCarrier(carrier || null);
        setShowManualSelect(false);
      } else {
        // SCAC 코드가 없으면 자동으로 수동 선택 표시
        setDetectedCarrier(null);
        if (validateBlFormat(formatted) || detectedType === 'container') {
          setShowManualSelect(true);
        }
      }
    } else {
      setDetectedCarrier(null);
      setShowManualSelect(false);
      setInputType('unknown');
    }
  };

  // 추적 실행
  const handleTrack = (carrier?: Carrier) => {
    const targetCarrier = carrier || detectedCarrier;
    if (!targetCarrier) return;

    // 클립보드에 복사 (clipboard API가 없는 환경 대응)
    if (blInput && navigator.clipboard) {
      navigator.clipboard.writeText(blInput).catch(() => {});
    }

    // 입력 타입에 따라 다른 URL 빌더 사용
    let url: string;
    if (!blInput) {
      url = targetCarrier.trackingUrl;
    } else if (inputType === 'container') {
      url = buildContainerTrackingUrl(targetCarrier, blInput);
    } else {
      url = buildBlTrackingUrl(targetCarrier, blInput);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 수동 선택으로 추적
  const handleManualTrack = (carrier: Carrier) => {
    // 클립보드에 복사 (clipboard API가 없는 환경 대응)
    if (blInput && navigator.clipboard) {
      navigator.clipboard.writeText(blInput).catch(() => {});
    }

    // 입력 타입에 따라 다른 URL 빌더 사용
    let url: string;
    if (!blInput) {
      url = carrier.trackingUrl;
    } else if (inputType === 'container') {
      url = buildContainerTrackingUrl(carrier, blInput);
    } else if (validateBlFormat(blInput)) {
      url = buildBlTrackingUrl(carrier, blInput);
    } else {
      url = carrier.trackingUrl;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowManualSelect(false);
  };

  // 필터링된 운송사 목록
  const filteredCarriers = useMemo(() => {
    return containerCarriers.filter(carrier => {
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

  const isValidBl = validateBlFormat(blInput) || inputType === 'container';
  const detectedPrefix = extractBlPrefix(blInput);
  const inputTypeLabel = inputType === 'container' ? 'CNTR' : inputType === 'bol' ? 'B/L' : null;

  return (
    <div className="space-y-4">
      {/* BL 자동 추적 섹션 */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* 설명 영역 */}
          <div className="lg:w-72 shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                <ShipIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="font-bold text-slate-800">B/L · 컨테이너 추적</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              B/L 또는 컨테이너 번호로 선사를 자동 감지합니다.
              <span className="text-slate-400 block mt-0.5">예: <span className="font-mono">MAEU</span>123456789, <span className="font-mono">TCLU</span>1234567</span>
            </p>
          </div>

          {/* 입력 영역 */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3 items-stretch">
            <div className={`relative transition-[flex,width] duration-300 ease-out ${
              blInput && isValidBl ? 'w-full sm:w-[40%] shrink-0' : 'flex-1'
            }`}>
              <input
                type="text"
                placeholder="MAEU123456789"
                value={blInput}
                onChange={handleBlChange}
                maxLength={20}
                className={`w-full h-full px-5 py-3.5 text-lg font-mono bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                  showKoreanWarning
                    ? 'border-orange-400 bg-orange-50 focus:ring-orange-500/20 focus:border-orange-500 animate-pulse'
                    : blInput && !isValidBl && blInput.length >= 4
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-400'
                }`}
              />
              {showKoreanWarning && (
                <div className="absolute left-0 -bottom-6 text-xs text-orange-600 font-medium animate-fade-in">
                  영문/숫자만 입력 가능합니다
                </div>
              )}
              {blInput && (
                <button
                  onClick={() => {
                    setBlInput('');
                    setDetectedCarrier(null);
                    setInputType('unknown');
                    setIsValidContainer(false);
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
            {blInput && isValidBl ? (
              detectedCarrier ? (
                <div className="flex items-stretch gap-2 flex-1 animate-fade-in">
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl flex-1 min-w-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 animate-pulse"></div>
                    <span className="text-sm font-bold text-slate-800 truncate">{detectedCarrier.name}</span>
                    {inputTypeLabel && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        inputType === 'container' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>{inputTypeLabel}</span>
                    )}
                    <span className="text-xs text-blue-600 font-mono bg-blue-100/80 px-2 py-0.5 rounded-md shrink-0">{detectedPrefix}</span>
                  </div>
                  <button
                    onClick={() => handleTrack()}
                    className="px-5 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 shrink-0"
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
                    {inputTypeLabel && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        inputType === 'container' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>{inputTypeLabel}</span>
                    )}
                    <span className="text-xs text-amber-600 font-mono bg-amber-100/80 px-2 py-0.5 rounded-md">{detectedPrefix}</span>
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

      {/* Ad Slot - B/L 추적 섹션 바로 아래 */}
      {adSlot && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {adSlot}
        </div>
      )}

      {/* 수동 선택 모달/섹션 */}
      {showManualSelect && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-700">선사 수동 선택</h3>
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
                placeholder="선사 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-9 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
              {sortedCarriers.map((carrier, idx) => (
                <button
                  key={`${carrier.code}-${idx}`}
                  onClick={() => handleManualTrack(carrier)}
                  className="bg-white rounded border border-slate-200 px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
                >
                  <span className="text-sm text-slate-700 block truncate">{carrier.name}</span>
                  <span className="text-xs text-slate-400 font-mono">{carrier.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 전체 선사 목록 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-700">전체 선사 목록</h3>
              <p className="text-xs text-slate-500">직접 선사를 선택하여 추적 페이지로 이동</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="선사, 코드, 지역 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-9 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Results Count & Major Filter */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-700">{sortedCarriers.length}개</span> 선사
              </p>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showMajorOnly}
                  onChange={(e) => setShowMajorOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/20 cursor-pointer"
                />
                <span className="text-sm text-slate-600 font-medium">주요 선사만</span>
              </label>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium"
              >
                검색 초기화
              </button>
            )}
          </div>

          {/* Carrier Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
            {sortedCarriers.map((carrier, idx) => {
              const hasAutoBl = autoBlCodes.has(carrier.code);
              return (
                <button
                  key={`${carrier.code}-${idx}`}
                  onClick={() => handleManualTrack(carrier)}
                  className={`bg-white rounded border px-2 py-1.5 hover:bg-blue-50 hover:border-blue-300 transition-all text-left group flex items-center gap-1.5 ${
                    hasAutoBl ? 'border-blue-200' : 'border-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-white shrink-0 ${
                    hasAutoBl ? 'bg-blue-600' : 'bg-blue-500'
                  }`}>
                    <ShipIcon className="w-3 h-3" />
                  </div>
                  <span className={`text-xs truncate flex-1 ${
                    hasAutoBl ? 'font-bold text-slate-800' : 'text-slate-700'
                  }`}>{carrier.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{carrier.code}</span>
                </button>
              );
            })}
          </div>

          {/* Empty State */}
          {sortedCarriers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <SearchIcon className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">검색 결과 없음</h3>
              <p className="text-sm text-slate-500 mb-3">"{searchTerm}"에 해당하는 선사를 찾을 수 없습니다.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors"
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

export default TrackerContainer;
export { containerCarriers };

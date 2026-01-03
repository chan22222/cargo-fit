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
  { name: 'Arkas Line', code: 'ARKU', trackingUrl: 'http://arkasline.com.tr/', category: 'container', region: 'Europe' },
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
  { name: 'Eimskip', code: 'EIMS', trackingUrl: 'https://www.eimskip.com/tracking', category: 'container', region: 'Europe' },
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
  { name: 'DBS크루즈페리', code: 'DBSF', trackingUrl: 'https://www.dbsferry.com/kr/', category: 'container', region: 'Korea' },
  { name: '팬스타라인', code: 'PNST', trackingUrl: 'https://www.panstar.co.kr/', category: 'container', region: 'Korea' },
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
  'MSCU': 'MSCU', // MSC
  'MEDU': 'MSCU', // MSC (alternative)
  'CMDU': 'CMDU', // CMA CGM
  'COSU': 'COSU', // COSCO
  'HLCU': 'HLCU', // Hapag-Lloyd
  'ONEY': 'ONEY', // ONE
  'EGLV': 'EGLV', // Evergreen
  'YMLU': 'YMLU', // Yang Ming
  'HDMU': 'HDMU', // HMM
  'ZIMU': 'ZIMU', // ZIM
  'PCIU': 'PCIU', // PIL
  'OOLU': 'OOLU', // OOCL
  'APLU': 'APLU', // APL
  // 한국 선사
  'SKLU': 'SKLU', // Sinokor
  'SNKO': 'SKLU', // Sinokor (alternative prefix)
  'KMTU': 'KMTU', // KMTC
  'KMTC': 'KMTU', // KMTC (alternative prefix)
  'SMLM': 'SMLM', // SM Line
  'HASU': 'HASU', // Heung-A
  'PCLU': 'PCLU', // Pan Continental
  'NSSU': 'NSSU', // Namsung
  'CKLU': 'CKLU', // CK Line
  // 아시아 선사
  'WHLC': 'WHLC', // Wan Hai
  'SITC': 'SITC', // SITC
  'SITI': 'SITC', // SITC (alternative prefix)
  'TSLU': 'TSLU', // T.S. Lines
  'RCLU': 'RCLU', // RCL
  'IALU': 'IALU', // Interasia
  'CNCU': 'CNCU', // CNC Line
  'LYFR': 'LYFR', // 연운항훼리 (Lianyungang Ferry)
  // 기타
  'CMCU': 'CMCU', // Crowley
  'SMLU': 'SMLU', // Seaboard Marine
  'SEAU': 'SEAU', // Sealand
  'FESO': 'FESO', // FESCO
  'ESPU': 'ESPU', // Emirates
  'TRKU': 'TRKU', // Turkon
  'XPRS': 'XPRS', // X-Press Feeders
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

// BL 번호 유효성 검사 (최소 3-4자리 prefix + 숫자)
const validateBlFormat = (bl: string): boolean => {
  const cleaned = bl.replace(/[\s-]/g, '').toUpperCase();
  return /^[A-Z]{3,4}[A-Z0-9]{4,}$/.test(cleaned);
};

// 선사별 BL 추적 URL 빌더
const buildBlTrackingUrl = (carrier: Carrier, bl: string): string => {
  const cleaned = bl.replace(/[\s-]/g, '').toUpperCase();

  const urlPatterns: Record<string, (base: string) => string> = {
    'MAEU': () => `https://www.maersk.com/tracking/${cleaned}`,
    'MSCU': () => `https://www.msc.com/en/track-a-shipment?agencyPath=msc&link=defined&bookingReference=${cleaned}`,
    'CMDU': () => `https://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=BL&Reference=${cleaned}`,
    'COSU': () => `https://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=BOOKING&number=${cleaned}`,
    'HLCU': () => `https://www.hapag-lloyd.com/en/online-business/track/track-by-booking-solution.html?blno=${cleaned}`,
    'ONEY': () => {
      // ONEY prefix 제거 (ONEYSELF... → SELF...)
      const trackNo = cleaned.startsWith('ONEY') ? cleaned.slice(4) : cleaned;
      return `https://ecomm.one-line.com/one-ecom/manage-shipment/cargo-tracking?trakNoParam=${trackNo}&trakNoTpCdParam=B`;
    },
    'EGLV': () => `https://ct.shipmentlink.com/servlet/TDB1_CargoTracking.do?TYPE=BL&BL=${cleaned}`,
    'YMLU': () => `https://www.yangming.com/en/esolution/cargo_tracking?service=${cleaned}`,
    'HDMU': () => `https://www.hmm21.com/cms/business/ebiz/trackTrace/trackTrace/index.jsp?type=bl&number=${cleaned}`,
    'ZIMU': () => `https://www.zim.com/tools/track-a-shipment?consnumber=${cleaned}`,
    'PCIU': () => `https://www.pilship.com/digital-solutions/?tab=customer&id=track-trace&label=containerTandT&module=TrackTraceBL&refNo=${cleaned}`,
    'OOLU': () => `https://www.oocl.com/eng/ourservices/eservices/cargotracking/?bl=${cleaned}`,
    'APLU': () => `https://www.apl.com/ebusiness/tracking?SearchBy=BL&Reference=${cleaned}`,
    // 한국 선사
    'SKLU': () => `https://ebiz.sinokor.co.kr/Tracking?blno=${cleaned}&cntrno=`,
    'KMTU': () => `https://www.ekmtc.com/index.html#/cargo-tracking?searchType=BL&searchNumber=${cleaned}`,
    'SMLM': () => `https://esvc.smlines.com/smline/CUP_HOM_3301.do?sessLocale=ko`,
    'HASU': () => `http://www.heungaline.com/eng/tracking.asp?bl=${cleaned}`,
    // 아시아 선사
    'WHLC': () => `https://www.wanhai.com/views/cargoTrack/CargoTrack.xhtml?bl=${cleaned}`,
    'SITC': () => `https://ebusiness.sitcline.com/#/topMenu/cargoTrack`,
    'TSLU': () => `https://www.tslines.com/en/tracking?bl=${cleaned}`,
    'CNCU': () => `https://www.cnc-line.com/ebusiness/tracking/search?SearchBy=BL&Reference=${cleaned}`,
    'LYFR': () => `https://www.lygferry.com/freight/search.html`,
    // 기타
    'CMCU': () => `https://www.crowley.com/logistics/tracking/?bl=${cleaned}`,
    'SMLU': () => `https://www.seaboardmarine.com/tracking/?bl=${cleaned}`,
    'SEAU': () => `https://www.sealandmaersk.com/tracking/${cleaned}`,
    'ESPU': () => `https://www.emiratesline.com/track-trace/?bl=${cleaned}`,
    'TRKU': () => `https://www.turkon.com/en/track-trace?bl=${cleaned}`,
    'XPRS': () => `https://www.x-pressfeeders.com/track-and-trace?bl=${cleaned}`,
  };

  if (urlPatterns[carrier.code]) {
    return urlPatterns[carrier.code](carrier.trackingUrl);
  }
  return carrier.trackingUrl;
};

// 자동 BL 지원 선사 코드 목록
const autoBlCodes = new Set([
  'MAEU', 'MSCU', 'CMDU', 'COSU', 'HLCU', 'ONEY', 'EGLV', 'YMLU', 'HDMU', 'ZIMU',
  'PCIU', 'OOLU', 'APLU', 'SKLU', 'KMTU', 'SMLM', 'HASU', 'WHLC', 'SITC', 'TSLU',
  'CMCU', 'SMLU', 'SEAU', 'ESPU', 'TRKU', 'XPRS', 'CNCU', 'LYFR'
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
        if (validateBlFormat(formatted)) {
          setShowManualSelect(true);
        }
      }
    } else {
      setDetectedCarrier(null);
      setShowManualSelect(false);
    }
  };

  // 추적 실행
  const handleTrack = (carrier?: Carrier) => {
    const targetCarrier = carrier || detectedCarrier;
    if (!targetCarrier) return;

    // 클립보드에 복사
    if (blInput) {
      navigator.clipboard.writeText(blInput).catch(() => {});
    }

    const url = blInput ? buildBlTrackingUrl(targetCarrier, blInput) : targetCarrier.trackingUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 수동 선택으로 추적
  const handleManualTrack = (carrier: Carrier) => {
    // 클립보드에 복사
    if (blInput) {
      navigator.clipboard.writeText(blInput).catch(() => {});
    }

    const url = blInput && validateBlFormat(blInput)
      ? buildBlTrackingUrl(carrier, blInput)
      : carrier.trackingUrl;
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

  const isValidBl = validateBlFormat(blInput);
  const detectedPrefix = extractBlPrefix(blInput);

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
              <h3 className="font-bold text-slate-800">B/L 자동 추적</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              B/L 번호 앞 4자리 코드로 선사를 자동 감지합니다.
              <span className="text-slate-400 block mt-0.5">예: <span className="font-mono">MAEU</span>123456789, <span className="font-mono">COSU</span>1234567890</span>
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

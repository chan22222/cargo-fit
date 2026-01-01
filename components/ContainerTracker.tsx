import React, { useState, useMemo } from 'react';

// 운송사 데이터
interface Carrier {
  name: string;
  code: string;
  trackingUrl: string;
  category: 'container' | 'air' | 'courier' | 'post' | 'rail';
  region?: string;
  isMajor?: boolean; // 주요 운송사 여부
}

const carriers: Carrier[] = [
  // ============ 컨테이너 선사 (Container Lines) ============
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
  { name: 'ACL (Atlantic Container Line)', code: 'ACLU', trackingUrl: 'https://www.aclcargo.com/tracking', category: 'container', region: 'Europe' },
  { name: 'Aladin Express', code: 'ALAD', trackingUrl: 'https://www.aborientmt.com/tracking', category: 'container', region: 'Asia' },
  { name: 'ANL Container Line', code: 'ANLU', trackingUrl: 'https://www.anl.com.au/tracking', category: 'container', region: 'Oceania' },
  { name: 'APL', code: 'APLU', trackingUrl: 'https://www.apl.com/ebusiness/tracking', category: 'container', region: 'Global', isMajor: true },
  { name: 'Arkas Line', code: 'ARKU', trackingUrl: 'https://www.arkasline.com.tr/en/track-trace', category: 'container', region: 'Europe' },
  { name: 'Asyad Line', code: 'ASYD', trackingUrl: 'https://www.asyadshipping.om/tracking', category: 'container', region: 'Middle East' },
  { name: 'Avana Logistek', code: 'AVAN', trackingUrl: 'https://www.avanalogistek.com/tracking', category: 'container', region: 'Asia' },
  // B
  { name: 'Balticon', code: 'BLTU', trackingUrl: 'https://www.balticon.ee/tracking', category: 'container', region: 'Europe' },
  { name: 'Blue Water Lines', code: 'BLWL', trackingUrl: 'https://www.bws.net/tracking', category: 'container', region: 'Europe' },
  { name: 'Bridgehead Logistics', code: 'BRHD', trackingUrl: 'https://www.bridgehead.com/tracking', category: 'container', region: 'Americas' },
  // C
  { name: 'CAI International', code: 'CAIU', trackingUrl: 'https://www.capps.com/tracking', category: 'container', region: 'Global' },
  { name: 'Camellia Line', code: 'CMLA', trackingUrl: 'https://www.camellia-line.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Canadian National Railway', code: 'CNRU', trackingUrl: 'https://www.cn.ca/tracking', category: 'container', region: 'Americas' },
  { name: 'Canadian Pacific Railway', code: 'CPRS', trackingUrl: 'https://www.cpr.ca/tracking', category: 'container', region: 'Americas' },
  { name: 'cargo-partner', code: 'CGPT', trackingUrl: 'https://www.cargo-partner.com/tracking', category: 'container', region: 'Europe' },
  { name: 'Carpenters Shipping', code: 'CRPS', trackingUrl: 'https://www.carpentersshipping.com/tracking', category: 'container', region: 'Europe' },
  { name: 'CARU Containers', code: 'CARU', trackingUrl: 'https://www.carucontainers.com/tracking', category: 'container', region: 'Europe' },
  { name: 'CCIS', code: 'CCIS', trackingUrl: 'https://www.container-leasing.de/tracking', category: 'container', region: 'Europe' },
  { name: 'CNC (Cheng Lie Navigation)', code: 'CNCU', trackingUrl: 'https://www.cnc-line.com/tracking', category: 'container', region: 'Asia' },
  { name: 'CONCOR (India)', code: 'CONC', trackingUrl: 'https://www.concorindia.co.in/tracking', category: 'container', region: 'Asia' },
  { name: 'Consort Express Lines', code: 'CSRT', trackingUrl: 'https://www.consortexpress.com/tracking', category: 'container', region: 'Africa' },
  { name: 'Cordelia Shipping', code: 'CRDA', trackingUrl: 'https://www.cordeliacontainers.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Crowley', code: 'CMCU', trackingUrl: 'https://www.crowley.com/logistics/tracking/', category: 'container', region: 'Americas' },
  { name: 'CS Leasing', code: 'CSLU', trackingUrl: 'https://www.csleasing.com/tracking', category: 'container', region: 'Global' },
  { name: 'CULines', code: 'CULU', trackingUrl: 'https://www.culines.com/tracking', category: 'container', region: 'Asia' },
  // D
  { name: 'Dalreftrans', code: 'DLRF', trackingUrl: 'https://www.dalreftrans.ru/tracking', category: 'container', region: 'Russia' },
  { name: 'DB Schenker', code: 'DBSC', trackingUrl: 'https://www.dbschenker.com/tracking', category: 'container', region: 'Global' },
  { name: 'DHL Global Forwarding', code: 'DHLG', trackingUrl: 'https://www.dhl.com/tracking', category: 'container', region: 'Global' },
  { name: 'Dong Young Shipping', code: 'DYSH', trackingUrl: 'https://www.dongyoung.co.kr/tracking', category: 'container', region: 'Asia' },
  { name: 'Dongjin Shipping', code: 'DJSC', trackingUrl: 'https://www.dongjin.com/tracking', category: 'container', region: 'Asia' },
  // E
  { name: 'Econ Shipping', code: 'ECON', trackingUrl: 'https://www.econship.com/tracking', category: 'container', region: 'Asia' },
  { name: 'ECU Worldwide', code: 'ECUW', trackingUrl: 'https://www.ecuworldwide.com/tracking', category: 'container', region: 'Global' },
  { name: 'Emirates Shipping Line', code: 'ESPU', trackingUrl: 'https://www.emiratesline.com/track-trace/', category: 'container', region: 'Middle East' },
  { name: 'Emkay Line', code: 'EMKY', trackingUrl: 'https://www.emkayline.com/tracking', category: 'container', region: 'Asia' },
  { name: 'ESL Shipping', code: 'ESLS', trackingUrl: 'https://www.eslshipping.com/tracking', category: 'container', region: 'Europe' },
  { name: 'Expressway', code: 'EXPW', trackingUrl: 'https://www.expressway.com/tracking', category: 'container', region: 'Asia' },
  // F
  { name: 'FESCO', code: 'FESO', trackingUrl: 'https://www.fesco.ru/en/clients/tracking/', category: 'container', region: 'Russia' },
  { name: 'Finnlines', code: 'FINN', trackingUrl: 'https://www.finnlines.com/tracking', category: 'container', region: 'Europe' },
  { name: 'FlexiVan', code: 'FLXV', trackingUrl: 'https://www.flexivan.com/tracking', category: 'container', region: 'Americas' },
  // G
  { name: 'Globelink Unimar', code: 'GLBU', trackingUrl: 'https://www.globelink-unimar.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Gold Star Line', code: 'GSLU', trackingUrl: 'https://www.gsl.net/tracking', category: 'container', region: 'Asia' },
  { name: 'Grimaldi Lines', code: 'GRIU', trackingUrl: 'https://www.grimaldi-lines.com/tracking/', category: 'container', region: 'Europe' },
  { name: 'GS Lines', code: 'GSLN', trackingUrl: 'https://www.gslines.com/tracking', category: 'container', region: 'Asia' },
  // H
  { name: 'Hecny Group', code: 'HCNY', trackingUrl: 'https://www.hecny.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Hede Shipping', code: 'HEDE', trackingUrl: 'https://www.hedeshipping.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Heung-A Line', code: 'HASU', trackingUrl: 'https://www.heung-a.com/cargo/tracking', category: 'container', region: 'Asia' },
  { name: 'Hikaru Shipping', code: 'HKRU', trackingUrl: 'https://www.hikaru-shipping.co.jp/tracking', category: 'container', region: 'Asia' },
  { name: 'Hillebrand Gori', code: 'HLBG', trackingUrl: 'https://www.hillebrandgori.com/tracking', category: 'container', region: 'Global' },
  { name: 'HS LINE', code: 'HSLN', trackingUrl: 'https://www.hsline.co.kr/tracking', category: 'container', region: 'Asia' },
  // I
  { name: 'Inox Shipping', code: 'INOX', trackingUrl: 'https://www.inoxshipping.com/tracking', category: 'container', region: 'Europe' },
  { name: 'Interasia Lines', code: 'IALU', trackingUrl: 'https://www.interasia.cc/tracking', category: 'container', region: 'Asia' },
  { name: 'Interport', code: 'IPRT', trackingUrl: 'https://www.interport.com/tracking', category: 'container', region: 'Americas' },
  { name: 'IRISL', code: 'IRIU', trackingUrl: 'https://www.irisl.net/tracking', category: 'container', region: 'Middle East' },
  { name: 'Italia Marittima', code: 'ITMU', trackingUrl: 'https://www.italiamarittima.it/tracking', category: 'container', region: 'Europe' },
  // K
  { name: 'Kambara Kisen', code: 'KKLU', trackingUrl: 'https://www.kambarakisen.co.jp/tracking', category: 'container', region: 'Asia' },
  { name: 'Kanway Line', code: 'KWLU', trackingUrl: 'https://www.kanwayshipping.com/tracking', category: 'container', region: 'Asia' },
  { name: 'KiwiRail', code: 'KIWI', trackingUrl: 'https://www.kiwirail.co.nz/tracking', category: 'container', region: 'Oceania' },
  { name: 'Korea Marine Transport', code: 'KMTU', trackingUrl: 'https://www.ekmtc.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Kuehne + Nagel', code: 'KNLU', trackingUrl: 'https://www.kuehne-nagel.com/tracking', category: 'container', region: 'Global' },
  // L
  { name: 'Leschaco', code: 'LSCO', trackingUrl: 'https://www.leschaco.com/tracking', category: 'container', region: 'Europe' },
  { name: 'LX Pantos', code: 'LXPT', trackingUrl: 'https://www.lxpantos.com/tracking', category: 'container', region: 'Asia' },
  // M
  { name: 'MACS Shipping', code: 'MACS', trackingUrl: 'https://www.macship.com/tracking', category: 'container', region: 'Africa' },
  { name: 'Maldives Ports', code: 'MLDP', trackingUrl: 'https://www.maldivesports.mv/tracking', category: 'container', region: 'Asia' },
  { name: 'Marfret', code: 'MFTU', trackingUrl: 'https://www.marfret.fr/tracking', category: 'container', region: 'Europe' },
  { name: 'Margarita Shipping', code: 'MRGT', trackingUrl: 'https://www.margaritashipping.com/tracking', category: 'container', region: 'Americas' },
  { name: 'Marguisa', code: 'MRGV', trackingUrl: 'https://www.marguisa.com/tracking', category: 'container', region: 'Europe' },
  { name: 'Mariana Express Lines', code: 'MELL', trackingUrl: 'https://www.mel.com.sg/tracking', category: 'container', region: 'Asia' },
  { name: 'Matson', code: 'MATS', trackingUrl: 'https://www.matson.com/shipment-tracking.html', category: 'container', region: 'Pacific' },
  { name: 'Maxicon Container Line', code: 'MXCN', trackingUrl: 'https://www.maxicon.in/tracking', category: 'container', region: 'Asia' },
  { name: 'MEDKON Lines', code: 'MDKN', trackingUrl: 'https://www.medkonlines.com/tracking', category: 'container', region: 'Europe' },
  { name: 'Meratus Line', code: 'MRTU', trackingUrl: 'https://www.meratusline.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Messina Line', code: 'MSNU', trackingUrl: 'https://www.messinaline.it/tracking', category: 'container', region: 'Europe' },
  { name: 'Minsheng Ocean Shipping', code: 'MNSO', trackingUrl: 'https://www.minshengocean.com/tracking', category: 'container', region: 'Asia' },
  // N
  { name: 'Namsung Shipping', code: 'NSSU', trackingUrl: 'https://www.namsung.co.kr/tracking', category: 'container', region: 'Asia' },
  { name: 'National Shipping of America', code: 'NSAU', trackingUrl: 'https://www.nsa-shipping.com/tracking', category: 'container', region: 'Americas' },
  { name: 'Nauka Lines', code: 'NKLN', trackingUrl: 'https://www.naukalines.com/tracking', category: 'container', region: 'Europe' },
  { name: 'NCL (Shipping Line)', code: 'NCLU', trackingUrl: 'https://www.nclshipping.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Neptune Logistics', code: 'NPTN', trackingUrl: 'https://www.neptunelogistics.com/tracking', category: 'container', region: 'Africa' },
  { name: 'Nirint Shipping', code: 'NRNT', trackingUrl: 'https://www.nirint.com/tracking', category: 'container', region: 'Europe' },
  { name: 'NPDL', code: 'NPDL', trackingUrl: 'https://www.npdl.co.in/tracking', category: 'container', region: 'Asia' },
  // O
  { name: 'Ocean Axis', code: 'OCAX', trackingUrl: 'https://www.oceanaxis.in/tracking', category: 'container', region: 'Asia' },
  { name: 'Oceanic Star Line', code: 'OSLU', trackingUrl: 'https://www.oceanicstarline.com/tracking', category: 'container', region: 'Americas' },
  // P
  { name: 'Pan Continental Shipping', code: 'PCLU', trackingUrl: 'https://www.pancon.co.kr/tracking', category: 'container', region: 'Asia' },
  { name: 'Pan Ocean', code: 'PNOU', trackingUrl: 'https://www.panocean.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Pasha Hawaii', code: 'PSHI', trackingUrl: 'https://www.pashahawaii.com/tracking', category: 'container', region: 'Pacific' },
  { name: 'PSL Navegação', code: 'PSLN', trackingUrl: 'https://www.psl.pt/tracking', category: 'container', region: 'Europe' },
  // R
  { name: 'RCL (Regional Container Lines)', code: 'RCLU', trackingUrl: 'https://www.rclgroup.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Romocean', code: 'RMOC', trackingUrl: 'https://www.romocean.ro/tracking', category: 'container', region: 'Europe' },
  { name: 'Royal Cargo', code: 'RYLC', trackingUrl: 'https://www.royalcargo.ph/tracking', category: 'container', region: 'Asia' },
  // S
  { name: 'Samskip', code: 'SAMU', trackingUrl: 'https://www.samskip.com/tracking', category: 'container', region: 'Europe' },
  { name: 'Samudera Shipping', code: 'SMDR', trackingUrl: 'https://www.samudera.id/tracking', category: 'container', region: 'Asia' },
  { name: 'Sarjak Container Lines', code: 'SRJK', trackingUrl: 'https://www.sarjak.com/tracking', category: 'container', region: 'Asia' },
  { name: 'SCI (Shipping Corp of India)', code: 'SCIU', trackingUrl: 'https://www.shipindia.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Sea Hawk Lines', code: 'SHWK', trackingUrl: 'https://www.seahawklines.com/tracking', category: 'container', region: 'Americas' },
  { name: 'Seaboard Marine', code: 'SMLU', trackingUrl: 'https://www.seaboardmarine.com/tracking/', category: 'container', region: 'Americas' },
  { name: 'Seaco', code: 'SEAC', trackingUrl: 'https://www.seacoglobal.com/tracking', category: 'container', region: 'Global' },
  { name: 'SeaCube', code: 'SCUB', trackingUrl: 'https://www.seacubecontainers.com/tracking', category: 'container', region: 'Global' },
  { name: 'Sealand (Maersk)', code: 'SEAU', trackingUrl: 'https://www.sealandmaersk.com/tracking/', category: 'container', region: 'Americas' },
  { name: 'SeaLead Shipping', code: 'SLSD', trackingUrl: 'https://www.sealead.com/tracking', category: 'container', region: 'Asia' },
  { name: 'SETH Shipping', code: 'SETH', trackingUrl: 'https://www.sfrlines.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Silkargo Logistics', code: 'SLKG', trackingUrl: 'https://www.silkargo.com.my/tracking', category: 'container', region: 'Asia' },
  { name: 'Sinokor Merchant Marine', code: 'SKLU', trackingUrl: 'https://ebiz.sinokor.co.kr/Tracking', category: 'container', region: 'Asia' },
  { name: 'Sinotrans', code: 'SNTU', trackingUrl: 'https://www.sinotrans.com/tracking', category: 'container', region: 'Asia' },
  { name: 'SITC', code: 'SITC', trackingUrl: 'https://api.sitcline.com/sitcline/query/cargoTrack', category: 'container', region: 'Asia' },
  { name: 'SM Line', code: 'SMLM', trackingUrl: 'https://www.smlines.com/cargo-tracking', category: 'container', region: 'Asia' },
  { name: 'Sofrana ANL', code: 'SFAN', trackingUrl: 'https://www.sofrana-anl.com/tracking', category: 'container', region: 'Oceania' },
  { name: 'SPIL (Salam Pacific)', code: 'SPIL', trackingUrl: 'https://www.spil.co.id/tracking', category: 'container', region: 'Asia' },
  { name: 'STG Logistics', code: 'STGL', trackingUrl: 'https://www.stglogistics.com/tracking', category: 'container', region: 'Americas' },
  { name: 'Stolt Tank Containers', code: 'STLT', trackingUrl: 'https://www.stolt-nielsen.com/tracking', category: 'container', region: 'Global' },
  { name: 'Sunmarine Shipping', code: 'SNMR', trackingUrl: 'https://www.sunmarine-shipping.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Swire Shipping', code: 'SWRE', trackingUrl: 'https://www.swireshipping.com/tracking', category: 'container', region: 'Oceania' },
  // T
  { name: 'T.S. Lines', code: 'TSLU', trackingUrl: 'https://www.tslines.com/en/tracking', category: 'container', region: 'Asia' },
  { name: 'TAILWIND Shipping', code: 'TWND', trackingUrl: 'https://www.tailwind.com.tr/tracking', category: 'container', region: 'Europe' },
  { name: 'Tanto Intim Line', code: 'TNTO', trackingUrl: 'https://www.tanto.co.id/tracking', category: 'container', region: 'Asia' },
  { name: 'Tarros', code: 'TRRS', trackingUrl: 'https://www.tarros.it/tracking', category: 'container', region: 'Europe' },
  { name: 'TCI Seaways', code: 'TCIU', trackingUrl: 'https://www.tciseaways.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Textainer', code: 'TXTU', trackingUrl: 'https://www.textainer.com/tracking', category: 'container', region: 'Global' },
  { name: 'TIS-logistic', code: 'TISL', trackingUrl: 'https://www.tis-logistic.com/tracking', category: 'container', region: 'Europe' },
  { name: 'Topocean', code: 'TOPC', trackingUrl: 'https://www.topocean.com/tracking', category: 'container', region: 'Americas' },
  { name: 'TOTE Maritime', code: 'TOTE', trackingUrl: 'https://www.totemaritime.com/tracking', category: 'container', region: 'Americas' },
  { name: 'Touax', code: 'TOUX', trackingUrl: 'https://www.touax.com/tracking', category: 'container', region: 'Europe' },
  { name: 'Trailer Bridge', code: 'TRBR', trackingUrl: 'https://www.trailerbridge.com/tracking', category: 'container', region: 'Americas' },
  { name: 'Trans Asia Shipping', code: 'TASU', trackingUrl: 'https://www.transasia-shipping.com/tracking', category: 'container', region: 'Asia' },
  { name: 'TransContainer', code: 'TRCU', trackingUrl: 'https://www.trcont.com/tracking', category: 'container', region: 'Russia' },
  { name: 'Transmar', code: 'TSMR', trackingUrl: 'https://www.transmar.com.tr/tracking', category: 'container', region: 'Europe' },
  { name: 'Transvision Shipping', code: 'TVSN', trackingUrl: 'https://www.transvision.com.eg/tracking', category: 'container', region: 'Middle East' },
  { name: 'Triton International', code: 'TRTN', trackingUrl: 'https://www.tritoninternational.com/tracking', category: 'container', region: 'Global' },
  { name: 'Tropical Shipping', code: 'TSLA', trackingUrl: 'https://www.tropical.com/eTropical/Tracking', category: 'container', region: 'Caribbean' },
  { name: 'Turkon Line', code: 'TRKU', trackingUrl: 'https://www.turkon.com/en/track-trace', category: 'container', region: 'Europe' },
  // U
  { name: 'UES International', code: 'UESI', trackingUrl: 'https://www.aborientmt.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Unifeeder', code: 'UNFE', trackingUrl: 'https://www.unifeeder.com/track-trace', category: 'container', region: 'Europe' },
  { name: 'UWL', code: 'UWLU', trackingUrl: 'https://www.shipsuwl.com/tracking', category: 'container', region: 'Americas' },
  // V
  { name: 'Volta Shipping', code: 'VLTA', trackingUrl: 'https://www.voltacontainer.com/tracking', category: 'container', region: 'Africa' },
  // W
  { name: 'W.E.C. Lines', code: 'WECL', trackingUrl: 'https://www.weclines.com/tracking', category: 'container', region: 'Europe' },
  { name: 'Wan Hai Lines', code: 'WHLC', trackingUrl: 'https://www.wanhai.com/views/cargoTrack/CargoTrack.xhtml', category: 'container', region: 'Asia' },
  { name: 'White Line', code: 'WHLN', trackingUrl: 'https://www.whiteline.co.kr/tracking', category: 'container', region: 'Asia' },
  { name: 'World Direct Shipping', code: 'WDSU', trackingUrl: 'https://www.worlddirectshipping.com/tracking', category: 'container', region: 'Americas' },
  { name: 'World Transport Overseas', code: 'WTOU', trackingUrl: 'https://www.wto.be/tracking', category: 'container', region: 'Europe' },
  { name: 'WorldWide Alliance', code: 'WWAU', trackingUrl: 'https://www.worldwidealliance.com/tracking', category: 'container', region: 'Global' },
  // X
  { name: 'X-Press Feeders', code: 'XPRS', trackingUrl: 'https://www.x-pressfeeders.com/track-and-trace', category: 'container', region: 'Global' },
  { name: 'Xi\'an International', code: 'XIAN', trackingUrl: 'https://www.xainternational.com/tracking', category: 'container', region: 'Asia' },
  // Y
  { name: 'YXE Line', code: 'YXEL', trackingUrl: 'https://www.yxeline.com/tracking', category: 'container', region: 'Asia' },
  // Z
  { name: 'ZIM World Freight', code: 'ZIMW', trackingUrl: 'https://www.zim.com/tools/track-a-shipment', category: 'container', region: 'Global' },

  // ============ B/L 추적 추가 (특수 선사) ============
  { name: 'Bahri (National Shipping)', code: 'BAHR', trackingUrl: 'https://www.bahri.sa/tracking', category: 'container', region: 'Middle East' },
  { name: 'CK LINE', code: 'CKLN', trackingUrl: 'https://www.ckline.co.kr/tracking', category: 'container', region: 'Asia' },
  { name: 'Eimskip', code: 'EIMS', trackingUrl: 'https://www.eimskip.com/tracking', category: 'container', region: 'Europe' },
  { name: 'EUKOR Car Carriers', code: 'EUKO', trackingUrl: 'https://www.eukor.com/tracking', category: 'container', region: 'Global' },
  { name: 'G2 Ocean', code: 'G2OC', trackingUrl: 'https://www.g2ocean.com/tracking', category: 'container', region: 'Global' },
  { name: 'Höegh Autoliners', code: 'HOEG', trackingUrl: 'https://www.hoeghautoliners.com/tracking', category: 'container', region: 'Global' },
  { name: 'MOL ACE', code: 'MOLA', trackingUrl: 'https://www.molgroup.com/tracking', category: 'container', region: 'Asia' },
  { name: 'Wallenius Wilhelmsen', code: 'WAWI', trackingUrl: 'https://www.walleniuswilhelmsen.com/tracking', category: 'container', region: 'Global' },

  // ============ 한국 선사 (Korean Lines) ============
  // 컨테이너 선사
  { name: 'HMM (현대상선)', code: 'HDMU', trackingUrl: 'https://www.hmm21.com/cms/business/ebiz/trackTrace/trackTrace/index.jsp', category: 'container', region: 'Korea', isMajor: true },
  { name: '장금상선 (Sinokor)', code: 'SKLU', trackingUrl: 'https://ebiz.sinokor.co.kr/tracking', category: 'container', region: 'Korea', isMajor: true },
  { name: '고려해운 (KMTC)', code: 'KMTU', trackingUrl: 'https://www.ekmtc.com/index.html#/cargo-tracking', category: 'container', region: 'Korea', isMajor: true },
  { name: 'SM상선 (SM Line)', code: 'SMLM', trackingUrl: 'https://www.smlines.com/tracking', category: 'container', region: 'Korea', isMajor: true },
  { name: '흥아해운 (Heung-A)', code: 'HASU', trackingUrl: 'https://www.heung-a.com/', category: 'container', region: 'Korea', isMajor: true },
  { name: '범주해운 (Pan Continental)', code: 'PCLU', trackingUrl: 'https://www.pancon.co.kr/', category: 'container', region: 'Korea' },
  { name: '남성해운 (Namsung)', code: 'NSSU', trackingUrl: 'https://www.namsung.co.kr/', category: 'container', region: 'Korea' },
  { name: '천경해운 (CK Line)', code: 'CKLU', trackingUrl: 'https://www.ckline.co.kr/', category: 'container', region: 'Korea' },
  { name: '동영해운 (Dong Young)', code: 'DYSH', trackingUrl: 'https://www.pcsline.co.kr/', category: 'container', region: 'Korea' },
  { name: '동진상선 (Dongjin)', code: 'DJSC', trackingUrl: 'https://www.dongjin.com/', category: 'container', region: 'Korea' },
  { name: 'HS라인 (HS Line)', code: 'HSLN', trackingUrl: 'https://www.hsline.co.kr/', category: 'container', region: 'Korea' },
  // 벌크/탱커 선사
  { name: '팬오션 (Pan Ocean)', code: 'PNOU', trackingUrl: 'https://www.panocean.com/', category: 'container', region: 'Korea' },
  { name: 'SK해운 (SK Shipping)', code: 'SKSH', trackingUrl: 'https://www.skshipping.com/', category: 'container', region: 'Korea' },
  { name: '대한해운 (Korea Line)', code: 'KLCS', trackingUrl: 'https://www.korealine.co.kr/', category: 'container', region: 'Korea' },
  { name: '폴라리스쉬핑 (Polaris)', code: 'PLRS', trackingUrl: 'https://www.polarisshipping.co.kr/', category: 'container', region: 'Korea' },
  { name: 'KSS해운 (KSS Marine)', code: 'KSSM', trackingUrl: 'https://www.kssline.com/', category: 'container', region: 'Korea' },
  { name: '에이치라인해운 (H-Line)', code: 'HLIN', trackingUrl: 'https://www.hlineshipping.com/', category: 'container', region: 'Korea' },
  // 자동차운반선
  { name: '유코카캐리어스 (EUKOR)', code: 'EUKO', trackingUrl: 'https://www.eukor.com/', category: 'container', region: 'Korea' },
  { name: '현대글로비스 (Hyundai Glovis)', code: 'GLVS', trackingUrl: 'https://www.glovis.net/', category: 'container', region: 'Korea', isMajor: true },
  // 카페리
  { name: '부관페리 (Pukwan Ferry)', code: 'PKFR', trackingUrl: 'https://www.pukwan.co.kr/', category: 'container', region: 'Korea' },
  { name: 'DBS크루즈페리', code: 'DBSF', trackingUrl: 'https://www.dbsferry.com/kr/', category: 'container', region: 'Korea' },
  { name: '팬스타라인', code: 'PNST', trackingUrl: 'https://www.panstar.co.kr/', category: 'container', region: 'Korea' },
  { name: '카멜리아라인 (Camellia)', code: 'CMLA', trackingUrl: 'https://www.camellia-line.co.jp/kr/', category: 'container', region: 'Korea' },

  // ============ 항공화물 (Air Cargo) ============
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
  { name: 'Finnair Cargo', code: 'AY', trackingUrl: 'https://cargo.finnair.com/tracking', category: 'air', region: 'Europe' },
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
  { name: 'MASkargo', code: 'MH', trackingUrl: 'https://www.maskargo.com/tracking', category: 'air', region: 'Asia' },
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
  { name: 'Swiss WorldCargo', code: 'LX', trackingUrl: 'https://www.swissworldcargo.com/tracking', category: 'air', region: 'Europe' },
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
  { name: 'Vietnam Airlines Cargo', code: 'VN', trackingUrl: 'https://cargo.vietnamairlines.com/tracking', category: 'air', region: 'Asia' },
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

  // ============ 특송/택배 (Courier/Express) ============
  { name: 'DHL Express', code: 'DHL', trackingUrl: 'https://www.dhl.com/kr-ko/home/tracking.html', category: 'courier', region: 'Global', isMajor: true },
  { name: 'FedEx', code: 'FDX', trackingUrl: 'https://www.fedex.com/en-kr/tracking.html', category: 'courier', region: 'Global', isMajor: true },
  { name: 'UPS', code: 'UPS', trackingUrl: 'https://www.ups.com/track', category: 'courier', region: 'Global', isMajor: true },
  { name: 'TNT (FedEx)', code: 'TNT', trackingUrl: 'https://www.tnt.com/express/ko_kr/site/shipping-tools/tracking.html', category: 'courier', region: 'Global', isMajor: true },
  { name: 'DB Schenker', code: 'DBS', trackingUrl: 'https://www.dbschenker.com/global/tracking', category: 'courier', region: 'Global', isMajor: true },
  { name: 'Kuehne + Nagel', code: 'KN', trackingUrl: 'https://onlineservices.kuehne-nagel.com/public-tracking/', category: 'courier', region: 'Global', isMajor: true },
  { name: 'DSV', code: 'DSV', trackingUrl: 'https://www.dsv.com/en/tools/track-and-trace', category: 'courier', region: 'Global', isMajor: true },
  { name: 'Expeditors', code: 'EXPO', trackingUrl: 'https://www.expeditors.com/tracking', category: 'courier', region: 'Global' },
  { name: 'CH Robinson', code: 'CHRW', trackingUrl: 'https://www.chrobinson.com/en/navisphere-carrier/shipment-tracking/', category: 'courier', region: 'Global' },
  { name: 'Nippon Express', code: 'NX', trackingUrl: 'https://www.nipponexpress.com/service/tracking/', category: 'courier', region: 'Asia' },
  { name: 'Yusen Logistics', code: 'YLG', trackingUrl: 'https://www.yusen-logistics.com/tracking/', category: 'courier', region: 'Asia' },
  { name: 'Kintetsu World Express', code: 'KWE', trackingUrl: 'https://www.kwe.com/tracking/', category: 'courier', region: 'Asia' },
  { name: 'CEVA Logistics', code: 'CEVA', trackingUrl: 'https://www.cevalogistics.com/en/tools-resources/tracking', category: 'courier', region: 'Global' },
  { name: 'Bollore Logistics', code: 'BOLL', trackingUrl: 'https://www.bollore-logistics.com/en/tracking/', category: 'courier', region: 'Global' },
  { name: 'Panalpina (DSV)', code: 'PAN', trackingUrl: 'https://www.dsv.com/en/tools/track-and-trace', category: 'courier', region: 'Global' },
  { name: 'Kerry Logistics', code: 'KLOG', trackingUrl: 'https://www.kerrylogistics.com/track-trace/', category: 'courier', region: 'Asia' },
  { name: 'Agility', code: 'AGIL', trackingUrl: 'https://www.agility.com/en/tools/track-and-trace/', category: 'courier', region: 'Global' },
  { name: 'Hellmann Worldwide', code: 'HWLD', trackingUrl: 'https://www.hellmann.com/en/tracking', category: 'courier', region: 'Global' },
  { name: 'SF Express', code: 'SF', trackingUrl: 'https://www.sf-express.com/kr/ko/dynamic_function/waybill/', category: 'courier', region: 'Asia', isMajor: true },
  { name: 'YTO Express', code: 'YTO', trackingUrl: 'https://www.yto.net.cn/en/parcelTracking.html', category: 'courier', region: 'Asia' },
  { name: 'ZTO Express', code: 'ZTO', trackingUrl: 'https://www.zto.com/en/express/expressQuery', category: 'courier', region: 'Asia' },
  { name: 'CJ Logistics', code: 'CJ', trackingUrl: 'https://www.cjlogistics.com/ko/tool/parcel/tracking', category: 'courier', region: 'Korea', isMajor: true },
  { name: '한진택배', code: 'HANJIN', trackingUrl: 'https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do', category: 'courier', region: 'Korea', isMajor: true },
  { name: '롯데택배', code: 'LOTTE', trackingUrl: 'https://www.lotteglogis.com/home/reservation/tracking/linkView', category: 'courier', region: 'Korea', isMajor: true },
  { name: '로젠택배', code: 'LOGEN', trackingUrl: 'https://www.ilogen.com/web/personal/trace', category: 'courier', region: 'Korea', isMajor: true },
  { name: '우체국 EMS', code: 'EPOST', trackingUrl: 'https://service.epost.go.kr/trace.RetrieveEmsRi498.postal', category: 'courier', region: 'Korea', isMajor: true },

  // ============ 우편/EMS (Post/EMS) ============
  // 아시아
  { name: 'Korea Post (우체국)', code: 'KPOST', trackingUrl: 'https://service.epost.go.kr/trace.RetrieveRegiPrclDeliv.postal', category: 'post', region: 'Korea', isMajor: true },
  { name: 'Japan Post', code: 'JPPOST', trackingUrl: 'https://www.post.japanpost.jp/english/', category: 'post', region: 'Japan', isMajor: true },
  { name: 'China Post', code: 'CNPOST', trackingUrl: 'http://english.chinapost.com.cn/', category: 'post', region: 'China', isMajor: true },
  { name: 'Hong Kong Post', code: 'HKPOST', trackingUrl: 'https://www.hongkongpost.hk/', category: 'post', region: 'Hong Kong', isMajor: true },
  { name: 'Macau CTT', code: 'MOPOST', trackingUrl: 'https://www.ctt.gov.mo/', category: 'post', region: 'Macau' },
  { name: 'Taiwan Post', code: 'TWPOST', trackingUrl: 'https://www.post.gov.tw/', category: 'post', region: 'Taiwan', isMajor: true },
  { name: 'Singapore Post', code: 'SGPOST', trackingUrl: 'https://www.singpost.com/', category: 'post', region: 'Singapore', isMajor: true },
  { name: 'Malaysia Pos', code: 'MYPOST', trackingUrl: 'https://www.pos.com.my/', category: 'post', region: 'Malaysia' },
  { name: 'Thailand Post', code: 'THPOST', trackingUrl: 'https://www.thailandpost.co.th/', category: 'post', region: 'Thailand', isMajor: true },
  { name: 'Vietnam Post', code: 'VNPOST', trackingUrl: 'http://www.vnpost.vn/', category: 'post', region: 'Vietnam' },
  { name: 'Philippines Post', code: 'PHPOST', trackingUrl: 'https://www.phlpost.gov.ph/', category: 'post', region: 'Philippines' },
  { name: 'Indonesia Pos', code: 'IDPOST', trackingUrl: 'https://www.posindonesia.co.id/', category: 'post', region: 'Indonesia' },
  { name: 'India Post', code: 'INPOST', trackingUrl: 'https://www.indiapost.gov.in/', category: 'post', region: 'India' },
  { name: 'Pakistan Post', code: 'PKPOST', trackingUrl: 'https://www.pakpost.gov.pk/', category: 'post', region: 'Pakistan' },
  { name: 'Bangladesh Post', code: 'BDPOST', trackingUrl: 'http://www.bdpost.gov.bd/', category: 'post', region: 'Bangladesh' },
  { name: 'Sri Lanka Post', code: 'LKPOST', trackingUrl: 'https://slpost.gov.lk/', category: 'post', region: 'Sri Lanka' },
  { name: 'Nepal Post', code: 'NPPOST', trackingUrl: 'https://www.gpo.gov.np/', category: 'post', region: 'Nepal' },
  { name: 'Myanmar Post', code: 'MMPOST', trackingUrl: 'https://myanmarpost.com.mm/', category: 'post', region: 'Myanmar' },
  { name: 'Cambodia Post', code: 'KHPOST', trackingUrl: 'https://cambodiapost.com.kh/', category: 'post', region: 'Cambodia' },
  { name: 'Brunei Post', code: 'BNPOST', trackingUrl: 'http://www.post.gov.bn/', category: 'post', region: 'Brunei' },
  { name: 'Mongolia Post', code: 'MNPOST', trackingUrl: 'http://www.mongolpost.mn/', category: 'post', region: 'Mongolia' },
  { name: 'Maldives Post', code: 'MVPOST', trackingUrl: 'https://www.maldivespost.com/', category: 'post', region: 'Maldives' },
  { name: 'Bhutan Post', code: 'BTPOST', trackingUrl: 'http://www.bhutanpost.bt/', category: 'post', region: 'Bhutan' },
  // 중동
  { name: 'UAE Emirates Post', code: 'AEPOST', trackingUrl: 'https://www.emiratespost.ae/', category: 'post', region: 'UAE' },
  { name: 'Saudi Arabia SPL', code: 'SAPOST', trackingUrl: 'https://splonline.com.sa/', category: 'post', region: 'Saudi Arabia' },
  { name: 'Qatar Post', code: 'QAPOST', trackingUrl: 'https://qatarpost.qa/', category: 'post', region: 'Qatar' },
  { name: 'Kuwait Post', code: 'KWPOST', trackingUrl: 'http://moc.gov.kw/', category: 'post', region: 'Kuwait' },
  { name: 'Bahrain Post', code: 'BHPOST', trackingUrl: 'http://www.bahrainpost.gov.bh/', category: 'post', region: 'Bahrain' },
  { name: 'Oman Post', code: 'OMPOST', trackingUrl: 'https://www.omanpost.om/', category: 'post', region: 'Oman' },
  { name: 'Jordan Post', code: 'JOPOST', trackingUrl: 'https://jordanpost.com.jo/', category: 'post', region: 'Jordan' },
  { name: 'Lebanon Liban Post', code: 'LBPOST', trackingUrl: 'https://www.libanpost.com/', category: 'post', region: 'Lebanon' },
  { name: 'Israel Post', code: 'ILPOST', trackingUrl: 'https://israelpost.co.il/', category: 'post', region: 'Israel' },
  { name: 'Iran Post', code: 'IRPOST', trackingUrl: 'https://www.post.ir/', category: 'post', region: 'Iran' },
  { name: 'Iraq Post', code: 'IQPOST', trackingUrl: 'https://post.iq/en/', category: 'post', region: 'Iraq' },
  { name: 'Turkey PTT', code: 'TRPOST', trackingUrl: 'https://www.ptt.gov.tr/', category: 'post', region: 'Turkey' },
  // 유럽
  { name: 'UK Royal Mail', code: 'GBPOST', trackingUrl: 'https://www.royalmail.com/', category: 'post', region: 'UK', isMajor: true },
  { name: 'Germany Deutsche Post', code: 'DEPOST', trackingUrl: 'https://www.deutschepost.de/', category: 'post', region: 'Germany', isMajor: true },
  { name: 'France La Poste', code: 'FRPOST', trackingUrl: 'https://laposte.fr/', category: 'post', region: 'France', isMajor: true },
  { name: 'Italy Poste', code: 'ITPOST', trackingUrl: 'https://www.poste.it/', category: 'post', region: 'Italy' },
  { name: 'Spain Correos', code: 'ESPOST', trackingUrl: 'https://www.correos.es/', category: 'post', region: 'Spain' },
  { name: 'Portugal CTT', code: 'PTPOST', trackingUrl: 'https://www.ctt.pt/', category: 'post', region: 'Portugal' },
  { name: 'Netherlands PostNL', code: 'NLPOST', trackingUrl: 'https://postnl.post/', category: 'post', region: 'Netherlands' },
  { name: 'Belgium bpost', code: 'BEPOST', trackingUrl: 'https://www.bpost.be/', category: 'post', region: 'Belgium' },
  { name: 'Luxembourg Post', code: 'LUPOST', trackingUrl: 'https://www.post.lu/', category: 'post', region: 'Luxembourg' },
  { name: 'Switzerland Swiss Post', code: 'CHPOST', trackingUrl: 'https://www.post.ch/', category: 'post', region: 'Switzerland' },
  { name: 'Austria Post', code: 'ATPOST', trackingUrl: 'https://www.post.at/en/', category: 'post', region: 'Austria' },
  { name: 'Poland Poczta', code: 'PLPOST', trackingUrl: 'https://www.poczta-polska.pl/', category: 'post', region: 'Poland' },
  { name: 'Czech Česká Pošta', code: 'CZPOST', trackingUrl: 'https://www.ceskaposta.cz/', category: 'post', region: 'Czech' },
  { name: 'Slovakia Posta', code: 'SKPOST', trackingUrl: 'https://www.posta.sk/', category: 'post', region: 'Slovakia' },
  { name: 'Hungary Posta', code: 'HUPOST', trackingUrl: 'https://posta.hu/', category: 'post', region: 'Hungary' },
  { name: 'Romania Posta', code: 'ROPOST', trackingUrl: 'https://www.posta-romana.ro/', category: 'post', region: 'Romania' },
  { name: 'Bulgaria Post', code: 'BGPOST', trackingUrl: 'https://www.bgpost.bg/', category: 'post', region: 'Bulgaria' },
  { name: 'Greece ELTA', code: 'GRPOST', trackingUrl: 'https://www.elta.gr/', category: 'post', region: 'Greece' },
  { name: 'Croatia Posta', code: 'HRPOST', trackingUrl: 'https://www.posta.hr/', category: 'post', region: 'Croatia' },
  { name: 'Slovenia Pošta', code: 'SIPOST', trackingUrl: 'https://www.posta.si/', category: 'post', region: 'Slovenia' },
  { name: 'Serbia Pošta', code: 'RSPOST', trackingUrl: 'https://www.posta.rs/', category: 'post', region: 'Serbia' },
  { name: 'Bosnia Posta', code: 'BAPOST', trackingUrl: 'https://www.posta.ba/', category: 'post', region: 'Bosnia' },
  { name: 'North Macedonia Posta', code: 'MKPOST', trackingUrl: 'http://www.posta.com.mk/', category: 'post', region: 'North Macedonia' },
  { name: 'Montenegro Pošta', code: 'MEPOST', trackingUrl: 'http://postacg.me', category: 'post', region: 'Montenegro' },
  { name: 'Albania Post', code: 'ALPOST', trackingUrl: 'https://www.postashqiptare.al/', category: 'post', region: 'Albania' },
  { name: 'Ireland An Post', code: 'IEPOST', trackingUrl: 'https://www.anpost.com/', category: 'post', region: 'Ireland' },
  { name: 'Denmark PostNord', code: 'DKPOST', trackingUrl: 'https://www.postnord.dk/', category: 'post', region: 'Denmark' },
  { name: 'Sweden PostNord', code: 'SEPOST', trackingUrl: 'https://www.postnord.se/', category: 'post', region: 'Sweden' },
  { name: 'Norway Posten', code: 'NOPOST', trackingUrl: 'https://www.posten.no/', category: 'post', region: 'Norway' },
  { name: 'Finland Posti', code: 'FIPOST', trackingUrl: 'https://www.posti.fi/', category: 'post', region: 'Finland' },
  { name: 'Iceland Posturinn', code: 'ISPOST', trackingUrl: 'https://posturinn.is/', category: 'post', region: 'Iceland' },
  { name: 'Estonia Omniva', code: 'EEPOST', trackingUrl: 'https://www.omniva.ee/eng', category: 'post', region: 'Estonia' },
  { name: 'Latvia Pasts', code: 'LVPOST', trackingUrl: 'https://www.pasts.lv/', category: 'post', region: 'Latvia' },
  { name: 'Lithuania Post', code: 'LTPOST', trackingUrl: 'https://www.post.lt/', category: 'post', region: 'Lithuania' },
  { name: 'Ukraine Ukrposhta', code: 'UAPOST', trackingUrl: 'https://www.ukrposhta.ua/', category: 'post', region: 'Ukraine' },
  { name: 'Moldova Posta', code: 'MDPOST', trackingUrl: 'https://www.posta.md/', category: 'post', region: 'Moldova' },
  { name: 'Georgia Post', code: 'GEPOST', trackingUrl: 'https://www.gpost.ge/', category: 'post', region: 'Georgia' },
  { name: 'Armenia HayPost', code: 'AMPOST', trackingUrl: 'https://www.haypost.am/', category: 'post', region: 'Armenia' },
  { name: 'Azerbaijan AzerPost', code: 'AZPOST', trackingUrl: 'https://www.azerpost.az/', category: 'post', region: 'Azerbaijan' },
  { name: 'Kazakhstan Post', code: 'KZPOST', trackingUrl: 'https://post.kz/', category: 'post', region: 'Kazakhstan' },
  { name: 'Uzbekistan Pochta', code: 'UZPOST', trackingUrl: 'https://www.pochta.uz/', category: 'post', region: 'Uzbekistan' },
  { name: 'Kyrgyzstan Post', code: 'KGPOST', trackingUrl: 'https://post.kg/', category: 'post', region: 'Kyrgyzstan' },
  { name: 'Cyprus Post', code: 'CYPOST', trackingUrl: 'https://www.cypruspost.post/', category: 'post', region: 'Cyprus' },
  { name: 'Malta Post', code: 'MTPOST', trackingUrl: 'https://www.maltapost.com/', category: 'post', region: 'Malta' },
  { name: 'Jersey Post', code: 'JEPOST', trackingUrl: 'https://www.jerseypost.com/', category: 'post', region: 'Jersey' },
  { name: 'Gibraltar Post', code: 'GIPOST', trackingUrl: 'https://post.gi/', category: 'post', region: 'Gibraltar' },
  { name: 'Liechtenstein Post', code: 'LIPOST', trackingUrl: 'https://post.li/', category: 'post', region: 'Liechtenstein' },
  { name: 'San Marino Poste', code: 'SMPOST', trackingUrl: 'https://www.poste.sm/', category: 'post', region: 'San Marino' },
  { name: 'Vatican Poste', code: 'VAPOST', trackingUrl: 'https://www.postevaticane.va/en/', category: 'post', region: 'Vatican' },
  { name: 'Faroe Islands Posta', code: 'FOPOST', trackingUrl: 'https://www.posta.fo/', category: 'post', region: 'Faroe Islands' },
  { name: 'Greenland Tusass', code: 'GLPOST', trackingUrl: 'https://www.tusass.gl/', category: 'post', region: 'Greenland' },
  { name: 'Åland Post', code: 'AXPOST', trackingUrl: 'https://www.alandpost.ax/', category: 'post', region: 'Åland' },
  // 미주
  { name: 'USPS', code: 'USPOST', trackingUrl: 'https://www.usps.com/', category: 'post', region: 'USA', isMajor: true },
  { name: 'Canada Post', code: 'CAPOST', trackingUrl: 'https://www.canadapost-postescanada.ca/', category: 'post', region: 'Canada', isMajor: true },
  { name: 'Mexico Correos', code: 'MXPOST', trackingUrl: 'http://www.correosdemexico.com.mx/', category: 'post', region: 'Mexico' },
  { name: 'Brazil Correios', code: 'BRPOST', trackingUrl: 'https://www.correios.com.br/', category: 'post', region: 'Brazil' },
  { name: 'Argentina Correo', code: 'ARPOST', trackingUrl: 'https://www.correoargentino.com.ar/', category: 'post', region: 'Argentina' },
  { name: 'Chile Correos', code: 'CLPOST', trackingUrl: 'https://www.correos.cl/', category: 'post', region: 'Chile' },
  { name: 'Colombia 4-72', code: 'COPOST', trackingUrl: 'https://www.4-72.com.co/', category: 'post', region: 'Colombia' },
  { name: 'Peru SERPOST', code: 'PEPOST', trackingUrl: 'http://www.serpost.com.pe/', category: 'post', region: 'Peru' },
  { name: 'Ecuador Correos', code: 'ECPOST', trackingUrl: 'https://www.serviciopostal.gob.ec/', category: 'post', region: 'Ecuador' },
  { name: 'Bolivia Correos', code: 'BOPOST', trackingUrl: 'https://correos.gob.bo/', category: 'post', region: 'Bolivia' },
  { name: 'Paraguay Correo', code: 'PYPOST', trackingUrl: 'http://www.correoparaguayo.gov.py/', category: 'post', region: 'Paraguay' },
  { name: 'Uruguay Correo', code: 'UYPOST', trackingUrl: 'https://www.correo.com.uy/', category: 'post', region: 'Uruguay' },
  { name: 'Venezuela Ipostel', code: 'VEPOST', trackingUrl: 'http://www.ipostel.gob.ve/', category: 'post', region: 'Venezuela' },
  { name: 'Costa Rica Correos', code: 'CRPOST', trackingUrl: 'https://correos.go.cr/', category: 'post', region: 'Costa Rica' },
  { name: 'Panama Correos', code: 'PAPOST', trackingUrl: 'https://www.correospanama.gob.pa/', category: 'post', region: 'Panama' },
  { name: 'Guatemala Correos', code: 'GTPOST', trackingUrl: 'http://www.correosytelegrafos.civ.gob.gt/', category: 'post', region: 'Guatemala' },
  { name: 'Honduras Honducor', code: 'HNPOST', trackingUrl: 'http://www.honducor.gob.hn/', category: 'post', region: 'Honduras' },
  { name: 'El Salvador Correos', code: 'SVPOST', trackingUrl: 'https://www.correos.gob.sv/', category: 'post', region: 'El Salvador' },
  { name: 'Nicaragua Correos', code: 'NIPOST', trackingUrl: 'http://www.correos.gob.ni/', category: 'post', region: 'Nicaragua' },
  { name: 'Cuba Correos', code: 'CUPOST', trackingUrl: 'https://www.correos.cu/', category: 'post', region: 'Cuba' },
  { name: 'Dominican Inposdom', code: 'DOPOST', trackingUrl: 'http://inposdom.gob.do/', category: 'post', region: 'Dominican Republic' },
  { name: 'Jamaica Post', code: 'JMPOST', trackingUrl: 'https://www.jamaicapost.gov.jm/', category: 'post', region: 'Jamaica' },
  { name: 'T&T Post', code: 'TTPOST', trackingUrl: 'https://ttpost.net/', category: 'post', region: 'Trinidad and Tobago' },
  { name: 'Bahamas Postal', code: 'BSPOST', trackingUrl: 'https://www.bahamaspostal.gov.bs/', category: 'post', region: 'Bahamas' },
  { name: 'Barbados Post', code: 'BBPOST', trackingUrl: 'https://www.gov.bb/Departments/post-office', category: 'post', region: 'Barbados' },
  { name: 'Bermuda Post', code: 'BMPOST', trackingUrl: 'https://www.bermudapost.bm/', category: 'post', region: 'Bermuda' },
  { name: 'Cayman Post', code: 'KYPOST', trackingUrl: 'http://www.caymanpost.gov.ky/', category: 'post', region: 'Cayman Islands' },
  { name: 'Aruba Post', code: 'AWPOST', trackingUrl: 'https://www.postaruba.com/', category: 'post', region: 'Aruba' },
  { name: 'Curaçao Post', code: 'CWPOST', trackingUrl: 'https://www.cpostinternational.com/', category: 'post', region: 'Curaçao' },
  { name: 'Guyana Post', code: 'GYPOST', trackingUrl: 'https://guypost.gy/', category: 'post', region: 'Guyana' },
  { name: 'Suriname Surpost', code: 'SRPOST', trackingUrl: 'https://www.surpost.com/', category: 'post', region: 'Suriname' },
  // 오세아니아
  { name: 'Australia Post', code: 'AUPOST', trackingUrl: 'https://auspost.com.au/', category: 'post', region: 'Australia', isMajor: true },
  { name: 'New Zealand Post', code: 'NZPOST', trackingUrl: 'https://www.nzpost.co.nz/', category: 'post', region: 'New Zealand' },
  { name: 'Fiji Post', code: 'FJPOST', trackingUrl: 'https://www.postfiji.com.fj/', category: 'post', region: 'Fiji' },
  { name: 'Samoa Post', code: 'WSPOST', trackingUrl: 'https://www.samoapost.ws/', category: 'post', region: 'Samoa' },
  { name: 'Tonga Post', code: 'TOPOST', trackingUrl: 'http://tongapost.to/', category: 'post', region: 'Tonga' },
  { name: 'Vanuatu Post', code: 'VUPOST', trackingUrl: 'https://www.vanuatupost.vu/', category: 'post', region: 'Vanuatu' },
  { name: 'Solomon Post', code: 'SBPOST', trackingUrl: 'https://www.solomonpost.com.sb/', category: 'post', region: 'Solomon Islands' },
  { name: 'Nauru Post', code: 'NRPOST', trackingUrl: 'https://www.naurupost.nr/', category: 'post', region: 'Nauru' },
  { name: 'New Caledonia OPT', code: 'NCPOST', trackingUrl: 'https://www.opt.nc/courrier', category: 'post', region: 'New Caledonia' },
  { name: 'French Polynesia', code: 'PFPOST', trackingUrl: 'https://www.farerata.pf/', category: 'post', region: 'French Polynesia' },
  // 아프리카
  { name: 'South Africa Post', code: 'ZAPOST', trackingUrl: 'https://www.postoffice.co.za/', category: 'post', region: 'South Africa' },
  { name: 'Egypt Post', code: 'EGPOST', trackingUrl: 'https://www.egyptpost.org/', category: 'post', region: 'Egypt' },
  { name: 'Morocco Poste', code: 'MAPOST', trackingUrl: 'https://www.poste.ma/', category: 'post', region: 'Morocco' },
  { name: 'Tunisia Poste', code: 'TNPOST', trackingUrl: 'http://www.poste.tn/', category: 'post', region: 'Tunisia' },
  { name: 'Algeria Post', code: 'DZPOST', trackingUrl: 'https://www.poste.dz/', category: 'post', region: 'Algeria' },
  { name: 'Ethiopia Post', code: 'ETPOST', trackingUrl: 'https://ethio.post/', category: 'post', region: 'Ethiopia' },
  { name: 'Kenya Post', code: 'KEPOST', trackingUrl: 'https://www.posta.co.ke/', category: 'post', region: 'Kenya' },
  { name: 'Tanzania Post', code: 'TZPOST', trackingUrl: 'https://www.posta.co.tz/', category: 'post', region: 'Tanzania' },
  { name: 'Uganda Post', code: 'UGPOST', trackingUrl: 'https://www.ugapost.co.ug/', category: 'post', region: 'Uganda' },
  { name: 'Ghana Post', code: 'GHPOST', trackingUrl: 'https://ghanapost.com.gh/', category: 'post', region: 'Ghana' },
  { name: 'Senegal La Poste', code: 'SNPOST', trackingUrl: 'https://www.laposte.sn/', category: 'post', region: 'Senegal' },
  { name: 'Côte d\'Ivoire Post', code: 'CIPOST', trackingUrl: 'https://laposte.ci.post/', category: 'post', region: 'Ivory Coast' },
  { name: 'Cameroon Campost', code: 'CMPOST', trackingUrl: 'http://www.campost.cm/', category: 'post', region: 'Cameroon' },
  { name: 'Mauritius Post', code: 'MUPOST', trackingUrl: 'https://www.mauritiuspost.mu/', category: 'post', region: 'Mauritius' },
  { name: 'Seychelles Post', code: 'SCPOST', trackingUrl: 'https://www.seychelles-post.com/', category: 'post', region: 'Seychelles' },
  { name: 'Rwanda I-Posita', code: 'RWPOST', trackingUrl: 'http://i-posita.rw/', category: 'post', region: 'Rwanda' },
  { name: 'Botswana Post', code: 'BWPOST', trackingUrl: 'https://botswanapost.post/', category: 'post', region: 'Botswana' },
  { name: 'Namibia Nampost', code: 'NAPOST', trackingUrl: 'https://www.nampost.com.na/', category: 'post', region: 'Namibia' },
  { name: 'Zimbabwe Post', code: 'ZWPOST', trackingUrl: 'https://www.zimpost.co.zw/', category: 'post', region: 'Zimbabwe' },
  { name: 'Zambia Post', code: 'ZMPOST', trackingUrl: 'http://www.zampost.com.zm/', category: 'post', region: 'Zambia' },
  { name: 'Angola Correios', code: 'AOPOST', trackingUrl: 'https://www.correiosdeangola.ao/', category: 'post', region: 'Angola' },
  { name: 'Mozambique Correios', code: 'MZPOST', trackingUrl: 'http://www.correios.co.mz/', category: 'post', region: 'Mozambique' },
  { name: 'Eswatini Post', code: 'SZPOST', trackingUrl: 'http://www.eswatinipost.co.sz/', category: 'post', region: 'Eswatini' },
  { name: 'Cabo Verde Correios', code: 'CVPOST', trackingUrl: 'https://correios.cv/', category: 'post', region: 'Cabo Verde' },
  { name: 'Benin La Poste', code: 'BJPOST', trackingUrl: 'https://laposte.bj/', category: 'post', region: 'Benin' },
  { name: 'Togo La Poste', code: 'TGPOST', trackingUrl: 'https://www.laposte.tg/', category: 'post', region: 'Togo' },
  { name: 'Burkina Faso La Poste', code: 'BFPOST', trackingUrl: 'https://laposte.bf/', category: 'post', region: 'Burkina Faso' },
  { name: 'Mali La Poste', code: 'MLPOST', trackingUrl: 'https://laposte.ml/', category: 'post', region: 'Mali' },
  { name: 'Madagascar Paositra', code: 'MGPOST', trackingUrl: 'https://paositramalagasy.mg/', category: 'post', region: 'Madagascar' },
  { name: 'Libya Post', code: 'LYPOST', trackingUrl: 'https://libyapost.ly/', category: 'post', region: 'Libya' },
  { name: 'Sudan Sudapost', code: 'SDPOST', trackingUrl: 'http://sudapost.sd/', category: 'post', region: 'Sudan' },
  { name: 'Djibouti La Poste', code: 'DJPOST', trackingUrl: 'https://www.laposte.dj/', category: 'post', region: 'Djibouti' },
  { name: 'Mauritania Mauripost', code: 'MRPOST', trackingUrl: 'http://www.mauripost.post/', category: 'post', region: 'Mauritania' },
  { name: 'Burundi Poste', code: 'BIPOST', trackingUrl: 'http://www.poste.bi/', category: 'post', region: 'Burundi' },
  { name: 'Sierra Leone Salpost', code: 'SLPOST', trackingUrl: 'https://salpost.gov.sl/', category: 'post', region: 'Sierra Leone' },
  { name: 'Liberia Post', code: 'LRPOST', trackingUrl: 'https://mopt.gov.lr/', category: 'post', region: 'Liberia' },
  // 추가 누락분
  { name: 'Afghanistan Post', code: 'AFPOST', trackingUrl: 'https://afghanpost.gov.af/en', category: 'post', region: 'Afghanistan' },
  { name: 'Palestine Post', code: 'PSPOST', trackingUrl: 'https://www.palpost.ps/', category: 'post', region: 'Palestine' },
  { name: 'Anguilla Post', code: 'AIPOST', trackingUrl: 'http://www.aps.ai/', category: 'post', region: 'Anguilla' },
  { name: 'Belize Post', code: 'BZPOST', trackingUrl: 'http://www.belizepostalservice.gov.bz', category: 'post', region: 'Belize' },
  { name: 'Grenada Post', code: 'GDPOST', trackingUrl: 'http://www.grenadapostal.com/', category: 'post', region: 'Grenada' },
  { name: 'Saint Kitts Post', code: 'KNPOST', trackingUrl: 'https://post.kn/', category: 'post', region: 'Saint Kitts' },
  { name: 'Saint Lucia Post', code: 'LCPOST', trackingUrl: 'http://www.stluciapostal.com/', category: 'post', region: 'Saint Lucia' },
  { name: 'Tuvalu Post', code: 'TVPOST', trackingUrl: 'http://www.tuvalupost.tv/', category: 'post', region: 'Tuvalu' },
  { name: 'Kiribati Post', code: 'KIPOST', trackingUrl: 'https://www.mict.gov.ki/postal', category: 'post', region: 'Kiribati' },
  { name: 'Bonaire Post', code: 'BQPOST', trackingUrl: 'http://www.fxdc-post.com/', category: 'post', region: 'Bonaire' },

  // ============ 철도화물 (Rail) - 40개+ ============
  // 한국
  { name: 'KORAIL 화물 (코레일)', code: 'KORAIL', trackingUrl: 'https://www.korail.com/logistics.do', category: 'rail', region: 'Korea' },
  { name: '한국철도공사 물류', code: 'KRLG', trackingUrl: 'https://www.koraillogis.co.kr/', category: 'rail', region: 'Korea' },
  // 중국-유럽 철도 (China-Europe Railway Express)
  { name: 'CR Express (中欧班列)', code: 'CRE', trackingUrl: 'https://www.crexpress.com/en/trackQuery.html', category: 'rail', region: 'China' },
  { name: 'China Railway (中国铁路)', code: 'CRCC', trackingUrl: 'https://www.12306.cn/', category: 'rail', region: 'China' },
  { name: 'CRCT (中铁集装箱)', code: 'CRCT', trackingUrl: 'https://www.crct.com/', category: 'rail', region: 'China' },
  { name: 'Sinotrans Rail', code: 'SNTR', trackingUrl: 'https://www.sinotrans.com/', category: 'rail', region: 'China' },
  { name: 'CELO (China-Europe Logistics)', code: 'CELO', trackingUrl: 'https://www.celog.com.cn/', category: 'rail', region: 'China' },
  // 러시아/CIS
  { name: 'Russian Railways (RZD)', code: 'RZD', trackingUrl: 'https://www.rzd.ru/en/', category: 'rail', region: 'Russia' },
  { name: 'Trans-Siberian Railway', code: 'TSR', trackingUrl: 'https://www.rzd.ru/en/', category: 'rail', region: 'Russia' },
  { name: 'TransContainer (Russia)', code: 'TRCU', trackingUrl: 'https://www.trcont.com/en/', category: 'rail', region: 'Russia' },
  { name: 'FESCO Rail', code: 'FSCR', trackingUrl: 'https://www.fesco.ru/en/', category: 'rail', region: 'Russia' },
  { name: 'UTLC ERA (Eurasian Rail)', code: 'UTLC', trackingUrl: 'https://www.utlc.com/', category: 'rail', region: 'Russia' },
  { name: 'Kazakhstan Railways (KTZ)', code: 'KTZ', trackingUrl: 'https://www.railways.kz/', category: 'rail', region: 'Kazakhstan' },
  { name: 'KTZ Express', code: 'KTZE', trackingUrl: 'https://www.ktzexpress.kz/', category: 'rail', region: 'Kazakhstan' },
  { name: 'Belarus Railway (BCH)', code: 'BCH', trackingUrl: 'https://www.rw.by/', category: 'rail', region: 'Belarus' },
  { name: 'Ukraine Railways (UZ)', code: 'UZ', trackingUrl: 'https://www.uz.gov.ua/', category: 'rail', region: 'Ukraine' },
  // 유럽
  { name: 'DB Cargo (Deutsche Bahn)', code: 'DBCG', trackingUrl: 'https://www.dbcargo.com/rail-de-en/tracking', category: 'rail', region: 'Europe' },
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
  { name: 'BNSF Railway (USA)', code: 'BNSF', trackingUrl: 'https://www.bnsf.com/ship-with-bnsf/ways-of-shipping/intermodal/', category: 'rail', region: 'Americas' },
  { name: 'Union Pacific (USA)', code: 'UP', trackingUrl: 'https://www.up.com/customers/track-record/', category: 'rail', region: 'Americas' },
  { name: 'CSX Transportation (USA)', code: 'CSX', trackingUrl: 'https://www.csx.com/', category: 'rail', region: 'Americas' },
  { name: 'Norfolk Southern (USA)', code: 'NS', trackingUrl: 'https://www.nscorp.com/', category: 'rail', region: 'Americas' },
  { name: 'Canadian National (CN)', code: 'CN', trackingUrl: 'https://www.cn.ca/', category: 'rail', region: 'Americas' },
  { name: 'Canadian Pacific (CPKC)', code: 'CPKC', trackingUrl: 'https://www.cpkcr.com/', category: 'rail', region: 'Americas' },
  { name: 'Kansas City Southern', code: 'KCS', trackingUrl: 'https://www.kcsouthern.com/', category: 'rail', region: 'Americas' },
  { name: 'Ferromex (Mexico)', code: 'FXMX', trackingUrl: 'https://www.ferromex.com.mx/', category: 'rail', region: 'Americas' },
  // 아시아/오세아니아
  { name: 'JR Freight (Japan)', code: 'JRFT', trackingUrl: 'https://www.jrfreight.co.jp/', category: 'rail', region: 'Asia' },
  { name: 'Indian Railways (CONCOR)', code: 'CONC', trackingUrl: 'https://www.concorindia.co.in/', category: 'rail', region: 'Asia' },
  { name: 'Aurizon (Australia)', code: 'AURZ', trackingUrl: 'https://www.aurizon.com.au/', category: 'rail', region: 'Oceania' },
  { name: 'Pacific National (Australia)', code: 'PACN', trackingUrl: 'https://www.pacificnational.com.au/', category: 'rail', region: 'Oceania' },
  { name: 'KiwiRail (New Zealand)', code: 'KIWI', trackingUrl: 'https://www.kiwirail.co.nz/', category: 'rail', region: 'Oceania' },
  { name: 'Transnet Freight (South Africa)', code: 'TRNT', trackingUrl: 'https://www.transnetfreightrail.net/', category: 'rail', region: 'Africa' },
];

// Icons
const ShipIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.9 5.8 2.38 8"/><path d="M12 10V4"/><path d="M8 8v2"/><path d="M16 8v2"/>
  </svg>
);

const PlaneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
  </svg>
);

const TruckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const TrainIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h.01"/><path d="M16 15h.01"/>
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const PackageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const categories = [
  { id: 'all', label: '전체', icon: PackageIcon, count: carriers.length },
  { id: 'container', label: '컨테이너 선사', icon: ShipIcon, count: carriers.filter(c => c.category === 'container').length },
  { id: 'air', label: '항공화물', icon: PlaneIcon, count: carriers.filter(c => c.category === 'air').length },
  { id: 'courier', label: '특송/택배', icon: TruckIcon, count: carriers.filter(c => c.category === 'courier').length },
  { id: 'post', label: '우편/EMS', icon: MailIcon, count: carriers.filter(c => c.category === 'post').length },
  { id: 'rail', label: '철도화물', icon: TrainIcon, count: carriers.filter(c => c.category === 'rail').length },
];

// Main Component
const ContainerTracker: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showMajorOnly, setShowMajorOnly] = useState(false);

  const filteredCarriers = useMemo(() => {
    return carriers.filter(carrier => {
      const matchesSearch =
        carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carrier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (carrier.region?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesCategory = activeCategory === 'all' || carrier.category === activeCategory;
      const matchesMajor = !showMajorOnly || carrier.isMajor;
      return matchesSearch && matchesCategory && matchesMajor;
    });
  }, [searchTerm, activeCategory, showMajorOnly]);

  // 알파벳순 정렬
  const sortedCarriers = useMemo(() => {
    return [...filteredCarriers].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredCarriers]);

  const handleTrack = (carrier: Carrier) => {
    window.open(carrier.trackingUrl, '_blank', 'noopener,noreferrer');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'container': return <ShipIcon className="w-3 h-3" />;
      case 'air': return <PlaneIcon className="w-3 h-3" />;
      case 'courier': return <TruckIcon className="w-3 h-3" />;
      case 'post': return <MailIcon className="w-3 h-3" />;
      case 'rail': return <TrainIcon className="w-3 h-3" />;
      default: return <PackageIcon className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'container': return 'bg-blue-500';
      case 'air': return 'bg-purple-500';
      case 'courier': return 'bg-orange-500';
      case 'post': return 'bg-rose-500';
      case 'rail': return 'bg-slate-600';
      default: return 'bg-indigo-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'container': return '해상';
      case 'air': return '항공';
      case 'courier': return '특송';
      case 'post': return '우편';
      case 'rail': return '철도';
      default: return '';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <PackageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">화물 추적 포털</h1>
                <p className="text-slate-400 text-xs">전세계 {carriers.length}개+ 운송사 추적 링크</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="운송사, 코드, 지역 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 px-4 py-2.5 pl-10 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
                <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                  activeCategory === cat.id ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Count & Major Filter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500">
              {searchTerm && <span className="font-medium">"{searchTerm}" 검색 결과: </span>}
              <span className="font-bold text-slate-700">{sortedCarriers.length}개</span> 운송사
            </p>
            {/* Major Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showMajorOnly}
                onChange={(e) => setShowMajorOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer"
              />
              <span className="text-sm text-slate-600 font-medium">주요 항목만</span>
            </label>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
            >
              검색 초기화
            </button>
          )}
        </div>

        {/* Carrier Grid - Compact Single Line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
          {sortedCarriers.map((carrier, idx) => (
            <button
              key={`${carrier.code}-${idx}`}
              onClick={() => handleTrack(carrier)}
              className="bg-white rounded border border-slate-200 px-2 py-1.5 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left group flex items-center gap-1.5"
            >
              <div className={`w-5 h-5 ${getCategoryColor(carrier.category)} rounded flex items-center justify-center text-white shrink-0`}>
                {getCategoryIcon(carrier.category)}
              </div>
              <span className="text-xs text-slate-700 truncate flex-1">{carrier.name}</span>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{carrier.code}</span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {sortedCarriers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">검색 결과 없음</h3>
            <p className="text-sm text-slate-500 mb-4">"{searchTerm}"에 해당하는 운송사를 찾을 수 없습니다.</p>
            <button
              onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
              className="px-4 py-2 bg-indigo-500 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 transition-colors"
            >
              전체 목록 보기
            </button>
          </div>
        )}

        {/* Info Cards - Compact */}
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <ShipIcon className="w-3 h-3 text-blue-500" />
            <span><b>컨테이너:</b> MAEU1234567</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <ShipIcon className="w-3 h-3 text-emerald-500" />
            <span><b>B/L:</b> 선사별 형식</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <PlaneIcon className="w-3 h-3 text-purple-500" />
            <span><b>AWB:</b> 180-12345678</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <TruckIcon className="w-3 h-3 text-orange-500" />
            <span><b>운송장:</b> 10-20자리</span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-slate-400 text-center mt-4">
          각 운송사의 공식 웹사이트로 연결됩니다
        </p>
      </div>
    </div>
  );
};

export default ContainerTracker;

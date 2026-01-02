import React from 'react';
import { Carrier } from './types';
import { ShipIcon } from './icons';
import CarrierGrid from './CarrierGrid';

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
  { name: 'Heung-A Line', code: 'HASU', trackingUrl: 'http://www.heungaline.com/', category: 'container', region: 'Asia' },
  { name: 'Hikaru Shipping', code: 'HKRU', trackingUrl: 'https://www.hikaru-shipping.co.jp/tracking', category: 'container', region: 'Asia' },
  { name: 'Hillebrand Gori', code: 'HLBG', trackingUrl: 'https://www.hillebrandgori.com/tracking', category: 'container', region: 'Global' },
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

  // B/L 추적 추가 (특수 선사)
  { name: 'Bahri (National Shipping)', code: 'BAHR', trackingUrl: 'https://www.bahri.sa/tracking', category: 'container', region: 'Middle East' },
  { name: 'Eimskip', code: 'EIMS', trackingUrl: 'https://www.eimskip.com/tracking', category: 'container', region: 'Europe' },
  { name: 'EUKOR Car Carriers', code: 'EUKO', trackingUrl: 'https://www.eukor.com/tracking', category: 'container', region: 'Global' },
  { name: 'G2 Ocean', code: 'G2OC', trackingUrl: 'https://www.g2ocean.com/tracking', category: 'container', region: 'Global' },
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
];

interface TrackerContainerProps {
  adSlot?: React.ReactNode;
}

const TrackerContainer: React.FC<TrackerContainerProps> = ({ adSlot }) => {
  return (
    <CarrierGrid
      carriers={containerCarriers}
      title="컨테이너 선사"
      subtitle={`전세계 ${containerCarriers.length}개+ 컨테이너 선사 추적`}
      icon={<ShipIcon className="w-5 h-5 text-white" />}
      iconBgClass="bg-gradient-to-br from-blue-500 to-blue-600"
      adSlot={adSlot}
    />
  );
};

export default TrackerContainer;
export { containerCarriers };

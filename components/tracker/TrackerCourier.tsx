import React from 'react';
import { Carrier } from './types';
import { TruckIcon } from './icons';
import CarrierGrid from './CarrierGrid';

// 특송/택배 데이터
const courierCarriers: Carrier[] = [
  { name: 'DHL Express', code: 'DHL', trackingUrl: 'https://www.dhl.com/kr-ko/home/tracking.html', category: 'courier', region: 'Global', isMajor: true },
  { name: 'FedEx', code: 'FDX', trackingUrl: 'https://www.fedex.com/en-kr/tracking.html', category: 'courier', region: 'Global', isMajor: true },
  { name: 'UPS', code: 'UPS', trackingUrl: 'https://www.ups.com/track', category: 'courier', region: 'Global', isMajor: true },
  { name: 'TNT (FedEx)', code: 'TNT', trackingUrl: 'https://www.tnt.com/express/ko_kr/site/shipping-tools/tracking.html', category: 'courier', region: 'Global', isMajor: true },
  { name: 'DB Schenker', code: 'DBS', trackingUrl: 'https://www.dbschenker.com/global/tracking', category: 'courier', region: 'Global', isMajor: true },
  { name: 'Kuehne + Nagel', code: 'KN', trackingUrl: 'https://onlineservices.kuehne-nagel.com/public-tracking/', category: 'courier', region: 'Global', isMajor: true },
  { name: 'DSV', code: 'DSV', trackingUrl: 'https://www.dsv.com/en/tools/track-and-trace', category: 'courier', region: 'Global', isMajor: true },
  { name: 'Expeditors', code: 'EXPO', trackingUrl: 'https://www.expeditors.com/tracking', category: 'courier', region: 'Global', isMajor: true },
  { name: 'CH Robinson', code: 'CHRW', trackingUrl: 'https://www.chrobinson.com/en/navisphere-carrier/shipment-tracking/', category: 'courier', region: 'Global' },
  { name: 'Nippon Express', code: 'NX', trackingUrl: 'https://www.nipponexpress.com/service/tracking/', category: 'courier', region: 'Asia', isMajor: true },
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
];

interface TrackerCourierProps {
  adSlot?: React.ReactNode;
}

const TrackerCourier: React.FC<TrackerCourierProps> = ({ adSlot }) => {
  return (
    <CarrierGrid
      carriers={courierCarriers}
      title="특송/택배"
      subtitle={`전세계 ${courierCarriers.length}개+ 특송사 추적`}
      icon={<TruckIcon className="w-5 h-5 text-white" />}
      iconBgClass="bg-gradient-to-br from-orange-500 to-orange-600"
      adSlot={adSlot}
    />
  );
};

export default TrackerCourier;
export { courierCarriers };

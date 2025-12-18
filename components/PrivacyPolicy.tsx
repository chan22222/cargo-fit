import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8">개인정보처리방침</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-8">최종 업데이트: 2025년 12월 19일</p>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">1. 개인정보의 수집 및 이용목적</h2>
            <p className="text-base text-slate-600 mb-4">
              SHIPDAGO는 다음과 같은 목적으로 개인정보를 수집하고 이용합니다:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>서비스 제공 및 계약 이행</li>
              <li>회원 관리 및 본인 확인</li>
              <li>서비스 개선 및 신규 서비스 개발</li>
              <li>마케팅 및 광고에 활용</li>
              <li>법적 의무 준수</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">2. 수집하는 개인정보 항목</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">필수항목</h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-600">
                  <li>성명, 이메일 주소, 휴대폰 번호</li>
                  <li>회사명, 사업자등록번호 (기업회원)</li>
                  <li>서비스 이용 기록, IP 주소, 쿠키</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">선택항목</h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-600">
                  <li>직책, 부서명</li>
                  <li>물류 관련 정보 (화물 종류, 운송 경로 등)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">3. 개인정보의 보유 및 이용기간</h2>
            <p className="text-base text-slate-600 mb-4">
              회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
              <li>표시/광고에 관한 기록: 6개월</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">4. 개인정보의 제3자 제공</h2>
            <p className="text-base text-slate-600 mb-4">
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              <li>물류 파트너사와의 서비스 제공을 위한 최소한의 정보 공유</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">5. 개인정보의 안전성 확보조치</h2>
            <p className="text-base text-slate-600 mb-4">
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>개인정보 취급 직원의 최소화 및 교육</li>
              <li>개인정보의 암호화</li>
              <li>해킹 등에 대비한 기술적 대책</li>
              <li>개인정보에 대한 접근 제한</li>
              <li>문서보안을 위한 잠금장치 사용</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">6. 이용자의 권리</h2>
            <p className="text-base text-slate-600 mb-4">
              이용자는 언제든지 다음의 권리를 행사할 수 있습니다:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">7. 쿠키(Cookie)의 운영</h2>
            <p className="text-base text-slate-600 mb-4">
              회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.
              이용자는 웹브라우저 설정을 통해 쿠키 사용을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">8. 개인정보보호책임자</h2>
            <div className="bg-slate-50 p-6 rounded-lg">
              <p className="text-base text-slate-700 mb-2"><strong>개인정보보호책임자</strong></p>
              <ul className="space-y-1 text-slate-600">
                <li>성명: 권혁찬</li>
                <li>직책: 개인</li>
                <li>이메일: ref222n@gmail.com</li>
                <li>전화번호: 이메일 문의</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">9. 개인정보처리방침 변경</h2>
            <p className="text-base text-slate-600">
              이 개인정보처리방침은 2025년 12월 19일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
              변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
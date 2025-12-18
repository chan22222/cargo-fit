import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8">서비스 이용약관</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-8">시행일: 2025년 12월 19일</p>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제1조 (목적)</h2>
            <p className="text-base text-slate-600">
              이 약관은 SHIPDAGO(이하 "회사")가 제공하는 컨테이너 적재 시뮬레이션 서비스 및 관련 제반 서비스(이하 "서비스")의
              이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제2조 (정의)</h2>
            <p className="text-base text-slate-600 mb-4">이 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>"서비스"란 회사가 제공하는 컨테이너 및 팔레트 적재 시뮬레이션, 물류 최적화 도구 및 관련 서비스를 의미합니다.</li>
              <li>"회원"이란 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
              <li>"아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.</li>
              <li>"비밀번호"란 회원이 부여받은 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의 조합을 의미합니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제3조 (약관의 게시와 개정)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
              <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
              <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</li>
              <li>회원이 개정약관에 동의하지 않는 경우 이용계약을 해지할 수 있습니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제4조 (서비스의 제공 및 변경)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>회사는 다음과 같은 업무를 수행합니다:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>컨테이너 적재 3D 시뮬레이션 서비스</li>
                  <li>팔레트 적재 최적화 서비스</li>
                  <li>물류 효율성 분석 및 리포트 제공</li>
                  <li>기타 회사가 정하는 부가 서비스</li>
                </ul>
              </li>
              <li>회사는 서비스의 내용을 기술적 사양의 변경 등의 이유로 변경할 수 있습니다.</li>
              <li>서비스의 내용이 변경되는 경우 회사는 변경된 서비스의 내용 및 제공일자를 명시하여 현재의 서비스 내용을 게시한 곳에 즉시 공지합니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제5조 (서비스의 중단)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
              <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 회원이 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제6조 (회원가입)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
              <li>회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>가입신청자가 이 약관 제7조 제3항에 의하여 이전에 회원자격을 상실한 경우</li>
                  <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                  <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제7조 (회원 탈퇴 및 자격 상실)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 회원탈퇴를 처리합니다.</li>
              <li>회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                  <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
                  <li>서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제8조 (개인정보보호)</h2>
            <p className="text-base text-slate-600 mb-4">
              회사는 회원의 개인정보를 보호하기 위하여 정보통신망법 및 개인정보 보호법 등 관련 법령에서 정하는 바를 준수합니다.
              회원의 개인정보 보호에 관한 사항은 별도로 정해진 회사의 개인정보처리방침을 따릅니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제9조 (회사의 의무)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다하여 노력합니다.</li>
              <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보보호를 위한 보안 시스템을 갖춥니다.</li>
              <li>회사는 회원으로부터 제기되는 의견이나 불만이 정당하다고 인정할 경우에는 이를 처리하여야 합니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제10조 (회원의 의무)</h2>
            <p className="text-base text-slate-600 mb-4">회원은 다음 행위를 하여서는 안 됩니다:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>신청 또는 변경 시 허위내용의 등록</li>
              <li>타인의 정보도용</li>
              <li>회사에 게시된 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
              <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 회사의 서비스에 공개 또는 게시하는 행위</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제11조 (저작권의 귀속)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
              <li>회원은 회사의 서비스를 이용함으로써 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제12조 (면책조항)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
              <li>회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖에 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제13조 (분쟁해결)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>회사는 회원이 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
              <li>회사는 회원으로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다.</li>
              <li>회사와 회원 간에 발생한 분쟁은 전자상거래기본법 제28조 및 동 시행령 제15조에 의하여 설치된 소비자분쟁조정위원회의 조정에 따를 수 있습니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">제14조 (재판권 및 준거법)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>회사와 회원 간에 발생한 분쟁에 관한 소송은 서울중앙지방법원을 관할 법원으로 합니다.</li>
              <li>회사와 회원 간에 제기된 소송에는 대한민국 법을 적용합니다.</li>
            </ol>
          </section>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>부칙</strong><br />
              이 약관은 2025년 12월 19일부터 시행합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
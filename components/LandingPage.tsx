
import React, { useEffect, useState } from 'react';
import { Insight } from '../types/insights';
import { db } from '../lib/supabase';

interface LandingPageProps {
  onStart: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
  onNavigateToInsights?: () => void;
  onNavigateToInsight?: (id: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onPrivacy, onTerms, onNavigateToInsights, onNavigateToInsight }) => {
  const [times, setTimes] = useState<Record<string, string>>({});
  const [insights, setInsights] = useState<Insight[]>([]);

  // Load insights from Supabase
  useEffect(() => {
    const loadInsights = async () => {
      try {
        const { data, error } = await db.insights.getPublished();
        if (error) {
          console.error('Error loading insights:', error);
          // Fallback to localStorage if Supabase fails
          const savedInsights = localStorage.getItem('insights');
          if (savedInsights) {
            const parsed = JSON.parse(savedInsights);
            setInsights(parsed.filter((i: Insight) => i.published));
          }
          return;
        }

        if (data) {
          // Convert snake_case to camelCase
          const formattedInsights = data.map((item: any) => ({
            id: item.id,
            tag: item.tag,
            title: item.title,
            date: item.date,
            imageUrl: item.image_url,
            content: item.content,
            author: item.author,
            published: item.published
          }));
          setInsights(formattedInsights);
        }
      } catch (error) {
        console.error('Error loading insights:', error);
        // Fallback to localStorage
        const savedInsights = localStorage.getItem('insights');
        if (savedInsights) {
          const parsed = JSON.parse(savedInsights);
          setInsights(parsed.filter((i: Insight) => i.published));
        }
      }
    };

    loadInsights();

    // Listen for custom event when admin panel updates
    const handleInsightsUpdate = () => {
      loadInsights();
    };
    window.addEventListener('insightsUpdated', handleInsightsUpdate);

    return () => {
      window.removeEventListener('insightsUpdated', handleInsightsUpdate);
    };
  }, []);

  useEffect(() => {
    const updateTimes = () => {
      const hubs = [
        { city: 'Seoul', zone: 'Asia/Seoul' },
        { city: 'Shanghai', zone: 'Asia/Shanghai' },
        { city: 'New York', zone: 'America/New_York' },
        { city: 'Rotterdam', zone: 'Europe/Amsterdam' }
      ];
      const now = new Date();
      const newTimes: Record<string, string> = {};
      hubs.forEach(hub => {
        newTimes[hub.city] = now.toLocaleTimeString('ko-KR', {
          timeZone: hub.zone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      });
      setTimes(newTimes);
    };

    updateTimes();
    const timer = setInterval(updateTimes, 60000);
    return () => clearInterval(timer);
  }, []);


  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto w-full relative">
      
      {/* AdSense Placement Suggestion - Top Banner */}
      <div className="w-full bg-slate-50 border-b border-slate-100 py-3 text-center">
         <div className="max-w-7xl mx-auto px-10">
            <div className="w-full h-12 bg-slate-200/50 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
               Advertisement Space
            </div>
         </div>
      </div>

      {/* Dynamic Background */}
      <div className="absolute top-0 inset-x-0 h-screen pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-50 rounded-full blur-[140px] opacity-40 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-20"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 md:pt-24 pb-12 md:pb-20 px-4 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-20">
          <div className="flex-1 space-y-6 md:space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
              <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-600 animate-ping"></div>
              <span className="text-blue-700 text-[8px] md:text-[10px] font-black tracking-[0.15em] md:tracking-[0.2em] uppercase">Digital Logistics Pioneer</span>
            </div>

            <div className="space-y-4 md:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight">
                Ship Smart.<br/>
                <span className="text-blue-600">Ship Faster.</span>
              </h1>
              <p className="text-base md:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium px-4 md:px-0">
                SHIPDAGO는 복잡한 물류 프로세스를 데이터와 AI로 혁신합니다.
                정밀한 3D 시뮬레이션으로 적재 효율을 극대화하고 운송 비용을 절감하세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-5 pt-2 md:pt-4">
              <button
                onClick={onStart}
                className="group relative w-full sm:w-auto px-8 md:px-12 py-3 md:py-5 bg-blue-600 text-white font-black rounded-xl md:rounded-2xl transition-all shadow-xl md:shadow-2xl shadow-blue-500/30 md:shadow-blue-500/40 hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2 md:gap-3 relative z-10">
                  <span className="text-base md:text-lg">시뮬레이션 시작</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </button>

              <button className="w-full sm:w-auto px-8 md:px-12 py-3 md:py-5 bg-white text-slate-900 font-bold rounded-xl md:rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-lg md:shadow-xl shadow-slate-200/10 md:shadow-slate-200/20">
                서비스 안내서
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full lg:w-auto">
             <div className="relative aspect-square max-w-[600px] mx-auto animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] shadow-[0_64px_128px_-32px_rgba(37,99,235,0.4)] rotate-3 overflow-hidden">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                   <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
                      <div className="p-8 bg-white/10 backdrop-blur-3xl rounded-[24px] border border-white/20 space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Global Port Tracking</span>
                            <div className="px-2 py-1 bg-emerald-400/20 text-emerald-400 text-[8px] font-black rounded uppercase">Online</div>
                         </div>
                         <div className="flex gap-4">
                            <div className="flex-1 h-32 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/5">
                               <div className="text-[10px] opacity-50 mb-2">BUSAN</div>
                               <div className="text-xl font-black">ACTIVE</div>
                            </div>
                            <div className="flex-1 h-32 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/5">
                               <div className="text-[10px] opacity-50 mb-2">SHA</div>
                               <div className="text-xl font-black">DELAY</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Global Market Insight Dashboard */}
      <section className="py-24 px-10 bg-slate-900 text-white overflow-hidden relative">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/world-item.png')]"></div>
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-20">
               {/* Left: Exchange Rates */}
               <div className="space-y-10">
                  <div className="space-y-2">
                     <h2 className="text-blue-500 text-xs font-black uppercase tracking-[0.3em]">Market Rates</h2>
                     <p className="text-4xl font-black tracking-tight">실시간 물류 금융 정보</p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-6">
                     {[
                        { pair: 'USD / KRW', rate: '1,384.50', change: '+2.40', up: true },
                        { pair: 'EUR / KRW', rate: '1,492.20', change: '-1.10', up: false },
                        { pair: 'CNY / KRW', rate: '191.45', change: '+0.15', up: true }
                     ].map((item, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[24px] hover:bg-white/10 transition-colors">
                           <div className="text-[10px] text-slate-400 font-bold mb-3">{item.pair}</div>
                           <div className="text-2xl font-black mb-1 tracking-tighter">{item.rate}</div>
                           <div className={`text-[10px] font-bold ${item.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {item.change} ({item.up ? '▲' : '▼'})
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Right: World Clock */}
               <div className="space-y-10">
                  <div className="space-y-2">
                     <h2 className="text-blue-500 text-xs font-black uppercase tracking-[0.3em]">Logistics Hub Clock</h2>
                     <p className="text-4xl font-black tracking-tight">주요 거점 항만 시간</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                     {Object.entries(times).map(([city, time], i) => (
                        <div key={i} className="flex flex-col items-center">
                           <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-4 bg-white/5 relative">
                              <div className="absolute inset-2 rounded-full border-t-2 border-blue-500 animate-[spin_4s_linear_infinite]"></div>
                              <span className="text-xs font-black">{time.split(':')[0]}</span>
                           </div>
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{city}</div>
                           <div className="text-sm font-bold mt-1 text-blue-400">{time}</div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 px-10 bg-white border-y border-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
             <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em]">How it works</h2>
             <p className="text-4xl font-black text-slate-900 tracking-tight">SHIPDAGO를 통한 스마트한 적재 프로세스</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "규격 입력",
                desc: "컨테이너 타입(20ft, 40HQ 등)을 선택하고 적재할 화물의 치수와 수량을 입력하세요."
              },
              {
                step: "02",
                title: "3D 시뮬레이션",
                desc: "알고리즘이 최적의 위치를 계산합니다. 드래그 앤 드롭으로 직접 위치를 조정할 수도 있습니다."
              },
              {
                step: "03",
                title: "결과 공유 및 최적화",
                desc: "최적화된 적재 계획을 확인하고, 효율적인 적재 리스트를 현장에 공유하세요."
              }
            ].map((item, idx) => (
              <div key={idx} className="relative p-10 bg-slate-50 rounded-[24px] border border-slate-100">
                <div className="text-5xl font-black text-blue-600/10 absolute top-8 right-10">{item.step}</div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logistics News / Blog Section */}
      <section className="py-32 px-10 bg-white">
         <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16 px-2">
               <div className="space-y-2">
                  <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">Insights</h2>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">글로벌 물류 트렌드</p>
               </div>
               <button
                 onClick={onNavigateToInsights}
                 className="text-xs font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest border-b border-slate-200 pb-1"
               >
                 View All News
               </button>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
               {insights.length > 0 ? (
                  insights.slice(0, 6).map((post) => (
                     <div
                       key={post.id}
                       className="group cursor-pointer"
                       onClick={() => onNavigateToInsight && onNavigateToInsight(post.id)}
                     >
                        <div className="aspect-[16/10] bg-slate-100 rounded-[24px] mb-6 overflow-hidden relative">
                           <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                              onError={(e) => {
                                 (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=400';
                              }}
                           />
                           <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-widest rounded-full">
                              {post.tag}
                           </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-3">
                           {post.title}
                        </h3>
                        <div className="flex items-center justify-between">
                           <p className="text-xs text-slate-400 font-bold">{post.date}</p>
                           {post.author && (
                              <p className="text-xs text-slate-500">by {post.author}</p>
                           )}
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="col-span-3 text-center py-12">
                     <p className="text-slate-400">아직 게시된 콘텐츠가 없습니다.</p>
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* AdSense Placement Suggestion - Inline Banner */}
      <div className="w-full py-16 text-center">
         <div className="max-w-4xl mx-auto px-10">
            <div className="w-full h-48 bg-slate-50 border border-slate-100 rounded-[24px] flex flex-col items-center justify-center text-slate-300 gap-4">
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sponsored Content</span>
               <div className="w-12 h-1 bg-slate-100 rounded-full"></div>
            </div>
         </div>
      </div>

      {/* Bottom CTA */}
      <section className="py-32 px-10 bg-white">
         <div className="max-w-5xl mx-auto bg-slate-900 rounded-[32px] p-16 md:p-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.2),transparent)]"></div>
            <div className="relative z-10 space-y-10">
               <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                  물류의 디지털 전환,<br/>지금 바로 SHIPDAGO와 함께하세요.
               </h2>
               <button 
                 onClick={onStart}
                 className="px-14 py-6 bg-white text-slate-900 font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-2xl"
               >
                 무료 시뮬레이션 시작
               </button>
            </div>
         </div>
      </section>

      {/* Enterprise Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-24 px-10">
        <div className="max-w-7xl mx-auto">
           <div className="grid md:grid-cols-4 gap-16 mb-20">
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-black text-white text-xl">S</div>
                    <span className="text-xl font-black tracking-tight text-slate-900">SHIPDAGO</span>
                 </div>
                 <p className="text-slate-400 text-sm leading-relaxed">
                    디지털 기술로 수출입 물류의 고도화를 꿈꾸는 혁신 솔루션입니다.
                 </p>
              </div>
              <div className="space-y-6">
                 <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Solutions</h4>
                 <ul className="space-y-4 text-slate-400 text-sm font-medium">
                    <li><a href="#" className="hover:text-blue-600 transition-colors">Digital Forwarding</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition-colors">3D Simulation</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition-colors">Cloud Logistics</a></li>
                 </ul>
              </div>
              <div className="space-y-6">
                 <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Support</h4>
                 <ul className="space-y-4 text-slate-400 text-sm font-medium">
                    <li><a href="#" className="hover:text-blue-600 transition-colors">User Guide</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition-colors">API Docs</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition-colors">Customer Center</a></li>
                 </ul>
              </div>
              <div className="space-y-6">
                 <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Connect</h4>
                 <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-600 transition-colors text-slate-400 font-bold">In</div>
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-600 transition-colors text-slate-400 font-bold">Tw</div>
                 </div>
              </div>
           </div>
           <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                 <span>© 2025 SHIPDAGO. ALL RIGHTS RESERVED.</span>
                 <a
                   href="#/admin"
                   className="opacity-0 hover:opacity-100 transition-opacity ml-4 text-slate-600"
                   title="Admin Panel"
                 >
                   ⚙
                 </a>
              </div>
              <div className="flex gap-8">
                 <button onClick={onPrivacy} className="hover:text-slate-900 transition-colors">Privacy Policy</button>
                 <button onClick={onTerms} className="hover:text-slate-900 transition-colors">Terms of Service</button>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

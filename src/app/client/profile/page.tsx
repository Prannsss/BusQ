import React from 'react';

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-[#1d348a] font-sans">    
      <main className="flex-1 max-w-lg md:max-w-2xl mx-auto w-full px-4 pt-4 pb-32 md:p-8 space-y-6">

        <header className="flex items-center justify-center pt-8 pb-4">
          {/* Avatar Area */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {/* Profile Image container */}
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] overflow-hidden bg-white shadow-md border-4 border-white relative z-10">
                {/* Fallback image background */}
                <div className="w-full h-full bg-gradient-to-br from-[#1d348a] to-blue-600 opacity-10" />
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-[#1d348a] opacity-30">
                   JH
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-32 md:h-32 bg-[#ff6802]/20 rounded-[2rem] blur-xl scale-110 z-0"></div>
              
              {/* PRO Tag */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#ff6802] text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-xl whitespace-nowrap shadow-[0_4px_10px_rgb(255,104,2,0.3)] z-20">  
                MEMBER
              </div>
            </div>
            <div className="text-center mt-3">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1d348a]">Juan Dela Cruz</h1>
              <p className="text-sm font-bold text-slate-400 mt-1">BusQ Regular • 18 Travels</p>
            </div>

            <div className="flex gap-2 mt-1">
              <span className="bg-[#1d348a]/10 text-[#1d348a] px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest">Cebu Local</span>
              <span className="bg-[#ff6802]/10 text-[#ff6802] px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest">240 Points</span>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-[#1d348a] rounded-[2rem] p-6 text-white flex flex-col items-center justify-center gap-3 shadow-[0_8px_20px_rgb(29,52,138,0.15)] relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            <div className="w-12 h-12 bg-white/10 rounded-[1rem] flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm md:text-base font-black text-center leading-snug">Saved<br/>Receipts</span>
          </div>

          <div className="bg-white rounded-[2rem] p-6 text-[#1d348a] flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 group cursor-pointer hover:border-[#1d348a]/30 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-[1rem] flex items-center justify-center mb-1 group-hover:bg-[#1d348a]/5 transition-colors"> 
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#1d348a] stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">   
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />              
              </svg>
            </div>
            <span className="text-sm md:text-base font-black text-center leading-snug">Payment<br/>Methods</span>
          </div>
        </section>

        {/* Recent Bookings */}
        <section className="space-y-6 pt-6">
          <div className="flex justify-between items-end px-2">
            <h2 className="font-black text-xl md:text-2xl text-[#1d348a]">Recent Trips</h2> 
            <button className="text-[#ff6802] text-sm font-black hover:underline uppercase tracking-widest">View All</button>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-[2rem] flex items-center pr-5 group border border-slate-100 shadow-sm cursor-pointer relative overflow-hidden transition-all hover:border-[#ff6802]/30">
              <div className="bg-emerald-50 text-emerald-600 rounded-[1.25rem] min-w-[3.5rem] h-14 flex items-center justify-center shrink-0 border border-emerald-100/50">        
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="ml-5 flex-1">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-black text-[#1d348a] text-base md:text-lg">North Bus ➔ Maya Port</h3>
                  <span className="text-[10px] font-black tracking-widest text-[#10b981] bg-[#dcfce7] px-2 py-1 rounded-lg w-max">COMPLETED</span>
                </div>
                <p className="text-xs md:text-sm font-bold text-slate-400 mt-1">Apr 15, 2026 • Seat 14A</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-[2rem] flex items-center pr-5 group border border-slate-100 shadow-sm cursor-pointer relative overflow-hidden transition-all hover:border-[#ff6802]/30">
              <div className="bg-[#ff6802]/10 text-[#ff6802] rounded-[1.25rem] min-w-[3.5rem] h-14 flex items-center justify-center shrink-0 border border-[#ff6802]/10">      
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="ml-5 flex-1">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-black text-[#1d348a] text-base md:text-lg">Cebu South ➔ Moalboal</h3>
                  <span className="text-[10px] font-black tracking-widest text-[#ff6802] bg-[#ff6802]/10 px-2 py-1 rounded-lg w-max">UPCOMING</span>
                </div>
                <p className="text-xs md:text-sm font-bold text-slate-400 mt-1">Apr 18, 2026 • Seat 08B</p>
              </div>
            </div>
            
          </div>
        </section>

      </main>
    </div>
  );
}

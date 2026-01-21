
import React, { useState, useEffect } from 'react';
import ProfileCard from './components/ProfileCard';
import Dashboard from './components/Dashboard';
import SearchBar from './components/SearchBar';
import RegistrationPanel from './components/RegistrationPanel';
import { Creator, NavState } from './types';
import { creatorService } from './services/creatorService';

const App: React.FC = () => {
  const [nav, setNav] = useState<NavState>({ view: 'marketplace' });
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Location States
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    loadCreators();
    handleDetectLocation();
  }, []);

  const loadCreators = async () => {
    setLoading(true);
    try {
      const data = await creatorService.getAll();
      setCreators(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        setTimeout(() => {
          setDetectedCity("São Paulo");
          setSelectedCity(null);
          setIsLocating(false);
        }, 800);
      }, () => setIsLocating(false));
    }
  };

  const setView = (view: NavState['view']) => {
    setNav({ view });
    window.scrollTo(0, 0);
  };

  const filteredCreators = creators.filter(creator => {
    const cityToFilter = selectedCity || detectedCity;
    if (!cityToFilter) return true;
    return creator.location_city?.toLowerCase().includes(cityToFilter.toLowerCase());
  });

  const renderMarketplace = () => {
    return (
      <div className="max-w-4xl mx-auto md:p-6 space-y-6 md:space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col items-center py-10">
           <div className="w-16 h-16 bg-[#F13E5A] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl mb-4">E</div>
           <h1 className="text-2xl font-black tracking-tighter">ELYSIUM HUB</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1">Premium Creator Marketplace</p>
        </div>

        <SearchBar 
          detectedCity={detectedCity} 
          selectedCity={selectedCity}
          isLocating={isLocating} 
          onLocate={handleDetectLocation} 
          onCityChange={(city) => setSelectedCity(city)}
          onRegisterClick={() => setView('registration')}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] aspect-[3/5] animate-pulse-soft border border-slate-100 shadow-sm flex flex-col p-8 space-y-4">
                <div className="flex-1 bg-slate-100 rounded-[2rem]"></div>
                <div className="h-6 bg-slate-100 w-2/3 rounded-lg"></div>
                <div className="h-4 bg-slate-100 w-1/2 rounded-lg"></div>
              </div>
            ))
          ) : filteredCreators.length > 0 ? (
            filteredCreators.map(creator => (
              <ProfileCard 
                key={creator.id} 
                creator={creator} 
                onClick={(id) => setNav({ view: 'profile', selectedCreatorId: id })}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-[3rem] border border-dashed border-slate-200">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
               </div>
               <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Nenhum perfil ativo nesta região</p>
               <button onClick={() => setView('registration')} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Seja a primeira de sua cidade</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const creator = creators.find(c => c.id === nav.selectedCreatorId);
    if (!creator) {
      setView('marketplace');
      return null;
    }

    return (
      <div className="max-w-2xl mx-auto bg-white min-h-screen relative pb-32 animate-in slide-in-from-bottom-4 duration-500 shadow-xl">
        <div className="relative h-[250px] md:h-[400px]">
          <img src={creator.photos?.[0] || creator.avatar} className="w-full h-full object-cover" alt="Cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10"></div>
          <div className="absolute top-4 left-4 flex gap-2">
            <button onClick={() => setView('marketplace')} className="w-10 h-10 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg hover:bg-white hover:text-rose-500 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
          </div>
        </div>

        <div className="px-6 -mt-32 relative z-10 bg-white rounded-t-[3.5rem] pt-8 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          <div className="flex items-end gap-5 mb-8">
            <div className="relative -mt-24">
              <img 
                src={creator.avatar} 
                className="w-28 h-28 md:w-36 md:h-36 rounded-full border-[6px] border-white object-cover shadow-2xl" 
                alt="Avatar" 
              />
              {creator.online && (
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
              )}
            </div>
            <div className="pb-1 space-y-1 flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
                {creator.name}
              </h1>
              <div className="flex items-center gap-2 text-[13px] text-slate-500 font-bold uppercase tracking-tight">
                <span>Criadora</span>
                <span className="text-slate-300">•</span>
                <span>{creator.age} anos</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] shadow-sm">
               <div className="flex items-center justify-between mb-3">
                 <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#F13E5A] shadow-sm">
                    <span className="text-sm font-black">$</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cachê</span>
               </div>
               <p className="text-xl font-black text-slate-900">R$ {creator.baseRate}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] shadow-sm">
               <div className="flex items-center justify-between mb-3">
                 <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#F13E5A] shadow-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local</span>
               </div>
               <p className="text-xl font-black text-slate-900 truncate">{creator.location_city}</p>
            </div>
          </div>

          <div className="space-y-10 min-h-[400px]">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Bio Profissional</h3>
              <p className="text-[15px] text-slate-700 leading-relaxed font-bold italic">"{creator.bio}"</p>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-6 pb-10 z-50 flex items-center justify-between gap-6 max-w-2xl mx-auto rounded-t-[3rem] shadow-2xl">
           <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-black uppercase">Investimento</p>
              <p className="text-2xl font-black text-slate-900">R$ {creator.baseRate}</p>
           </div>
           <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-xl">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03a11.934 11.934 0 001.621 6.118L0 24l6.09-1.597a11.895 11.895 0 005.952 1.594h.005c6.634 0 12.032-5.396 12.035-12.032a11.85 11.85 0 00-3.518-8.498" /></svg>
             Contatar via WhatsApp
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 selection:bg-rose-500 selection:text-white">
      <main>
        {nav.view === 'marketplace' && renderMarketplace()}
        {nav.view === 'dashboard' && <Dashboard />}
        {nav.view === 'profile' && renderProfile()}
        {nav.view === 'registration' && (
          <RegistrationPanel onComplete={() => { loadCreators(); setView('marketplace'); }} />
        )}
      </main>
      <footer className="mt-20 border-t-2 border-slate-100 py-16 px-8 text-center bg-white">
        <div className="max-w-7xl mx-auto opacity-50 hover:opacity-100 transition-opacity">
          <p className="font-logo text-2xl font-black tracking-[0.4em] mb-4 text-slate-950">ELYSIUM</p>
          <p className="text-[10px] uppercase tracking-[0.5em] font-black text-slate-400">
            © 2024 - Elite Marketplace • High Contrast Premium Edition
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

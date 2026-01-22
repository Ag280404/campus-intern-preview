import React, { useState, useRef } from 'react';
import { Share2, MapPin, Mail, Phone, ChevronDown, ChevronUp, MessageCircle, User as UserIcon, Camera, Save, Users, X, ShieldCheck, Facebook, Linkedin, Twitter, Ticket, Zap, Check, Info } from 'lucide-react';
import { User } from '../types';
import { db } from '../services/mockDatabase';

interface ProfileProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

const InitiativeCard = ({ title, description, image, href }: { title: string, description: string, image: string, href: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="bg-white rounded-[32px] overflow-hidden swiggy-shadow border border-slate-100 flex flex-col group hover:-translate-y-2 transition-all duration-500 h-full premium-card-shadow"
  >
    <div className="h-44 w-full overflow-hidden relative">
      <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={title} />
    </div>
    <div className="p-7 flex flex-col flex-1">
      <h5 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-swiggy-orange transition-colors">{title}</h5>
      <p className="text-xs text-slate-500 font-bold leading-relaxed flex-1 opacity-80 tracking-tight">
        {description}
      </p>
    </div>
  </a>
);

const ShareModal = ({ isOpen, onClose, shareUrl, title = "Share" }: { isOpen: boolean, onClose: () => void, shareUrl: string, title?: string }) => {
  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Asset link copied!');
  };

  const platforms = [
    { 
      name: 'WhatsApp', 
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-7 h-7" alt="WA" />, 
      color: 'bg-[#25D366]', 
      url: `https://wa.me/?text=${encodeURIComponent(title + ": " + shareUrl)}` 
    },
    { 
      name: 'Facebook', 
      icon: <Facebook size={28} className="text-white" fill="currentColor" />, 
      color: 'bg-[#1877F2]', 
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` 
    },
    { 
      name: 'X', 
      icon: <Twitter size={28} className="text-white" fill="currentColor" />, 
      color: 'bg-black', 
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}` 
    },
    { 
      name: 'LinkedIn', 
      icon: <Linkedin size={28} className="text-white" fill="currentColor" />, 
      color: 'bg-[#0077B5]', 
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` 
    },
    { 
      name: 'Email', 
      icon: <Mail size={28} className="text-white" />, 
      color: 'bg-slate-500', 
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent("Explore this catalyst asset: " + shareUrl)}` 
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="px-10 pt-10 pb-4 flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Share</h3>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
            <X size={28} className="text-slate-400" />
          </button>
        </div>

        <div className="px-10 py-10">
          <div className="flex gap-7 overflow-x-auto pb-6 no-scrollbar">
            {platforms.map((p) => (
              <a 
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 group min-w-[75px]"
              >
                <div className={`w-16 h-16 rounded-[22px] ${p.color} flex items-center justify-center shadow-xl transition-all group-hover:scale-110 group-hover:-translate-y-1`}>
                  {p.icon}
                </div>
                <span className="text-[11px] font-bold text-slate-500">{p.name}</span>
              </a>
            ))}
          </div>

          <div className="mt-8 relative">
            <div className="flex items-center gap-3 p-5 bg-slate-50/80 border border-slate-100 rounded-[28px] shadow-inner">
              <input 
                readOnly 
                value={shareUrl}
                className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-500 flex-1 truncate px-2"
              />
              <button 
                onClick={copyToClipboard}
                className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const campusName = db.getCampusName(user.campusId);

  const rewardsLink = user.rewardsOnelink || `https://swiggy.onelink.me/888564224/u631l8dw?code=${user.rewardsQrCode || 'SWIGGY'}`;
  const streaksLink = user.streaksOnelink || `https://swiggy.onelink.me/888564224/h6btndnt?code=${user.streaksQrCode || 'STREAK'}`;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.displayName || '');
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [editPhone, setEditPhone] = useState(user.phoneNumber || '');
  const [editShare, setEditShare] = useState(user.shareContactInfo || false);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const allPeers = db.getAllUsers().filter(u => u.id !== user.id && u.shareContactInfo);

  const openShare = (title: string, finalUrl: string) => {
    setShareTitle(title);
    setShareUrl(finalUrl);
    setShowShareModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updatedUser = db.updateUserAvatar(user.id, base64String);
        if (updatedUser) {
          onUserUpdate(updatedUser);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveContact = () => {
    const updatedUser = db.updateUser(user.id, {
      displayName: editName,
      email: editEmail,
      phoneNumber: editPhone,
      shareContactInfo: editShare
    });
    if (updatedUser) {
      onUserUpdate(updatedUser);
      setIsEditing(false);
    }
  };

  const handleQuickOptIn = () => {
    const updated = db.updateUser(user.id, { shareContactInfo: true });
    if (updated) {
      onUserUpdate(updated);
      setEditShare(true);
      alert('Networking enabled! Other interns can now see your contact details.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getQrUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data)}`;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        shareUrl={shareUrl} 
        title={shareTitle}
      />

      <header>
        <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">Profile</h2>
      </header>

      {/* Identity Card */}
      <div className="bg-white p-8 md:p-12 rounded-[56px] swiggy-shadow border border-slate-50 premium-card-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-[0.02] text-swiggy-orange pointer-events-none">
          <UserIcon size={240} strokeWidth={1} />
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-center relative">
          <div className="relative group shrink-0">
            <div className="w-36 h-36 rounded-[48px] overflow-hidden shadow-2xl border-[6px] border-white bg-slate-50 flex items-center justify-center relative transition-all duration-500 group-hover:scale-105 group-hover:rotate-2">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={56} className="text-slate-200" />
              )}
              
              <button 
                onClick={triggerFileInput}
                className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm"
              >
                <Camera size={24} className="mb-1.5" strokeWidth={2.5} />
                <span className="text-[10px] font-bold">Update</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-swiggy-orange text-white p-2.5 rounded-2xl shadow-xl border-4 border-white">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="flex-1 w-full">
            {!isEditing ? (
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-[36px] font-black text-slate-900 leading-none mb-3 tracking-tighter">{user.displayName}</h3>
                  <div className="inline-flex items-center gap-2 bg-swiggy-light text-swiggy-orange px-4 py-1.5 rounded-full font-bold text-[10px] mb-6 shadow-sm tracking-widest">
                    <MapPin size={12} strokeWidth={3} /> {campusName}
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="flex items-center gap-2.5 text-slate-600 bg-slate-50/80 px-5 py-3 rounded-2xl border border-slate-100 font-bold text-xs shadow-sm tracking-tight">
                      <Mail size={16} className="text-slate-300" strokeWidth={2.5} /> {user.email}
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center gap-2.5 text-slate-600 bg-slate-50/80 px-5 py-3 rounded-2xl border border-slate-100 font-bold text-xs shadow-sm tracking-tight">
                        <Phone size={16} className="text-slate-300" strokeWidth={2.5} /> {user.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3.5 bg-slate-50 border border-slate-200 rounded-[22px] text-[11px] font-black text-slate-500 hover:text-swiggy-orange hover:bg-white hover:swiggy-shadow transition-all self-center md:self-start active:scale-95 tracking-widest"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-7 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 ml-3 tracking-widest">Display name</label>
                    <input 
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-swiggy-orange/5 focus:bg-white font-black text-slate-800 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 ml-3 tracking-widest">Phone number</label>
                    <input 
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-swiggy-orange/5 focus:bg-white font-black text-slate-800 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 ml-3 tracking-widest">Email ID</label>
                  <input 
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-swiggy-orange/5 focus:bg-white font-black text-slate-800 transition-all"
                  />
                </div>
                
                <div className="flex items-center justify-between p-6 bg-slate-50/80 rounded-[32px] border border-slate-100 shadow-inner">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-500 ${editShare ? 'bg-swiggy-orange text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-200 border border-slate-100'}`}>
                         <Users size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-slate-900 leading-none mb-1 tracking-tight">Directory Visibility</p>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">Allow peer catalysts to find your contact</p>
                      </div>
                   </div>
                   <button 
                      type="button"
                      onClick={() => setEditShare(!editShare)}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-[3px] border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${editShare ? 'bg-swiggy-orange' : 'bg-slate-300'}`}
                   >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out ${editShare ? 'translate-x-6' : 'translate-x-0'}`} />
                   </button>
                </div>

                <div className="flex gap-4 justify-end pt-4">
                  <button 
                    onClick={handleSaveContact}
                    className="px-10 py-4 bg-swiggy-orange text-white rounded-[24px] text-xs font-black shadow-xl shadow-orange-100 flex items-center gap-3 hover:bg-[#E14A00] transition-all hover:-translate-y-0.5 tracking-widest"
                  >
                    <Save size={18} strokeWidth={2.5} /> Confirm changes
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(user.displayName || '');
                      setEditEmail(user.email || '');
                      setEditPhone(user.phoneNumber || '');
                      setEditShare(user.shareContactInfo || false);
                    }}
                    className="px-10 py-4 bg-slate-100 text-slate-500 rounded-[24px] text-xs font-black hover:bg-slate-200 transition-all active:scale-95 tracking-widest"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Codes Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-10 rounded-[56px] swiggy-shadow border border-slate-50 text-center flex flex-col justify-between items-center group premium-card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.015] text-swiggy-orange pointer-events-none">
              <Ticket size={180} strokeWidth={1} />
            </div>
            <div className="w-full relative">
              <div className="w-16 h-16 bg-swiggy-light text-swiggy-orange rounded-[24px] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                 <Ticket size={32} strokeWidth={2.5} />
              </div>
              <h4 className="text-base font-black text-slate-900 mb-1.5 tracking-tight">Student Rewards QR</h4>
              <p className="text-[11px] text-slate-400 font-bold mb-10 tracking-widest">Share your unique QR code.</p>
              
              <div className="bg-slate-50/50 p-8 rounded-[44px] border-[3px] border-dashed border-slate-100 w-fit mx-auto mb-10 shadow-inner group-hover:bg-white group-hover:border-swiggy-orange/10 transition-colors">
                 <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-50">
                    <img 
                        src={getQrUrl(rewardsLink)} 
                        alt="Student Rewards QR" 
                        className="w-44 h-44 object-contain mix-blend-multiply opacity-90"
                    />
                 </div>
              </div>
            </div>
            
            <button 
              onClick={() => openShare("Join Swiggy Student Rewards!", rewardsLink)}
              className="w-full bg-slate-900 text-white py-5 rounded-[26px] font-black text-[11px] flex items-center justify-center gap-3 transition-all hover:bg-black active:scale-95 shadow-xl shadow-slate-100 tracking-widest"
            >
              <Share2 size={20} strokeWidth={3} /> Share
            </button>
         </div>

         <div className="bg-white p-10 rounded-[56px] swiggy-shadow border border-slate-50 text-center flex flex-col justify-between items-center group premium-card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.015] text-swiggy-orange pointer-events-none">
              <Zap size={180} strokeWidth={1} />
            </div>
            <div className="w-full relative">
              <div className="w-16 h-16 bg-swiggy-light text-swiggy-orange rounded-[24px] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-inner">
                 <Zap size={32} strokeWidth={2.5} />
              </div>
              <h4 className="text-base font-black text-slate-900 mb-1.5 tracking-tight">Campus Streaks QR</h4>
              <p className="text-[11px] text-slate-400 font-bold mb-10 tracking-widest">Share your unique QR code.</p>
              
              <div className="bg-slate-50/50 p-8 rounded-[44px] border-[3px] border-dashed border-slate-100 w-fit mx-auto mb-10 shadow-inner group-hover:bg-white group-hover:border-swiggy-orange/10 transition-colors">
                 <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-50">
                    <img 
                        src={getQrUrl(streaksLink)} 
                        alt="Campus Streaks QR" 
                        className="w-44 h-44 object-contain mix-blend-multiply opacity-90"
                    />
                 </div>
              </div>
            </div>
            
            <button 
              onClick={() => openShare("Activate your Campus Streak!", streaksLink)}
              className="w-full bg-swiggy-orange text-white py-5 rounded-[26px] font-black text-[11px] flex items-center justify-center gap-3 transition-all hover:bg-[#E14A00] active:scale-95 shadow-xl shadow-orange-100 tracking-widest"
            >
              <Share2 size={20} strokeWidth={3} />Share
            </button>
         </div>
      </section>

      {/* Intern Directory */}
      <section className="bg-white rounded-[56px] p-10 md:p-14 swiggy-shadow border border-slate-50 premium-card-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-swiggy-light text-swiggy-orange rounded-[22px] flex items-center justify-center shadow-inner">
              <Users size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[28px] font-black text-slate-900 tracking-tight leading-none tracking-tighter">Catalyst contact directory</h3>
            </div>
          </div>
          {!user.shareContactInfo && (
            <button 
              onClick={handleQuickOptIn}
              className="px-10 py-4 bg-swiggy-orange text-white rounded-[24px] font-black text-[11px] shadow-xl shadow-orange-100 transition-all hover:bg-[#E14A00] hover:-translate-y-0.5 tracking-widest"
            >
              Join directory
            </button>
          )}
        </div>
        
        {allPeers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {allPeers.map(peer => (
              <div key={peer.id} className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 hover:bg-white hover:border-swiggy-orange/30 transition-all duration-500 group swiggy-shadow flex items-start gap-6">
                <div className="w-16 h-16 rounded-[24px] overflow-hidden bg-white border-2 border-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 group-hover:-rotate-2">
                  {peer.avatarUrl ? (
                    <img src={peer.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={28} className="text-slate-200" />
                  )}
                </div>
                <div className="min-w-0">
                  <h5 className="font-black text-slate-900 truncate text-lg mb-1 tracking-tight group-hover:text-swiggy-orange transition-colors tracking-tight">{peer.displayName}</h5>
                  <div className="inline-flex items-center gap-1.5 text-[9px] text-swiggy-orange font-bold mb-4 bg-swiggy-light px-3 py-1 rounded-full tracking-widest">
                    <MapPin size={10} strokeWidth={3} /> {db.getCampusName(peer.campusId)}
                  </div>
                  <div className="space-y-2.5">
                    <a href={`mailto:${peer.email}`} className="flex items-center gap-3 text-[11px] font-bold text-slate-500 hover:text-swiggy-orange transition-colors group/link tracking-tight">
                      <Mail size={14} className="text-slate-300 group-hover/link:text-swiggy-orange" strokeWidth={2.5} /> {peer.email}
                    </a>
                    {peer.phoneNumber && (
                      <a href={`tel:${peer.phoneNumber}`} className="flex items-center gap-3 text-[11px] font-bold text-slate-500 hover:text-swiggy-orange transition-colors group/link tracking-tight">
                        <Phone size={14} className="text-slate-300 group-hover/link:text-swiggy-orange" strokeWidth={2.5} /> {peer.phoneNumber}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center bg-slate-50/50 rounded-[44px] border-2 border-dashed border-slate-200">
            <MessageCircle size={56} className="mx-auto text-slate-200 mb-6" strokeWidth={1.5} />
            <h4 className="font-black text-slate-900 text-xl tracking-tight">Syncing network...</h4>
            <p className="text-[11px] text-slate-400 mt-3 font-bold tracking-widest">Catalyst directory populates as peers opt-in.</p>
          </div>
        )}
      </section>

      {/* Swiggy Initiatives for Students */}
      <section className="space-y-10 pt-6">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-10 bg-swiggy-orange rounded-full shadow-lg shadow-orange-100"></div>
          <h3 className="text-[28px] font-black text-slate-900 tracking-tight leading-none tracking-tighter">Swiggy Initiatives for Students</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl">
          <InitiativeCard 
            title="Student Rewards"
            description="Unlock exclusive discounts on Swiggy One, Food Delivery, Dineout and more."
            image="https://i.postimg.cc/Fzyq3L0m/1000173235.jpg"
            href="https://swiggy.onelink.me/888564224/u631l8dw"
          />
          <InitiativeCard 
            title="Campus Streaks"
            description="Order with your college to hit the target on streak days and unlock cashback."
            image="https://i.postimg.cc/DymLWThp/1000173233-1.jpg"
            href="https://swiggy.onelink.me/888564224/h6btndnt"
          />
        </div>
      </section>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Profile;

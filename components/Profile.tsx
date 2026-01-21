
import React, { useState, useRef } from 'react';
import { Share2, MapPin, Mail, Phone, ChevronDown, ChevronUp, MessageCircle, User as UserIcon, Camera, Save, Users, X, ShieldCheck, Facebook, Linkedin, Twitter, Ticket, Zap, Check, Info } from 'lucide-react';
import { User } from '../types';
import { db } from '../services/mockDatabase';

interface ProfileProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

const InitiativeCard = ({ title, subtitle, description, image, badgeColor, href }: { title: string, subtitle: string, description: string, image: string, badgeColor: string, href: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="bg-white rounded-[24px] overflow-hidden swiggy-shadow border border-slate-100 flex flex-col group hover:-translate-y-1 transition-all duration-300 h-full"
  >
    <div className="h-40 w-full overflow-hidden relative">
      <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={title} />
      <div className={`absolute top-4 left-4 ${badgeColor} text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest`}>
        {subtitle}
      </div>
    </div>
    <div className="p-5 flex flex-col flex-1">
      <h5 className="text-lg font-black text-slate-900 mb-2">{title}</h5>
      <p className="text-xs text-slate-500 font-medium leading-relaxed flex-1">
        {description}
      </p>
    </div>
  </a>
);

const ShareModal = ({ isOpen, onClose, shareUrl, title = "Share" }: { isOpen: boolean, onClose: () => void, shareUrl: string, title?: string }) => {
  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  const platforms = [
    { 
      name: 'WhatsApp', 
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6" alt="WA" />, 
      color: 'bg-[#25D366]', 
      url: `https://wa.me/?text=${encodeURIComponent(title + ": " + shareUrl)}` 
    },
    { 
      name: 'Facebook', 
      icon: <Facebook size={24} className="text-white" fill="currentColor" />, 
      color: 'bg-[#1877F2]', 
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` 
    },
    { 
      name: 'X', 
      icon: <Twitter size={24} className="text-white" fill="currentColor" />, 
      color: 'bg-black', 
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}` 
    },
    { 
      name: 'LinkedIn', 
      icon: <Linkedin size={24} className="text-white" fill="currentColor" />, 
      color: 'bg-[#0077B5]', 
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` 
    },
    { 
      name: 'Email', 
      icon: <Mail size={24} className="text-white" />, 
      color: 'bg-slate-500', 
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent("Check this out: " + shareUrl)}` 
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Share</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="px-8 py-6">
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
            {platforms.map((p) => (
              <a 
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group min-w-[70px]"
              >
                <div className={`w-14 h-14 rounded-full ${p.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                  {p.icon}
                </div>
                <span className="text-[11px] font-bold text-slate-600">{p.name}</span>
              </a>
            ))}
          </div>

          <div className="mt-8 relative">
            <div className="flex items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <input 
                readOnly 
                value={shareUrl}
                className="bg-transparent border-none outline-none text-xs font-medium text-slate-600 flex-1 truncate"
              />
              <button 
                onClick={copyToClipboard}
                className="bg-[#065FD4] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md"
              >
                Copy
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

  const getQrUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data)}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        shareUrl={shareUrl} 
        title={shareTitle}
      />

      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h2>
        <p className="text-slate-500 mt-1 font-medium">Manage your identity and access your unique program codes.</p>
      </header>

      {/* Identity Card - Updated per Page 1 of PDF */}
      <div className="bg-white p-6 md:p-8 rounded-[40px] swiggy-shadow border border-slate-50">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-[32px] overflow-hidden shadow-md border-4 border-white bg-slate-50 flex items-center justify-center relative transition-transform group-hover:scale-105 duration-300">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={44} className="text-slate-300" />
              )}
              
              <button 
                onClick={triggerFileInput}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
              >
                <Camera size={20} className="mb-1" />
                <span className="text-[9px] font-black uppercase tracking-widest">Change</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-swiggy-orange text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
              <ShieldCheck size={14} />
            </div>
          </div>
          
          <div className="flex-1 w-full">
            {!isEditing ? (
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-black text-slate-900 leading-tight mb-1">{user.displayName}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-1 text-swiggy-orange font-black text-xs uppercase tracking-widest mb-4">
                    <MapPin size={12} strokeWidth={3} /> {campusName}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 font-bold text-xs">
                      <Mail size={14} className="text-slate-300" /> {user.email}
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 font-bold text-xs">
                        <Phone size={14} className="text-slate-300" /> {user.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-swiggy-orange hover:bg-white transition-all swiggy-shadow self-center md:self-start"
                >
                  Edit Contact
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Display Name</label>
                    <input 
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[20px] outline-none focus:ring-2 focus:ring-swiggy-orange font-black text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Phone Number</label>
                    <input 
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[20px] outline-none focus:ring-2 focus:ring-swiggy-orange font-black text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Email ID</label>
                  <input 
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[20px] outline-none focus:ring-2 focus:ring-swiggy-orange font-black text-slate-800"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-swiggy-light rounded-[20px] border border-swiggy-orange/10">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${editShare ? 'bg-swiggy-orange text-white' : 'bg-white text-slate-300'}`}>
                         <Users size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 leading-none mb-1">Directory Visibility</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Allow peer catalysts to find you</p>
                      </div>
                   </div>
                   <button 
                      type="button"
                      onClick={() => setEditShare(!editShare)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editShare ? 'bg-swiggy-orange' : 'bg-slate-300'}`}
                   >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editShare ? 'translate-x-5' : 'translate-x-0'}`} />
                   </button>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    onClick={handleSaveContact}
                    className="px-8 py-3 bg-swiggy-orange text-white rounded-[18px] text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-100 flex items-center gap-2 hover:bg-[#E14A00] transition-all"
                  >
                    <Save size={14} /> SAVE
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(user.displayName || '');
                      setEditEmail(user.email || '');
                      setEditPhone(user.phoneNumber || '');
                      setEditShare(user.shareContactInfo || false);
                    }}
                    className="px-8 py-3 bg-slate-100 text-slate-400 rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Codes Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-8 rounded-[40px] swiggy-shadow border border-slate-50 text-center flex flex-col justify-between items-center group">
            <div className="w-full">
              <div className="w-14 h-14 bg-swiggy-light text-swiggy-orange rounded-[20px] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                 <Ticket size={28} />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Student Rewards QR</h4>
              <p className="text-[11px] text-slate-400 font-bold mb-8">Generated from your unique campaign link</p>
              
              <div className="bg-slate-50 p-6 rounded-[32px] border-2 border-dashed border-slate-200 w-fit mx-auto mb-8 shadow-inner">
                 <img 
                    src={getQrUrl(rewardsLink)} 
                    alt="Student Rewards QR" 
                    className="w-40 h-40 object-contain mix-blend-multiply"
                 />
              </div>
            </div>
            
            <button 
              onClick={() => openShare("Join Swiggy Student Rewards!", rewardsLink)}
              className="w-full bg-[#171F2C] text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-100"
            >
              <Share2 size={18} /> Share Rewards Poster
            </button>
         </div>

         <div className="bg-white p-8 rounded-[40px] swiggy-shadow border border-slate-50 text-center flex flex-col justify-between items-center group">
            <div className="w-full">
              <div className="w-14 h-14 bg-orange-100 text-swiggy-orange rounded-[20px] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                 <Zap size={28} />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Campus Streaks QR</h4>
              <p className="text-[11px] text-slate-400 font-bold mb-8">Updates instantly when admins change your link</p>
              
              <div className="bg-slate-50 p-6 rounded-[32px] border-2 border-dashed border-slate-200 w-fit mx-auto mb-8 shadow-inner">
                 <img 
                    src={getQrUrl(streaksLink)} 
                    alt="Campus Streaks QR" 
                    className="w-40 h-40 object-contain mix-blend-multiply"
                 />
              </div>
            </div>
            
            <button 
              onClick={() => openShare("Activate your Campus Streak!", streaksLink)}
              className="w-full bg-swiggy-orange text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-[#E14A00] active:scale-95 shadow-lg shadow-orange-100"
            >
              <Share2 size={18} /> Share Streak Poster
            </button>
         </div>
      </section>

      {/* Intern Directory */}
      <section className="bg-white rounded-[40px] p-8 md:p-10 swiggy-shadow border border-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-swiggy-light text-swiggy-orange rounded-[18px] flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Intern Directory</h3>
              <p className="text-slate-500 mt-0.5 font-medium text-sm">Connect with your peer interns across campuses.</p>
            </div>
          </div>
          {!user.shareContactInfo && (
            <button 
              onClick={handleQuickOptIn}
              className="px-6 py-3 bg-swiggy-orange text-white rounded-[18px] font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 transition-all hover:bg-[#E14A00]"
            >
              Join Directory
            </button>
          )}
        </div>
        
        {allPeers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allPeers.map(peer => (
              <div key={peer.id} className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 hover:bg-white hover:border-swiggy-orange/30 transition-all group swiggy-shadow flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {peer.avatarUrl ? (
                    <img src={peer.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={24} className="text-slate-200" />
                  )}
                </div>
                <div className="min-w-0">
                  <h5 className="font-black text-slate-900 truncate text-base mb-0.5">{peer.displayName}</h5>
                  <p className="text-[10px] text-swiggy-orange font-black uppercase tracking-tight mb-3">{db.getCampusName(peer.campusId)}</p>
                  <div className="space-y-1.5">
                    <a href={`mailto:${peer.email}`} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-swiggy-orange transition-colors">
                      <Mail size={12} className="text-slate-300" /> {peer.email}
                    </a>
                    {peer.phoneNumber && (
                      <a href={`tel:${peer.phoneNumber}`} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-swiggy-orange transition-colors">
                        <Phone size={12} className="text-slate-300" /> {peer.phoneNumber}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
            <MessageCircle size={48} className="mx-auto text-slate-200 mb-4" />
            <h4 className="font-black text-slate-900 text-lg">Waiting for peers...</h4>
            <p className="text-[11px] text-slate-400 mt-2 font-medium uppercase tracking-widest">Directory updates as more interns opt-in.</p>
          </div>
        )}
      </section>

      {/* Swiggy Initiatives for Students - Updated per User Request */}
      <section className="space-y-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-swiggy-orange rounded-full"></div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Swiggy Initiatives for Students</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <InitiativeCard 
            title="Student Rewards"
            subtitle="STUDENT REWARDS"
            description="Unlock exclusive discounts on Swiggy One, Food delivery, Dineout and more."
            image="https://i.postimg.cc/Fzyq3L0m/1000173235.jpg"
            badgeColor="bg-swiggy-orange"
            href="https://swiggy.onelink.me/888564224/u631l8dw"
          />
          <InitiativeCard 
            title="Campus Streaks"
            subtitle="CAMPUS STREAKS"
            description="Order with your college to hit the target streak days and unlock cashback."
            image="https://i.postimg.cc/DymLWThp/1000173233-1.jpg"
            badgeColor="bg-[#171F2C]"
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

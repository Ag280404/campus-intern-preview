
import React, { useState, useRef, useEffect } from 'react';
import { Share2, MapPin, Mail, Phone, User as UserIcon, Camera, Save, Users, X, ShieldCheck, Facebook, Linkedin, Twitter, Ticket, Zap, Check } from 'lucide-react';
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
    className="bg-white rounded-xl overflow-hidden premium-card-shadow border border-[#E3DDD5] flex flex-col group hover:-translate-y-1 hover:border-swiggy-orange/40 transition-all duration-300 h-full"
  >
    <div className="h-40 w-full overflow-hidden relative">
      <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={title} />
    </div>
    <div className="p-6 flex flex-col flex-1">
      <h5 className="text-[15px] font-black text-[#141414] mb-2 tracking-tight group-hover:text-swiggy-orange transition-colors">{title}</h5>
      <p className="text-[12px] text-[#72665C] font-semibold leading-relaxed flex-1">
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#141414]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden premium-card-shadow animate-in zoom-in-95 duration-200 border border-[#E3DDD5]">
        <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-[#F3EFE9]">
          <h3 className="text-lg font-black text-[#141414] tracking-tight">Distribute asset</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F5F1] rounded-lg transition-all">
            <X size={20} className="text-[#A09488]" />
          </button>
        </div>

        <div className="px-8 py-8">
          <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
            {platforms.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2.5 group min-w-[60px]"
              >
                <div className={`w-13 h-13 rounded-xl ${p.color} flex items-center justify-center transition-all group-hover:scale-105 group-hover:-translate-y-0.5`} style={{width:52,height:52}}>
                  {p.icon}
                </div>
                <span className="text-[10px] font-bold text-[#A09488]">{p.name}</span>
              </a>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3 p-3.5 bg-[#F8F5F1] border border-[#E3DDD5] rounded-xl">
              <input
                readOnly
                value={shareUrl}
                className="bg-transparent border-none outline-none text-[11px] font-semibold text-[#72665C] flex-1 truncate"
              />
              <button
                onClick={copyToClipboard}
                className="bg-[#141414] text-white px-5 py-2.5 rounded-lg font-bold text-[11px] hover:bg-black transition-all active:scale-95"
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

  const rewardsLink = `https://urldefense.com/v3/__https://swiggy.onelink.me/888564224/Creative1__;!!BeGeivfSdT4o5A!hsxs5FkMWacQ0_KK95igsSofwQH8Eg88CS-ThbSwXWr-lNTXw3a0dSmPTTAPfznnsxldSstcCcD2WXyjzdzvH58g4g2nK1GGlg$`;
  const streaksLink = user.streaksOnelink || `https://swiggy.onelink.me/888564224/h6btndnt?code=${user.streaksQrCode || 'STREAK'}`;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.displayName || '');
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [editPhone, setEditPhone] = useState(user.phoneNumber || '');
  const [editShare, setEditShare] = useState(user.shareContactInfo || false);
  const [allPeers, setAllPeers] = useState<User[]>([]);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const fetchPeers = async () => {
      const users = await db.getAllUsers();
      setAllPeers(users.filter(u => u.id !== user.id && u.shareContactInfo));
    };
    fetchPeers();
  }, [user.id]);

  const openShare = (title: string, finalUrl: string) => {
    setShareTitle(title);
    setShareUrl(finalUrl);
    setShowShareModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const updatedUser = await db.updateUserAvatar(user.id, base64String);
        if (updatedUser) {
          onUserUpdate(updatedUser);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveContact = async () => {
    const updatedUser = await db.updateUser(user.id, {
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

  const handleQuickOptIn = async () => {
    const updated = await db.updateUser(user.id, { shareContactInfo: true });
    if (updated) {
      onUserUpdate(updated);
      setEditShare(true);
      alert('Networking enabled! Other interns can now see your contact details.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getQrUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data)}&v=${Date.now()}`;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        shareUrl={shareUrl} 
        title={shareTitle}
      />

      <header>
        <h2 className="heading-display text-[34px] text-[#141414] leading-none">Profile</h2>
      </header>

      <div className="bg-white p-7 md:p-10 rounded-2xl premium-card-shadow border border-[#E3DDD5] relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 items-center relative">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white bg-[#F8F5F1] flex items-center justify-center relative transition-all duration-400 group-hover:scale-105" style={{boxShadow:'0 8px 28px rgba(0,0,0,0.12)'}}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={44} className="text-[#D4CEC7]" />
              )}

              <button
                onClick={triggerFileInput}
                className="absolute inset-0 bg-[#141414]/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm"
              >
                <Camera size={20} className="mb-1" strokeWidth={2} />
                <span className="text-[9px] font-bold tracking-wide">Update</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 bg-swiggy-orange text-white p-2 rounded-xl border-[3px] border-white" style={{boxShadow:'0 4px 12px rgba(251,84,4,0.3)'}}>
              <ShieldCheck size={16} strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex-1 w-full">
            {!isEditing ? (
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                <div className="text-center md:text-left">
                  <h3 className="text-[28px] font-black text-[#141414] leading-none mb-2.5 tracking-tight">{user.displayName}</h3>
                  <div className="inline-flex items-center gap-1.5 bg-[#FEF0E6] text-swiggy-orange px-3.5 py-1.5 rounded-lg font-bold text-[10px] mb-5 tracking-[0.1em]">
                    <MapPin size={11} strokeWidth={2.5} /> {campusName}
                  </div>
                  <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
                    <div className="flex items-center gap-2 text-[#72665C] bg-[#F8F5F1] px-4 py-2.5 rounded-lg border border-[#E3DDD5] font-semibold text-[12px]">
                      <Mail size={14} className="text-[#C5BDB6]" strokeWidth={2} /> {user.email}
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center gap-2 text-[#72665C] bg-[#F8F5F1] px-4 py-2.5 rounded-lg border border-[#E3DDD5] font-semibold text-[12px]">
                        <Phone size={14} className="text-[#C5BDB6]" strokeWidth={2} /> {user.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-[#F8F5F1] border border-[#E3DDD5] rounded-lg text-[11px] font-bold text-[#72665C] hover:text-swiggy-orange hover:border-swiggy-orange/40 hover:bg-white transition-all self-center md:self-start active:scale-95 tracking-wide"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-400">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#A09488] ml-1 uppercase tracking-[0.12em]">Display name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-5 py-3.5 bg-[#F8F5F1] border border-[#E3DDD5] rounded-xl outline-none focus:bg-white focus:border-swiggy-orange font-bold text-[#141414] transition-all text-[14px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#A09488] ml-1 uppercase tracking-[0.12em]">Phone number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-5 py-3.5 bg-[#F8F5F1] border border-[#E3DDD5] rounded-xl outline-none focus:bg-white focus:border-swiggy-orange font-bold text-[#141414] transition-all text-[14px]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#A09488] ml-1 uppercase tracking-[0.12em]">Email ID</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-5 py-3.5 bg-[#F8F5F1] border border-[#E3DDD5] rounded-xl outline-none focus:bg-white focus:border-swiggy-orange font-bold text-[#141414] transition-all text-[14px]"
                  />
                </div>

                <div className="flex items-center justify-between p-5 bg-[#F8F5F1] rounded-xl border border-[#E3DDD5]">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${editShare ? 'bg-swiggy-orange text-white' : 'bg-white text-[#D4CEC7] border border-[#E3DDD5]'}`}>
                      <Users size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-[#141414] leading-none mb-0.5">Directory Visibility</p>
                      <p className="text-[10px] font-semibold text-[#A09488] tracking-wide">Allow peer catalysts to find your contact</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditShare(!editShare)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 focus:outline-none ${editShare ? 'bg-swiggy-orange' : 'bg-[#D4CEC7]'}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-250 mt-0.5 ${editShare ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={handleSaveContact}
                    className="px-7 py-3 swiggy-btn-gradient text-white rounded-xl text-[12px] font-bold flex items-center gap-2.5"
                  >
                    <Save size={15} strokeWidth={2.5} /> Confirm changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(user.displayName || '');
                      setEditEmail(user.email || '');
                      setEditPhone(user.phoneNumber || '');
                      setEditShare(user.shareContactInfo || false);
                    }}
                    className="px-7 py-3 bg-[#F8F5F1] border border-[#E3DDD5] text-[#72665C] rounded-xl text-[12px] font-bold hover:bg-[#F0EBE4] transition-all"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl premium-card-shadow border border-[#E3DDD5] text-center flex flex-col justify-between items-center group">
          <div className="w-full">
            <div className="w-12 h-12 bg-[#FEF0E6] text-swiggy-orange rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-400">
              <Ticket size={24} strokeWidth={2.5} />
            </div>
            <h4 className="text-[15px] font-black text-[#141414] mb-1 tracking-tight">Student Rewards QR</h4>
            <p className="text-[11px] text-[#A09488] font-semibold mb-8 tracking-wide">Share your unique QR code.</p>

            <div className="bg-[#F8F5F1] p-6 rounded-xl border-2 border-dashed border-[#E3DDD5] w-fit mx-auto mb-8 group-hover:bg-white group-hover:border-swiggy-orange/20 transition-colors">
              <div className="bg-white p-4 rounded-xl border border-[#E3DDD5]">
                <img
                  src={getQrUrl(rewardsLink)}
                  alt="Student Rewards QR"
                  className="w-40 h-40 object-contain mix-blend-multiply opacity-90"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => openShare("Join Swiggy Student Rewards!", rewardsLink)}
            className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold text-[11px] flex items-center justify-center gap-2.5 transition-all hover:bg-black active:scale-98 tracking-[0.1em] uppercase"
          >
            <Share2 size={16} strokeWidth={2.5} /> Distribute asset
          </button>
        </div>

        <div className="bg-white p-8 rounded-2xl premium-card-shadow border border-[#E3DDD5] text-center flex flex-col justify-between items-center group">
          <div className="w-full">
            <div className="w-12 h-12 bg-[#FEF0E6] text-swiggy-orange rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-400">
              <Zap size={24} strokeWidth={2.5} />
            </div>
            <h4 className="text-[15px] font-black text-[#141414] mb-1 tracking-tight">Campus Streaks QR</h4>
            <p className="text-[11px] text-[#A09488] font-semibold mb-8 tracking-wide">Share your unique QR code.</p>

            <div className="bg-[#F8F5F1] p-6 rounded-xl border-2 border-dashed border-[#E3DDD5] w-fit mx-auto mb-8 group-hover:bg-white group-hover:border-swiggy-orange/20 transition-colors">
              <div className="bg-white p-4 rounded-xl border border-[#E3DDD5]">
                <img
                  src={getQrUrl(streaksLink)}
                  alt="Campus Streaks QR"
                  className="w-40 h-40 object-contain mix-blend-multiply opacity-90"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => openShare("Activate your Campus Streak!", streaksLink)}
            className="w-full swiggy-btn-gradient text-white py-4 rounded-xl font-bold text-[11px] flex items-center justify-center gap-2.5 transition-all active:scale-98 tracking-[0.1em] uppercase"
          >
            <Share2 size={16} strokeWidth={2.5} /> Distribute asset
          </button>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-8 md:p-10 premium-card-shadow border border-[#E3DDD5]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-9">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#FEF0E6] text-swiggy-orange rounded-xl flex items-center justify-center">
              <Users size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[20px] font-black text-[#141414] tracking-tight leading-none">Catalyst contact directory</h3>
            </div>
          </div>
          {!user.shareContactInfo && (
            <button
              onClick={handleQuickOptIn}
              className="px-6 py-3 swiggy-btn-gradient text-white rounded-xl font-bold text-[11px] tracking-[0.1em] uppercase self-start"
            >
              Join directory
            </button>
          )}
        </div>

        {allPeers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {allPeers.map(peer => (
              <div key={peer.id} className="bg-[#F8F5F1] p-6 rounded-xl border border-[#E3DDD5] hover:bg-white hover:border-swiggy-orange/30 transition-all duration-300 group flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-[#E3DDD5] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                  {peer.avatarUrl ? (
                    <img src={peer.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={22} className="text-[#D4CEC7]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h5 className="font-black text-[#141414] truncate text-[14px] mb-0.5 tracking-tight group-hover:text-swiggy-orange transition-colors">{peer.displayName}</h5>
                  <div className="inline-flex items-center gap-1 text-[9px] text-swiggy-orange font-bold mb-3 bg-[#FEF0E6] px-2.5 py-1 rounded-md tracking-[0.1em]">
                    <MapPin size={9} strokeWidth={2.5} /> {db.getCampusName(peer.campusId)}
                  </div>
                  <div className="space-y-2">
                    <a href={`mailto:${peer.email}`} className="flex items-center gap-2 text-[11px] font-semibold text-[#72665C] hover:text-swiggy-orange transition-colors">
                      <Mail size={12} className="text-[#C5BDB6]" strokeWidth={2} /> {peer.email}
                    </a>
                    {peer.phoneNumber && (
                      <a href={`tel:${peer.phoneNumber}`} className="flex items-center gap-2 text-[11px] font-semibold text-[#72665C] hover:text-swiggy-orange transition-colors">
                        <Phone size={12} className="text-[#C5BDB6]" strokeWidth={2} /> {peer.phoneNumber}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-[#F8F5F1] rounded-xl border-2 border-dashed border-[#E3DDD5]">
            <h4 className="font-black text-[#141414] text-base tracking-tight">Syncing network...</h4>
            <p className="text-[11px] text-[#A09488] mt-2 font-semibold">Catalyst directory populates as peers opt-in.</p>
          </div>
        )}
      </section>

      <section className="space-y-7 pt-2">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 bg-swiggy-orange rounded-full"></div>
          <h3 className="text-[22px] font-black text-[#141414] tracking-tight leading-none">Swiggy Initiatives for Students</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          <InitiativeCard 
            title="Student Rewards"
            description="Unlock exclusive discounts on Swiggy One, Food Delivery, Dineout and more."
            image="https://i.postimg.cc/Fzyq3L0m/1000173235.jpg"
            href="https://urldefense.com/v3/__https://swiggy.onelink.me/888564224/Creative1__;!!BeGeivfSdT4o5A!hsxs5FkMWacQ0_KK95igsSofwQH8Eg88CS-ThbSwXWr-lNTXw3a0dSmPTTAPfznnsxldSstcCcD2WXyjzdzvH58g4g2nK1GGlg$"
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

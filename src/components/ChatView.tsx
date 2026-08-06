import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User as UserIcon, MessageSquare, Phone, MapPin, Loader2, ArrowLeft, 
  Image, Paperclip, Navigation, Tag, CheckCheck, Trash2, Archive, ShieldAlert, 
  Search, Check, X, ShieldOff, MoreVertical
} from 'lucide-react';
import { User as UserType } from '../types';

interface ChatPartner {
  partnerId: string;
  partnerName: string;
  partnerRole: 'buyer' | 'seller' | 'admin';
  partnerContact?: string;
  lastMessage: string;
  lastMessageAt: string;
  messageType?: string;
  treeId: string;
  treeName: string;
  unreadCount?: number;
  isOnline?: boolean;
  lastSeen?: string;
  isArchived?: boolean;
  isBlocked?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  treeId: string;
  treeName: string;
  content: string;
  messageType?: 'text' | 'image' | 'document' | 'location' | 'offer';
  mediaUrl?: string;
  mediaName?: string;
  locationData?: { lat: number; lng: number; address: string };
  offerData?: { offerPrice: number; status: 'pending' | 'accepted' | 'rejected' };
  isRead?: boolean;
  deletedFor?: string[];
  createdAt: string;
}

interface ChatViewProps {
  user: UserType | null;
  darkMode: boolean;
  setView: (view: string, params?: any) => void;
  initialPartnerId?: string;
  initialTreeId?: string;
}

export default function ChatView({
  user,
  darkMode,
  setView,
  initialPartnerId,
  initialTreeId
}: ChatViewProps) {
  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsgContent, setNewMsgContent] = useState<string>('');
  
  // Tab & Filters
  const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Rich Attachments State
  const [attachmentType, setAttachmentType] = useState<'none' | 'image' | 'document' | 'location' | 'offer'>('none');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [locationLat, setLocationLat] = useState<number>(20.5937);
  const [locationLng, setLocationLng] = useState<number>(78.9629);

  // Statuses
  const [loadingPartners, setLoadingPartners] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoadingPartners(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPartners(data);

        if (initialPartnerId) {
          const match = data.find((p: ChatPartner) => p.partnerId === initialPartnerId);
          if (match) {
            setSelectedPartner(match);
          } else {
            await fetchAndSetupNewPartner(initialPartnerId);
          }
        } else if (data.length > 0 && !selectedPartner) {
          setSelectedPartner(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch chat partners", err);
    } finally {
      setLoadingPartners(false);
    }
  };

  const fetchAndSetupNewPartner = async (partnerId: string) => {
    try {
      const token = localStorage.getItem('token');
      const resPartner = await fetch(`/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resPartner.ok) {
        const users: UserType[] = await resPartner.json();
        const pUser = users.find(u => u.id === partnerId);
        if (pUser) {
          const mockPartner: ChatPartner = {
            partnerId: pUser.id,
            partnerName: pUser.name,
            partnerRole: pUser.role,
            partnerContact: pUser.contactNumber,
            lastMessage: "Start a conversation...",
            lastMessageAt: new Date().toISOString(),
            treeId: initialTreeId || "",
            treeName: "",
            isOnline: true,
            lastSeen: new Date().toISOString()
          };
          setSelectedPartner(mockPartner);
          setPartners(prev => [mockPartner, ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedPartner) {
      fetchMessages(selectedPartner.partnerId);
      const interval = setInterval(() => {
        fetchMessages(selectedPartner.partnerId, true);
      }, 3000); // Poll messages every 3s
      return () => clearInterval(interval);
    }
  }, [selectedPartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchMessages = async (partnerId: string, isSilent = false) => {
    try {
      if (!isSilent) setLoadingMessages(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`/api/messages/conversations/${partnerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.partner && selectedPartner) {
          setSelectedPartner(prev => prev ? {
            ...prev,
            isOnline: data.partner.isOnline,
            lastSeen: data.partner.lastSeen,
            isBlocked: data.partner.isBlocked
          } : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isSilent) setLoadingMessages(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds limit of 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ base64Data })
        });
        if (res.ok) {
          const data = await res.json();
          setMediaUrl(data.url);
          setMediaFile(file);
        }
      } catch (err) {
        console.error("File upload failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    if (!newMsgContent.trim() && attachmentType === 'none') return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const payload: any = {
        receiverId: selectedPartner.partnerId,
        treeId: selectedPartner.treeId || initialTreeId || "",
        content: newMsgContent.trim(),
        messageType: attachmentType !== 'none' ? attachmentType : 'text'
      };

      if (attachmentType === 'image' || attachmentType === 'document') {
        payload.mediaUrl = mediaUrl;
        payload.mediaName = mediaFile?.name || 'attachment';
      } else if (attachmentType === 'location') {
        payload.locationData = {
          lat: locationLat,
          lng: locationLng,
          address: locationAddress || 'Shared Plantation Location'
        };
      } else if (attachmentType === 'offer') {
        payload.offerData = {
          offerPrice: Number(offerPrice),
          status: 'pending'
        };
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const sentMsg = await res.json();
        setMessages(prev => [...prev, sentMsg]);
        setNewMsgContent('');
        setAttachmentType('none');
        setMediaUrl('');
        setMediaFile(null);

        // Update partners list preview
        setPartners(prev => prev.map(p => {
          if (p.partnerId === selectedPartner.partnerId) {
            return {
              ...p,
              lastMessage: sentMsg.content || `[${sentMsg.messageType}]`,
              lastMessageAt: sentMsg.createdAt
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleArchive = async () => {
    if (!selectedPartner) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ partnerId: selectedPartner.partnerId })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedPartner(prev => prev ? { ...prev, isArchived: data.archived } : null);
        fetchPartners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedPartner) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: selectedPartner.partnerId })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedPartner(prev => prev ? { ...prev, isBlocked: data.blocked } : null);
        setShowOptionsModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportUser = async () => {
    if (!selectedPartner || !reportReason.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: selectedPartner.partnerId,
          reason: reportReason.trim()
        })
      });
      if (res.ok) {
        alert("Report submitted successfully to TreeMarket AI admin team.");
        setShowReportModal(false);
        setReportReason('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter partners list
  const filteredPartners = partners.filter(p => {
    const isArch = p.isArchived ?? false;
    if (activeTab === 'archived' && !isArch) return false;
    if (activeTab === 'all' && isArch) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.partnerName.toLowerCase().includes(q) || (p.treeName && p.treeName.toLowerCase().includes(q));
    }
    return true;
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 animate-fade-in">
        <MessageSquare className="w-16 h-16 text-brand-sage mb-4" />
        <h2 className="text-2xl font-serif font-bold mb-2">Access Denied</h2>
        <p className="text-brand-earth mb-6 max-w-sm">Please sign in to view your tree marketplace chats and negotiations.</p>
        <button onClick={() => setView('auth')} className="bg-brand-moss text-white px-6 py-2.5 rounded-full font-semibold hover:bg-brand-sage transition-all shadow-md">Sign In / Register</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 animate-fade-in" id="chat-view-container">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('home')} 
            className={`p-2 rounded-xl border cursor-pointer transition-all ${
              darkMode 
                ? 'border-brand-darkborder bg-brand-darkcard text-slate-300 hover:bg-brand-darkborder' 
                : 'border-brand-clay bg-white text-brand-moss hover:bg-brand-cream'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold flex items-center gap-2 text-brand-moss dark:text-white">
              <MessageSquare className="w-6 h-6 text-brand-sage" />
              Live Inbox & Negotiations
            </h1>
            <p className="text-xs text-brand-earth">Direct communication between tree buyers, farmers & nurseries.</p>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-12 rounded-2xl border overflow-hidden min-h-[72vh] ${
        darkMode ? 'bg-brand-darkcard/40 border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
      }`}>
        {/* Left Side: Partners list */}
        <div className={`md:col-span-4 border-r flex flex-col ${
          darkMode ? 'border-brand-darkborder' : 'border-brand-clay'
        } ${selectedPartner && 'hidden md:flex'}`}>
          
          {/* Search & Tabs */}
          <div className={`p-3 border-b space-y-2 ${
            darkMode ? 'border-brand-darkborder bg-brand-darkcard/60' : 'border-brand-clay bg-brand-sand/50'
          }`}>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-brand-earth absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                  darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-100' : 'bg-white border-brand-clay text-brand-moss'
                }`}
              />
            </div>

            <div className="flex gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'all'
                    ? 'bg-brand-moss text-white shadow-sm'
                    : darkMode ? 'bg-brand-darkcard text-slate-300' : 'bg-white text-brand-moss border border-brand-clay'
                }`}
              >
                Chats ({partners.filter(p => !p.isArchived).length})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'archived'
                    ? 'bg-brand-moss text-white shadow-sm'
                    : darkMode ? 'bg-brand-darkcard text-slate-300' : 'bg-white text-brand-moss border border-brand-clay'
                }`}
              >
                Archived ({partners.filter(p => p.isArchived).length})
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto max-h-[62vh]">
            {loadingPartners ? (
              <div className="flex flex-col items-center justify-center p-8 text-brand-earth gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-sage" />
                <span className="text-xs">Loading conversations...</span>
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-brand-earth py-16 gap-2">
                <MessageSquare className="w-10 h-10 text-brand-sage/40" />
                <p className="text-xs font-bold">No chats found.</p>
                <button onClick={() => setView('browse')} className="text-xs text-brand-sage font-bold hover:underline">Browse Marketplace</button>
              </div>
            ) : (
              filteredPartners.map((p) => {
                const isActive = selectedPartner?.partnerId === p.partnerId;
                return (
                  <button
                    key={p.partnerId}
                    onClick={() => setSelectedPartner(p)}
                    className={`w-full text-left p-3.5 border-b flex items-start gap-3 transition-colors cursor-pointer ${
                      isActive 
                        ? darkMode ? 'bg-brand-darkborder text-white' : 'bg-brand-clay/30' 
                        : darkMode ? 'border-brand-darkborder/50 hover:bg-brand-darkcard/80' : 'border-brand-clay/50 hover:bg-brand-sand/50'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-brand-sage/10 text-brand-sage border border-brand-sage/20 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {p.partnerName.charAt(0).toUpperCase()}
                      </div>
                      {p.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-brand-darkcard" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="font-bold text-xs truncate text-brand-moss dark:text-white">{p.partnerName}</h4>
                        <span className="text-[9px] text-brand-earth">
                          {new Date(p.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-brand-moss/15 text-brand-sage rounded">
                          {p.partnerRole}
                        </span>
                        {p.unreadCount && p.unreadCount > 0 ? (
                          <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                            {p.unreadCount} new
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-brand-earth truncate">{p.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Message Window */}
        <div className={`md:col-span-8 flex flex-col justify-between ${!selectedPartner && 'hidden md:flex'}`}>
          {selectedPartner ? (
            <>
              {/* Partner Header */}
              <div className={`p-3.5 border-b flex items-center justify-between ${
                darkMode ? 'border-brand-darkborder bg-brand-darkcard/60' : 'border-brand-clay bg-brand-sand/60'
              }`}>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedPartner(null)} 
                    className="p-1 md:hidden text-brand-sage hover:bg-brand-clay/10 rounded mr-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 bg-brand-moss/10 text-brand-sage border border-brand-moss/20 rounded-xl flex items-center justify-center font-bold text-base">
                      {selectedPartner.partnerName.charAt(0).toUpperCase()}
                    </div>
                    {selectedPartner.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-brand-darkcard" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-1.5 text-brand-moss dark:text-white">
                      {selectedPartner.partnerName}
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-brand-sage/20 text-brand-sage rounded">
                        {selectedPartner.partnerRole}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-brand-earth">
                      <span>{selectedPartner.isOnline ? 'Online now' : 'Offline'}</span>
                      {selectedPartner.partnerContact && (
                        <span className="flex items-center gap-0.5">
                          • <Phone className="w-3 h-3 text-brand-sage" />
                          {selectedPartner.partnerContact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Partner Action Menu */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleToggleArchive}
                    className="p-2 rounded-lg hover:bg-brand-clay/20 text-brand-earth cursor-pointer"
                    title={selectedPartner.isArchived ? "Unarchive Chat" : "Archive Chat"}
                  >
                    <Archive className={`w-4 h-4 ${selectedPartner.isArchived ? 'text-brand-sage' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                    title="Report User"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleBlockUser}
                    className={`p-2 rounded-lg cursor-pointer ${
                      selectedPartner.isBlocked ? 'bg-rose-500 text-white' : 'hover:bg-brand-clay/20 text-brand-earth'
                    }`}
                    title={selectedPartner.isBlocked ? "Unblock User" : "Block User"}
                  >
                    <ShieldOff className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message log */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[50vh] min-h-[42vh] space-y-3.5">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-sage" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-brand-earth">
                    <p className="text-xs font-semibold">No messages yet. Send a inquiry or offer to initiate trade!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user.id;
                    return (
                      <div 
                        key={m.id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                      >
                        <div className={`max-w-[75%] rounded-2xl p-3 shadow-xs relative ${
                          isMe 
                            ? 'bg-brand-moss text-white rounded-tr-none' 
                            : darkMode 
                              ? 'bg-brand-darkborder text-slate-100 rounded-tl-none' 
                              : 'bg-brand-sand border border-brand-clay/60 text-brand-moss rounded-tl-none'
                        }`}>
                          {/* Delete Message Hover Button */}
                          <button
                            onClick={() => handleDeleteMessage(m.id)}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* Message Content according to type */}
                          {m.messageType === 'image' && m.mediaUrl && (
                            <div className="mb-2 rounded-xl overflow-hidden max-h-52 border border-white/20">
                              <img src={m.mediaUrl} alt="Attached" className="w-full h-full object-cover" />
                            </div>
                          )}

                          {m.messageType === 'document' && m.mediaUrl && (
                            <a 
                              href={m.mediaUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-2 p-2 bg-black/10 rounded-xl mb-2 hover:bg-black/20 transition-all text-xs font-bold"
                            >
                              <Paperclip className="w-4 h-4" />
                              <span className="truncate">{m.mediaName || 'Document Attachment'}</span>
                            </a>
                          )}

                          {m.messageType === 'location' && m.locationData && (
                            <div className="p-2.5 bg-black/10 rounded-xl mb-2 text-xs space-y-1">
                              <div className="flex items-center gap-1 font-bold">
                                <Navigation className="w-3.5 h-3.5" /> GPS Location Shared
                              </div>
                              <p className="text-[11px] opacity-90">{m.locationData.address}</p>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${m.locationData.lat},${m.locationData.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mt-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                              >
                                Navigate via Google Maps
                              </a>
                            </div>
                          )}

                          {m.messageType === 'offer' && m.offerData && (
                            <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl mb-2 text-xs space-y-1">
                              <div className="flex items-center justify-between font-bold text-amber-300">
                                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Price Offer</span>
                                <span className="text-sm">₹{m.offerData.offerPrice.toLocaleString('en-IN')}</span>
                              </div>
                              <p className="text-[10px]">Target Tree Offer Proposal</p>
                            </div>
                          )}

                          {m.content && (
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                            <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                              <CheckCheck className={`w-3 h-3 ${m.isRead ? 'text-emerald-300' : 'opacity-60'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Rich Attachment Controls Bar */}
              {attachmentType !== 'none' && (
                <div className={`p-3 border-t flex items-center justify-between gap-2 text-xs font-bold ${
                  darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-brand-sand border-brand-clay'
                }`}>
                  <span className="text-brand-sage capitalize">Attach {attachmentType}:</span>
                  
                  {attachmentType === 'image' && (
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="text-xs" />
                  )}

                  {attachmentType === 'document' && (
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="text-xs" />
                  )}

                  {attachmentType === 'location' && (
                    <div className="flex gap-2 items-center flex-1">
                      <input
                        type="text"
                        placeholder="Location description"
                        value={locationAddress}
                        onChange={(e) => setLocationAddress(e.target.value)}
                        className="px-2 py-1 text-xs border rounded w-full"
                      />
                    </div>
                  )}

                  {attachmentType === 'offer' && (
                    <div className="flex items-center gap-2">
                      <span>Amount (₹):</span>
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(Number(e.target.value))}
                        className="w-28 px-2 py-1 text-xs border rounded font-bold"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => setAttachmentType('none')}
                    className="p-1 rounded bg-rose-500 text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Message Input Box */}
              <form 
                onSubmit={handleSendMessage} 
                className={`p-3 border-t flex gap-2 items-center ${
                  darkMode ? 'border-brand-darkborder bg-brand-darkcard/20' : 'border-brand-clay bg-brand-sand/30'
                }`}
              >
                {/* Attach Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAttachmentType('image')}
                    className="p-2 rounded-xl hover:bg-brand-clay/20 text-brand-earth cursor-pointer"
                    title="Send Image"
                  >
                    <Image className="w-4 h-4 text-brand-sage" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachmentType('document')}
                    className="p-2 rounded-xl hover:bg-brand-clay/20 text-brand-earth cursor-pointer"
                    title="Send Document"
                  >
                    <Paperclip className="w-4 h-4 text-brand-sage" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachmentType('location')}
                    className="p-2 rounded-xl hover:bg-brand-clay/20 text-brand-earth cursor-pointer"
                    title="Share GPS Location"
                  >
                    <Navigation className="w-4 h-4 text-brand-sage" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachmentType('offer')}
                    className="p-2 rounded-xl hover:bg-brand-clay/20 text-brand-earth cursor-pointer"
                    title="Make Price Offer"
                  >
                    <Tag className="w-4 h-4 text-amber-500" />
                  </button>
                </div>

                <input
                  type="text"
                  value={newMsgContent}
                  onChange={(e) => setNewMsgContent(e.target.value)}
                  placeholder={selectedPartner.isBlocked ? "You have blocked this user" : "Type a message or offer..."}
                  disabled={selectedPartner.isBlocked}
                  className={`flex-1 rounded-full px-4 py-2 text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                    darkMode 
                      ? 'bg-brand-darkcard border-brand-darkborder text-white placeholder-slate-500' 
                      : 'bg-white border-brand-clay text-brand-moss'
                  }`}
                />
                <button
                  type="submit"
                  disabled={sending || selectedPartner.isBlocked || (!newMsgContent.trim() && attachmentType === 'none')}
                  className="bg-brand-moss hover:bg-brand-sage disabled:bg-brand-earth/20 text-white p-2.5 rounded-full cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center text-brand-earth">
              <MessageSquare className="w-12 h-12 text-brand-sage/30 mb-2 animate-pulse" />
              <p className="text-xs font-medium">Select a negotiation thread to start chatting.</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-darkcard p-6 rounded-2xl max-w-sm w-full space-y-4 border border-brand-clay">
            <h3 className="font-bold text-base text-rose-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Report User
            </h3>
            <p className="text-xs text-brand-earth">
              Report inappropriate content, fraudulent pricing, or policy violations.
            </p>
            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="State reason for reporting..."
              className="w-full text-xs p-3 rounded-xl border font-medium focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-xs font-bold text-brand-earth"
              >
                Cancel
              </button>
              <button
                onClick={handleReportUser}
                className="bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

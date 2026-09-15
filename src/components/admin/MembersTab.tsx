import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  Music, 
  MapPin, 
  Award, 
  Play, 
  Square,
  X,
  Loader2,
  AlertTriangle,
  Headphones,
  Mic,
  Upload,
  Radio,
  FileAudio,
  Check
} from 'lucide-react';
import { CommunityMember } from '../../types';
import { saveCommunityMember, deleteCommunityMember } from '../../lib/supabase';
import { playBeatboxSound, stopBeatboxSound } from '../../utils/audioSynthesizer';
import { ImageUploader } from './ImageUploader';

interface MembersTabProps {
  items: (CommunityMember & { photoUrl: string })[];
  onRefresh: () => void;
}

export function MembersTab({ items, onRefresh }: MembersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(CommunityMember & { photoUrl: string }) | null>(null);
  const [deleteModalItem, setDeleteModalItem] = useState<(CommunityMember & { photoUrl: string }) | null>(null);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [area, setArea] = useState('');
  const [experience, setExperience] = useState('3 Years');
  const [voiceNoteTitle, setVoiceNoteTitle] = useState('Street Routine Freestyle');
  const [voiceNoteDuration, setVoiceNoteDuration] = useState('0:15');
  const [soundType, setSoundType] = useState<CommunityMember['soundType']>('bass-growl');
  const [avatarInitials, setAvatarInitials] = useState('');
  const [accentBg, setAccentBg] = useState('#FFC93C');
  const [photoUrl, setPhotoUrl] = useState('');

  // Voice Note Upload & Record State
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  // Audio References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordTimerRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const tableAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (tableAudioRef.current) {
        tableAudioRef.current.pause();
        tableAudioRef.current = null;
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
      stopBeatboxSound();
    };
  }, []);

  const stopAllPreviewAudio = () => {
    if (previewAudioRef.current) {
      try {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      } catch {
        // audio pause error
      }
    }
    setIsPreviewPlaying(false);
  };

  const openAddModal = () => {
    stopAllPreviewAudio();
    setEditingItem(null);
    setName('');
    setHandle('@');
    setSpecialty('Inward Bass / Throat Tap');
    setArea('Bandra West');
    setExperience('3 Years');
    setVoiceNoteTitle('Street Routine Freestyle');
    setVoiceNoteDuration('0:15');
    setSoundType('bass-growl');
    setAvatarInitials('');
    setAccentBg('#FFC93C');
    setPhotoUrl('');
    setAudioUrl('');
    setAudioFileName('');
    setIsRecording(false);
    setRecordSeconds(0);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (item: CommunityMember & { photoUrl: string }) => {
    stopAllPreviewAudio();
    setEditingItem(item);
    setName(item.name);
    setHandle(item.handle);
    setSpecialty(item.specialty);
    setArea(item.area);
    setExperience(item.experience);
    setVoiceNoteTitle(item.voiceNoteTitle || 'Street Routine Freestyle');
    setVoiceNoteDuration(item.voiceNoteDuration || '0:15');
    setSoundType(item.soundType || 'bass-growl');
    setAvatarInitials(item.avatarInitials || item.name.slice(0, 2).toUpperCase());
    setAccentBg(item.accentBg || '#FFC93C');
    setPhotoUrl(item.photoUrl || '');
    
    const existingAudio = item.audioUrl || item.audio_url || '';
    setAudioUrl(existingAudio);
    setAudioFileName(existingAudio ? 'Recorded / Uploaded Voice Note' : '');
    setIsRecording(false);
    setRecordSeconds(0);
    setErrorMessage(null);
    setModalOpen(true);
  };

  // Audio File Upload Handler
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAudioUrl(dataUrl);

      // Detect audio length
      try {
        const temp = new Audio(dataUrl);
        temp.onloadedmetadata = () => {
          if (temp.duration && !isNaN(temp.duration) && temp.duration > 0) {
            const mins = Math.floor(temp.duration / 60);
            const secs = Math.floor(temp.duration % 60);
            setVoiceNoteDuration(`${mins}:${String(secs).padStart(2, '0')}`);
          }
        };
      } catch {
        // ignore metadata calculation failure
      }
    };
    reader.readAsDataURL(file);
  };

  // Microphone Live Recording
  const startRecording = async () => {
    try {
      stopAllPreviewAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setAudioUrl(dataUrl);
          setAudioFileName(`voice_drop_${Date.now()}.webm`);

          try {
            const temp = new Audio(dataUrl);
            temp.onloadedmetadata = () => {
              if (temp.duration && !isNaN(temp.duration) && temp.duration > 0) {
                const mins = Math.floor(temp.duration / 60);
                const secs = Math.floor(temp.duration % 60);
                setVoiceNoteDuration(`${mins}:${String(secs).padStart(2, '0')}`);
              }
            };
          } catch {
            // ignore
          }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone recording error:', err);
      setErrorMessage('Microphone access denied or not supported in this browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  // Toggle preview inside modal
  const togglePreviewAudio = () => {
    if (!audioUrl) return;

    if (previewAudioRef.current) {
      if (isPreviewPlaying) {
        previewAudioRef.current.pause();
        setIsPreviewPlaying(false);
      } else {
        previewAudioRef.current.play().catch(() => setIsPreviewPlaying(false));
        setIsPreviewPlaying(true);
      }
    } else {
      const audio = new Audio(audioUrl);
      previewAudioRef.current = audio;
      audio.onended = () => setIsPreviewPlaying(false);
      audio.onerror = () => setIsPreviewPlaying(false);
      audio.play().catch(() => setIsPreviewPlaying(false));
      setIsPreviewPlaying(true);
    }
  };

  const handleSoundTest = (item: CommunityMember & { photoUrl: string }) => {
    const memberAudio = item.audioUrl || item.audio_url;

    if (activeSoundId === item.id) {
      if (tableAudioRef.current) {
        tableAudioRef.current.pause();
        tableAudioRef.current = null;
      }
      stopBeatboxSound();
      setActiveSoundId(null);
      return;
    }

    if (tableAudioRef.current) {
      tableAudioRef.current.pause();
      tableAudioRef.current = null;
    }
    stopBeatboxSound();
    setActiveSoundId(item.id);

    if (memberAudio && memberAudio.trim() !== '') {
      try {
        const audio = new Audio(memberAudio);
        tableAudioRef.current = audio;
        audio.onended = () => setActiveSoundId(null);
        audio.onerror = () => setActiveSoundId(null);
        audio.play().catch(() => setActiveSoundId(null));
      } catch {
        setActiveSoundId(null);
      }
    } else {
      playBeatboxSound(item.soundType);
      setTimeout(() => {
        setActiveSoundId((cur) => (cur === item.id ? null : cur));
      }, 5000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim() || !specialty.trim() || !area.trim()) {
      setErrorMessage('Please fill in name, handle, specialty, and area.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const initials = avatarInitials.trim() || name.trim().slice(0, 2).toUpperCase();

    const payload = {
      id: editingItem?.id,
      name: name.trim(),
      handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
      specialty: specialty.trim(),
      area: area.trim(),
      experience: experience.trim() || '2 Years',
      voiceNoteTitle: voiceNoteTitle.trim() || 'Freestyle Voice Note',
      voiceNoteDuration: voiceNoteDuration.trim() || '0:15',
      soundType,
      avatarInitials: initials,
      accentBg: accentBg || '#FFC93C',
      photoUrl: photoUrl.trim(),
      audioUrl: audioUrl.trim(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    const res = await saveCommunityMember(payload);
    setSaving(false);

    if (res.success) {
      stopAllPreviewAudio();
      setModalOpen(false);
      setSuccessToast(editingItem ? 'Beatboxer profile & voice note updated!' : 'New member profile & voice note saved!');
      setTimeout(() => setSuccessToast(null), 3500);
      onRefresh();
    } else {
      setErrorMessage(res.error || 'Failed to save member profile.');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalItem) return;
    setDeleting(true);

    const res = await deleteCommunityMember(deleteModalItem.id);
    setDeleting(false);

    if (res.success) {
      setDeleteModalItem(null);
      setSuccessToast('Member profile removed from Supabase.');
      setTimeout(() => setSuccessToast(null), 3500);
      onRefresh();
    } else {
      alert(res.error || 'Failed to delete member.');
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.handle.toLowerCase().includes(q) ||
      item.specialty.toLowerCase().includes(q) ||
      item.area.toLowerCase().includes(q) ||
      item.soundType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 font-mono text-xs flex items-center justify-between">
          <span>{successToast}</span>
          <button type="button" onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1713] p-4 border border-[#F4EFE4]/15">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#F4EFE4]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roster by name, handle, specialty, area..."
            className="w-full pl-9 pr-4 py-2 bg-[#14120F] border border-[#F4EFE4]/20 text-xs font-mono text-[#F4EFE4] placeholder-[#F4EFE4]/40 focus:border-[#FFC93C] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#F4EFE4]/60">
            {filteredItems.length} of {items.length} beatboxers
          </span>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono font-bold text-xs uppercase tracking-wider border border-[#14120F] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#14120F] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Table */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-[#1A1713] border border-dashed border-[#F4EFE4]/20 p-8">
          <Users className="w-10 h-10 text-[#FFC93C]/50 mx-auto mb-3" />
          <h3 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4]">No Community Members Found</h3>
          <p className="font-mono text-xs text-[#F4EFE4]/60 mt-1 max-w-sm mx-auto">
            {items.length === 0
              ? 'The Supabase members table is currently empty. Click "Add Member" to register your first beatboxer profile.'
              : 'No members match your search query.'}
          </p>
          {items.length === 0 && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-[#FFC93C] text-[#14120F] font-mono font-bold text-xs uppercase cursor-pointer"
            >
              + Add First Beatboxer
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#1A1713] border border-[#F4EFE4]/15 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#14120F] border-b border-[#F4EFE4]/15 text-[#FFC93C] uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5 w-14">Artist</th>
                <th className="p-3.5">Name & Handle</th>
                <th className="p-3.5">Specialty</th>
                <th className="p-3.5">Area / Exp</th>
                <th className="p-3.5">Sound Routine</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE4]/10 text-[#F4EFE4]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#14120F]/60 transition-colors">
                  <td className="p-3.5">
                    <div 
                      className="w-10 h-10 border border-[#F4EFE4]/20 flex items-center justify-center font-['Anton'] text-base overflow-hidden"
                      style={{ backgroundColor: item.photoUrl ? 'transparent' : (item.accentBg || '#FFC93C'), color: '#14120F' }}
                    >
                      {item.photoUrl ? (
                        <img 
                          src={item.photoUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        item.avatarInitials || item.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-[#F4EFE4] text-sm">{item.name}</div>
                    <div className="text-[#FFC93C] text-[11px] font-bold">{item.handle}</div>
                  </td>
                  <td className="p-3.5 text-[#F4EFE4]/90 whitespace-nowrap">
                    <div>{item.specialty}</div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-[#14120F] border border-[#F4EFE4]/20 text-[10px] text-[#F4EFE4]/60">
                      {item.soundType}
                    </span>
                  </td>
                  <td className="p-3.5 text-[#F4EFE4]/80 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FFC93C]" />
                      <span>{item.area}</span>
                    </div>
                    <div className="text-[11px] text-[#F4EFE4]/50 mt-0.5">{item.experience}</div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleSoundTest(item)}
                        className={`px-2.5 py-1 border text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                          activeSoundId === item.id
                            ? 'bg-[#FFC93C] text-[#14120F] border-[#FFC93C]'
                            : 'bg-[#14120F] text-[#F4EFE4]/80 border-[#F4EFE4]/20 hover:border-[#FFC93C]'
                        }`}
                      >
                        {activeSoundId === item.id ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Stop ({item.voiceNoteDuration})</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{item.audioUrl || item.audio_url ? 'Play Voice Note' : 'Audition'} ({item.voiceNoteDuration})</span>
                          </>
                        )}
                      </button>
                      {(item.audioUrl || item.audio_url) && (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <Mic className="w-2.5 h-2.5" /> Uploaded Voice Note
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1.5 bg-[#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] border border-[#F4EFE4]/20 transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteModalItem(item)}
                        className="p-1.5 bg-[#14120F] hover:bg-[#E4402A] hover:text-white border border-[#F4EFE4]/20 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#1A1713] border-2 border-[#FFC93C] shadow-[8px_8px_0px_0px_#14120F] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F4EFE4]/15 pb-3 mb-4">
              <h3 className="font-['Anton'] text-2xl uppercase tracking-wide text-[#F4EFE4]">
                {editingItem ? 'Edit Member Profile' : 'Add Community Beatboxer'}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="text-[#F4EFE4]/60 hover:text-[#FFC93C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-[#E4402A]/15 border border-[#E4402A] text-[#F4EFE4] text-xs font-mono">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Artist Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Karan Shinde"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Social / Beatbox Handle *</label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@subzero_mumbai"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Vocal Specialty *</label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Inward Bass / Liproll"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Area / Neighborhood *</label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Dadar West / Carter Rd"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Experience</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 4 Years"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Sound Synthesizer Type</label>
                  <select
                    value={soundType}
                    onChange={(e) => setSoundType(e.target.value as CommunityMember['soundType'])}
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  >
                    <option value="bass-growl">bass-growl (Inward & Sub Bass)</option>
                    <option value="liproll">liproll (Liproll & Glitch)</option>
                    <option value="fast-tech">fast-tech (Fast Tech & Speed)</option>
                    <option value="polyphonic">polyphonic (Harmonics & Poly)</option>
                    <option value="scratch">scratch (Vinyl Scratch)</option>
                    <option value="trap-click">trap-click (Trap & 808s)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Voice Note Title</label>
                  <input
                    type="text"
                    value={voiceNoteTitle}
                    onChange={(e) => setVoiceNoteTitle(e.target.value)}
                    placeholder="e.g. Bassline Routine"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Duration (voice_note_duration)</label>
                  <input
                    type="text"
                    value={voiceNoteDuration}
                    onChange={(e) => setVoiceNoteDuration(e.target.value)}
                    placeholder="0:15"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  />
                </div>
              </div>

              {/* AUTHENTIC VOICE NOTE UPLOAD & AUDIO RECORDER */}
              <div className="p-4 bg-[#14120F] border border-[#FFC93C]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FFC93C] uppercase">
                    <Mic className="w-4 h-4 text-[#FFC93C]" />
                    <span>Member Voice Note (Audio File)</span>
                  </div>
                  {audioUrl && (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" /> Audio Attached
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#F4EFE4]/70">
                  Upload an audio file (MP3, WAV, M4A, OGG, WebM) or record live via your microphone. This voice note will play when visitors click this member&apos;s card on the frontend.
                </p>

                {/* Upload & Record Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className="px-3.5 py-2 bg-[#1A1713] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#F4EFE4]/30 hover:border-[#FFC93C] transition-colors cursor-pointer flex items-center gap-2 font-mono text-xs font-bold uppercase">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Audio File</span>
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac"
                      className="hidden"
                      onChange={handleAudioFileUpload}
                    />
                  </label>

                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-3.5 py-2 bg-[#E4402A] text-white font-mono text-xs font-bold uppercase flex items-center gap-2 animate-pulse cursor-pointer border border-[#E4402A]"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Recording ({recordSeconds}s)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-3.5 py-2 bg-[#1A1713] hover:bg-[#E4402A] text-[#F4EFE4] hover:text-white border border-[#F4EFE4]/30 hover:border-[#E4402A] transition-colors cursor-pointer flex items-center gap-2 font-mono text-xs font-bold uppercase"
                    >
                      <Radio className="w-3.5 h-3.5 text-[#E4402A]" />
                      <span>Record via Mic</span>
                    </button>
                  )}
                </div>

                {/* Audio URL Input */}
                <div>
                  <label className="block text-[10px] uppercase text-[#F4EFE4]/60 mb-1">
                    Or paste direct Audio URL:
                  </label>
                  <input
                    type="url"
                    value={audioUrl}
                    onChange={(e) => {
                      setAudioUrl(e.target.value);
                      setAudioFileName(e.target.value ? 'Custom Audio URL' : '');
                    }}
                    placeholder="https://.../routine.mp3 or data:audio/..."
                    className="w-full px-3 py-1.5 bg-[#1A1713] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] text-[11px] focus:outline-none"
                  />
                </div>

                {/* Attached Audio Player Preview */}
                {audioUrl && (
                  <div className="p-3 bg-[#1A1713] border border-emerald-500/40 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileAudio className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-[#F4EFE4] font-bold truncate">
                          {audioFileName || 'Member Voice Note Attached'}
                        </div>
                        <div className="text-[10px] text-emerald-400">Ready to play on frontend</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={togglePreviewAudio}
                        className="px-3 py-1 bg-[#FFC93C] text-[#14120F] hover:bg-[#ffe082] font-bold uppercase text-[11px] flex items-center gap-1.5 cursor-pointer"
                      >
                        {isPreviewPlaying ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Play Test</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          stopAllPreviewAudio();
                          setAudioUrl('');
                          setAudioFileName('');
                        }}
                        className="p-1 bg-[#14120F] text-[#F4EFE4]/60 hover:text-[#E4402A] border border-[#F4EFE4]/20 cursor-pointer"
                        title="Remove Audio"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Avatar Initials (e.g. KS)</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={avatarInitials}
                    onChange={(e) => setAvatarInitials(e.target.value.toUpperCase())}
                    placeholder="KS"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Accent Background Color</label>
                  <input
                    type="text"
                    value={accentBg}
                    onChange={(e) => setAccentBg(e.target.value)}
                    placeholder="#FFC93C or #E4402A"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  />
                </div>
              </div>

              {/* Cloudinary Profile Photo Uploader (stores secure_url in members.photo_url) */}
              <ImageUploader
                label="Member Profile Photo (Upload or URL)"
                value={photoUrl}
                onChange={setPhotoUrl}
                folder="mbh_media/members"
                recommendedAspect="1:1 Square Avatar"
                placeholder="https://res.cloudinary.com/... or upload photo"
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4EFE4]/15">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-[#F4EFE4]/70 hover:text-white border border-[#F4EFE4]/20 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Member' : 'Save To Supabase'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#1A1713] border-2 border-[#E4402A] shadow-[8px_8px_0px_0px_#14120F] p-6 font-mono">
            <div className="flex items-center gap-3 text-[#E4402A] mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4]">
                Confirm Member Removal
              </h3>
            </div>

            <p className="text-xs text-[#F4EFE4]/80 leading-relaxed mb-4">
              Are you sure you want to permanently delete beatboxer:
              <strong className="block text-[#FFC93C] text-sm mt-1">{deleteModalItem.name} ({deleteModalItem.handle})</strong>
              This will remove the artist from Supabase <code className="text-[#FFC93C]">members</code> table.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4EFE4]/15 text-xs">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                disabled={deleting}
                className="px-4 py-2 text-[#F4EFE4]/70 hover:text-white border border-[#F4EFE4]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-[#E4402A] hover:bg-[#ff5a43] text-white font-bold uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Member</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

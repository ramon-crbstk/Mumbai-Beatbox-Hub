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
  MicOff,
  Upload,
  Radio,
  FileAudio,
  Check
} from 'lucide-react';
import { CommunityMember } from '../../types';
import { saveCommunityMember, deleteCommunityMember } from '../../lib/supabase';
import { uploadAudioToCloudinary, validateAudioFile, CLOUDINARY_FOLDERS } from '../../lib/cloudinary';
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
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadAudioProgress, setUploadAudioProgress] = useState(0);

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
    setIsUploadingAudio(false);
    setUploadAudioProgress(0);
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
    const rawPhoto = item.photo_url !== undefined ? item.photo_url : item.photoUrl;
    setPhotoUrl(rawPhoto || '');
    
    const existingAudio = item.voice_note_url !== undefined ? item.voice_note_url : item.voiceNoteUrl;
    setAudioUrl(existingAudio || '');
    setAudioFileName(existingAudio ? 'Cloudinary Voice Note Attached' : '');
    setIsUploadingAudio(false);
    setUploadAudioProgress(0);
    setIsRecording(false);
    setRecordSeconds(0);
    setErrorMessage(null);
    setModalOpen(true);
  };

  // Audio File Upload Handler - Uploads directly to Cloudinary (folder: mumbai-beatbox-hub/members/audio)
  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid audio file.');
      return;
    }

    setErrorMessage(null);
    setIsUploadingAudio(true);
    setUploadAudioProgress(0);
    setAudioFileName(file.name);

    try {
      const res = await uploadAudioToCloudinary(file, {
        folder: CLOUDINARY_FOLDERS.memberVoiceNotes,
        onProgress: (pct) => setUploadAudioProgress(pct),
      });

      setIsUploadingAudio(false);

      if (res.success && res.secureUrl) {
        setAudioUrl(res.secureUrl);
        setAudioFileName(file.name);

        // Detect audio duration from Cloudinary file
        try {
          const temp = new Audio(res.secureUrl);
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
      } else {
        setErrorMessage(res.error || 'Failed to upload audio to Cloudinary.');
        setAudioUrl('');
        setAudioFileName('');
      }
    } catch {
      setIsUploadingAudio(false);
      setErrorMessage('Audio upload failed. Please check network connection.');
    }
  };

  // Microphone Live Recording - Uploads blob to Cloudinary on stop
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

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());

        setIsUploadingAudio(true);
        setUploadAudioProgress(0);
        setErrorMessage(null);

        const recordedFile = new File([blob], `voice_drop_${Date.now()}.webm`, { type: mimeType });
        try {
          const res = await uploadAudioToCloudinary(recordedFile, {
            folder: CLOUDINARY_FOLDERS.memberVoiceNotes,
            onProgress: (pct) => setUploadAudioProgress(pct),
          });

          setIsUploadingAudio(false);

          if (res.success && res.secureUrl) {
            setAudioUrl(res.secureUrl);
            setAudioFileName(`voice_drop_${Date.now()}.webm`);
            const mins = Math.floor(recordSeconds / 60);
            const secs = recordSeconds % 60;
            setVoiceNoteDuration(`${mins}:${String(secs).padStart(2, '0')}`);
          } else {
            setErrorMessage(res.error || 'Failed to upload recorded voice note to Cloudinary.');
          }
        } catch {
          setIsUploadingAudio(false);
          setErrorMessage('Failed to upload recording to Cloudinary.');
        }
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
    const memberAudio = item.voice_note_url !== undefined ? item.voice_note_url : item.voiceNoteUrl;

    if (activeSoundId === item.id) {
      if (tableAudioRef.current) {
        tableAudioRef.current.pause();
        tableAudioRef.current = null;
      }
      setActiveSoundId(null);
      return;
    }

    if (tableAudioRef.current) {
      tableAudioRef.current.pause();
      tableAudioRef.current = null;
    }
    setActiveSoundId(null);

    // Only play if member has real uploaded voice_note_url - NO demo sound generator
    if (memberAudio && memberAudio.trim() !== '' && !memberAudio.startsWith('data:') && !memberAudio.startsWith('blob:')) {
      try {
        setActiveSoundId(item.id);
        const audio = new Audio(memberAudio.trim());
        tableAudioRef.current = audio;
        audio.onended = () => setActiveSoundId(null);
        audio.onerror = () => setActiveSoundId(null);
        audio.play().catch(() => setActiveSoundId(null));
      } catch {
        setActiveSoundId(null);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim() || !specialty.trim() || !area.trim()) {
      setErrorMessage('Please fill in name, handle, specialty, and area.');
      return;
    }

    if (isUploadingAudio) {
      setErrorMessage('Please wait until the voice note finishes uploading to Cloudinary.');
      return;
    }

    const trimmedPhoto = photoUrl.trim();
    if (trimmedPhoto.startsWith('data:') || trimmedPhoto.startsWith('blob:')) {
      setErrorMessage('Photo is in a temporary local format. Please re-upload so it is saved to Cloudinary.');
      return;
    }

    const trimmedAudio = audioUrl.trim();
    if (trimmedAudio.startsWith('data:') || trimmedAudio.startsWith('blob:')) {
      setErrorMessage('Voice note is in a temporary local format. Please re-upload so it is saved to Cloudinary.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const initials = avatarInitials.trim() || name.trim().slice(0, 2).toUpperCase();
    const finalPhotoUrl = trimmedPhoto !== '' ? trimmedPhoto : null;
    const finalVoiceNoteUrl = trimmedAudio !== '' ? trimmedAudio : null;

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
      photo_url: finalPhotoUrl,
      photoUrl: finalPhotoUrl || '',
      voice_note_url: finalVoiceNoteUrl,
      voiceNoteUrl: finalVoiceNoteUrl,
      audioUrl: finalVoiceNoteUrl,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    const res = await saveCommunityMember(payload);
    setSaving(false);

    if (res.success) {
      stopAllPreviewAudio();
      setModalOpen(false);
      setSuccessToast(editingItem ? 'Beatboxer profile & media updated in Supabase!' : 'New member profile & media saved in Supabase!');
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
                    {(() => {
                      const displayPhoto = item.photo_url || item.photoUrl;
                      return (
                        <div 
                          className="w-10 h-10 border border-[#F4EFE4]/20 flex items-center justify-center font-['Anton'] text-base overflow-hidden"
                          style={{ backgroundColor: displayPhoto ? 'transparent' : (item.accentBg || '#FFC93C'), color: '#14120F' }}
                        >
                          {displayPhoto ? (
                            <img 
                              src={displayPhoto} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            item.avatarInitials || item.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                      );
                    })()}
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
                    {(() => {
                      const rawAudio = item.voice_note_url !== undefined ? item.voice_note_url : item.voiceNoteUrl;
                      const hasAudio = Boolean(rawAudio && rawAudio.trim() !== '' && !rawAudio.startsWith('data:') && !rawAudio.startsWith('blob:'));
                      if (!hasAudio) {
                        return (
                          <span className="text-[11px] text-[#F4EFE4]/40 font-mono flex items-center gap-1.5">
                            <MicOff className="w-3 h-3 text-[#F4EFE4]/30" />
                            <span>No Audio</span>
                          </span>
                        );
                      }
                      return (
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
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Play ({item.voiceNoteDuration || '0:15'})</span>
                              </>
                            )}
                          </button>
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <Mic className="w-2.5 h-2.5" /> Uploaded Voice Note
                          </span>
                        </div>
                      );
                    })()}
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

              {/* =========================================================================
                  UPLOAD SECTION 1: MEMBER PROFILE PHOTO (Cloudinary mumbai-beatbox-hub/members/photos/)
                  ========================================================================= */}
              <div className="p-4 bg-[#14120F] border border-[#FFC93C]/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FFC93C] uppercase">
                    <Upload className="w-4 h-4 text-[#FFC93C]" />
                    <span>1. Member Profile Photo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#FFC93C]/10 text-[#FFC93C] border border-[#FFC93C]/30 text-[9px] font-mono uppercase font-bold">
                      Folder: mumbai-beatbox-hub/members/photos/
                    </span>
                    <span className="px-2 py-0.5 bg-[#F4EFE4]/10 text-[#F4EFE4]/70 border border-[#F4EFE4]/20 text-[9px] font-mono uppercase font-bold">
                      Column: members.photo_url
                    </span>
                    {photoUrl && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                        <Check className="w-3 h-3" /> Photo Attached
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-[#F4EFE4]/70 leading-relaxed">
                  Upload an artist photo (JPG, PNG, WEBP, AVIF). Uploads directly to Cloudinary folder <code className="text-[#FFC93C] font-mono">mumbai-beatbox-hub/members/photos/</code> and writes the secure HTTPS URL to <code className="text-[#FFC93C] font-mono">members.photo_url</code>. If cleared, sets photo_url to NULL and displays initials avatar on public card.
                </p>

                <ImageUploader
                  label="Member Photo File / URL"
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  folder={CLOUDINARY_FOLDERS.memberPhotos}
                  recommendedAspect="1:1 Square Avatar"
                  placeholder="https://res.cloudinary.com/... or upload photo"
                />
              </div>

              {/* =========================================================================
                  UPLOAD SECTION 2: MEMBER VOICE NOTE (Cloudinary mumbai-beatbox-hub/members/voice-notes/)
                  ========================================================================= */}
              <div className="p-4 bg-[#14120F] border border-[#FFC93C]/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FFC93C] uppercase">
                    <Mic className="w-4 h-4 text-[#FFC93C]" />
                    <span>2. Member Voice Note / Audio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#FFC93C]/10 text-[#FFC93C] border border-[#FFC93C]/30 text-[9px] font-mono uppercase font-bold">
                      Folder: mumbai-beatbox-hub/members/voice-notes/
                    </span>
                    <span className="px-2 py-0.5 bg-[#F4EFE4]/10 text-[#F4EFE4]/70 border border-[#F4EFE4]/20 text-[9px] font-mono uppercase font-bold">
                      Column: members.voice_note_url
                    </span>
                    {audioUrl && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                        <Check className="w-3 h-3" /> Audio Attached
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-[#F4EFE4]/70 leading-relaxed">
                  Upload an audio file (MP3, WAV, M4A, OGG, WebM) or record live via your microphone. Uploads directly to Cloudinary folder <code className="text-[#FFC93C] font-mono">mumbai-beatbox-hub/members/voice-notes/</code> and writes the secure HTTPS URL to <code className="text-[#FFC93C] font-mono">members.voice_note_url</code>. If removed, sets voice_note_url to NULL and public card will show &quot;NO VOICE NOTE&quot; with zero audio played.
                </p>

                {/* Upload & Record Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className={`px-3.5 py-2 border transition-colors flex items-center gap-2 font-mono text-xs font-bold uppercase ${
                    isUploadingAudio
                      ? 'bg-[#1A1713] text-[#F4EFE4]/40 border-[#F4EFE4]/10 cursor-not-allowed'
                      : 'bg-[#1A1713] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border-[#F4EFE4]/30 hover:border-[#FFC93C] cursor-pointer'
                  }`}>
                    {isUploadingAudio ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFC93C]" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingAudio ? 'Uploading to Cloudinary...' : 'Upload Voice Note'}</span>
                    <input
                      type="file"
                      disabled={isUploadingAudio}
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
                      disabled={isUploadingAudio}
                      onClick={startRecording}
                      className="px-3.5 py-2 bg-[#1A1713] hover:bg-[#E4402A] text-[#F4EFE4] hover:text-white border border-[#F4EFE4]/30 hover:border-[#E4402A] transition-colors cursor-pointer flex items-center gap-2 font-mono text-xs font-bold uppercase disabled:opacity-50"
                    >
                      <Radio className="w-3.5 h-3.5 text-[#E4402A]" />
                      <span>Record via Mic</span>
                    </button>
                  )}
                </div>

                {/* Cloudinary Audio Upload Progress */}
                {isUploadingAudio && (
                  <div className="p-3 bg-[#1A1713] border border-[#FFC93C]/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-[#FFC93C]">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading Voice Note to Cloudinary...
                      </span>
                      <span>{uploadAudioProgress}%</span>
                    </div>
                    <div className="w-full bg-[#14120F] h-1.5 overflow-hidden">
                      <div
                        className="bg-[#FFC93C] h-full transition-all duration-150"
                        style={{ width: `${uploadAudioProgress}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[#F4EFE4]/50 font-mono">
                      Destination: mumbai-beatbox-hub/members/voice-notes/
                    </div>
                  </div>
                )}

                {/* Audio URL Input */}
                <div>
                  <label className="block text-[10px] uppercase text-[#F4EFE4]/60 mb-1">
                    Or paste direct Cloudinary Voice Note URL:
                  </label>
                  <input
                    type="url"
                    value={audioUrl}
                    onChange={(e) => {
                      setAudioUrl(e.target.value);
                      setAudioFileName(e.target.value ? 'Custom Hosted Audio URL' : '');
                    }}
                    placeholder="https://res.cloudinary.com/.../voice_notes/...mp3"
                    className="w-full px-3 py-1.5 bg-[#1A1713] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] text-[11px] focus:outline-none font-mono"
                  />
                </div>

                {/* Attached Audio Player Preview with REMOVE AUDIO button */}
                {audioUrl ? (
                  <div className="p-3 bg-[#1A1713] border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileAudio className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-[#F4EFE4] font-bold truncate">
                          {audioFileName || 'Cloudinary Voice Note Attached'}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono truncate">
                          {audioUrl.startsWith('http') ? audioUrl : 'Audio attached'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={togglePreviewAudio}
                        className="px-3 py-1 bg-[#FFC93C] text-[#14120F] hover:bg-[#ffe082] font-bold uppercase text-[11px] flex items-center gap-1.5 cursor-pointer font-mono"
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

                      {/* Explicit REMOVE AUDIO Button */}
                      <button
                        type="button"
                        onClick={() => {
                          stopAllPreviewAudio();
                          setAudioUrl('');
                          setAudioFileName('');
                        }}
                        className="px-2.5 py-1 bg-[#E4402A]/20 hover:bg-[#E4402A] text-[#E4402A] hover:text-white border border-[#E4402A]/40 font-mono text-[11px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                        title="Remove audio and set voice_note_url to null"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>REMOVE AUDIO</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-[#1A1713] border border-dashed border-[#F4EFE4]/15 text-[11px] text-[#F4EFE4]/50 flex items-center gap-2 font-mono">
                    <MicOff className="w-3.5 h-3.5 text-[#F4EFE4]/30" />
                    <span>No Voice Note attached. Public card will show &quot;NO VOICE NOTE&quot; and disable playback.</span>
                  </div>
                )}
              </div>

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

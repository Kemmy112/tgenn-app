import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { supabase } from '../supabase';

export default function ProfileModal({ isOpen, onClose, profile, setProfile }) {
  
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Build a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (uploadError) return alert("Upload failed");

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profile.id);

    if (!updateError) {
      setProfile({ ...profile, avatar_url: publicUrl });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white">
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center">
               <div className="relative group mb-6">
                 <img 
                   src={profile?.avatar_url || 'https://via.placeholder.com/150'} 
                   className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500"
                 />
                 <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                   <Plus className="text-white" />
                   <input type="file" className="hidden" onChange={handleAvatarUpload} />
                 </label>
               </div>
               <h3 className="text-white font-bold">{profile?.full_name}</h3>
               <p className="text-[10px] text-indigo-400 font-mono mb-8 uppercase tracking-widest">{profile?.reg_no}</p>
            </div>

            {/* Other fields go here... */}
            <button 
              onClick={onClose}
              className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
            >
              Update Configuration
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  getReelplexiMovies, 
  searchReelplexiMovies, 
  getReelplexiSeries, 
  searchReelplexiSeries 
} from '@/lib/reelplexi';

interface ContentItem {
  id: string;
  title: string;
  thumbnail_url?: string;
  cover_image_url?: string;
}

interface PushNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentTitle?: string;
  contentImage?: string;
  contentType?: 'movie' | 'series';
  contentId?: string;
}


export default function PushNotificationDialog({
  open,
  onOpenChange,
  contentTitle: initialContentTitle,
  contentImage: initialContentImage,
  contentType: initialContentType = 'movie',
  contentId: initialContentId,
}: PushNotificationDialogProps) {
  // Active content selection state
  const [selectedType, setSelectedType] = useState<'movie' | 'series'>(initialContentType);
  const [selectedContentId, setSelectedContentId] = useState<string>(initialContentId || '');
  const [selectedContentTitle, setSelectedContentTitle] = useState<string>(initialContentTitle || '');
  const [selectedContentImage, setSelectedContentImage] = useState<string>(initialContentImage || '');

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'segments'>('all');
  const [segments, setSegments] = useState<string[]>(['Subscribers']);
  const [isLoading, setIsLoading] = useState(false);

  // Content list search for picker
  const [availableItems, setAvailableItems] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingItems, setIsFetchingItems] = useState(false);

  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  // Update when dialog opens with props
  useEffect(() => {
    if (open) {
      if (initialContentTitle) {
        setSelectedType(initialContentType);
        setSelectedContentId(initialContentId || '');
        setSelectedContentTitle(initialContentTitle);
        setSelectedContentImage(initialContentImage || '');
        setTitle(`New ${initialContentType}: ${initialContentTitle}`);
        setMessage(`Check out the new ${initialContentType} "${initialContentTitle}" now available on KatiWatch!`);
      } else {
        // Fetch top items for picker
        fetchCatalogItems(initialContentType, '');
      }
    }
  }, [open, initialContentTitle, initialContentImage, initialContentType, initialContentId]);

  // Fetch catalog items for content selector dropdown from Reelplexi API
  const fetchCatalogItems = async (type: 'movie' | 'series', search: string) => {
    setIsFetchingItems(true);
    try {
      let result;
      if (type === 'movie') {
        result = search.trim() 
          ? await searchReelplexiMovies(search.trim(), 1, 30) 
          : await getReelplexiMovies(1, 30);
      } else {
        result = search.trim() 
          ? await searchReelplexiSeries(search.trim(), 1, 30) 
          : await getReelplexiSeries(1, 30);
      }
      setAvailableItems(result.data || []);
    } catch (err) {
      console.error('Error fetching catalog items from Reelplexi:', err);
    } finally {
      setIsFetchingItems(false);
    }
  };


  // When admin picks a movie/series from dropdown in modal
  const handleSelectItem = (itemId: string) => {
    const item = availableItems.find(i => i.id === itemId);
    if (item) {
      const img = item.cover_image_url || item.thumbnail_url || '';
      setSelectedContentId(item.id);
      setSelectedContentTitle(item.title);
      setSelectedContentImage(img);
      setTitle(`New ${selectedType}: ${item.title}`);
      setMessage(`Check out the new ${selectedType} "${item.title}" now available on KatiWatch!`);
    } else {
      setSelectedContentId('');
      setSelectedContentTitle('');
      setSelectedContentImage('');
    }
  };

  const handleTypeChange = (type: 'movie' | 'series') => {
    setSelectedType(type);
    setSelectedContentId('');
    setSelectedContentTitle('');
    setSelectedContentImage('');
    fetchCatalogItems(type, searchQuery);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: '⚠️ Validation Error',
        message: 'Please fill in both title and message fields'
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        imageUrl: selectedContentImage || undefined,
        data: selectedContentId ? {
          type: selectedType,
          id: selectedContentId,
          title: selectedContentTitle,
        } : {
          type: 'general',
        },
        targetType,
        targetSegments: targetType === 'segments' ? segments : ['Subscribers'],
      };

      const response = await fetch('/panel/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        // Save to database so it appears in website notifications inbox
        const { error: dbError } = await supabase.from('notifications').insert([{
          title: title.trim(),
          message: message.trim(),
          image_url: selectedContentImage || null,
          status: 'sent'
        }]);

        if (dbError) {
          console.error('Failed to save notification to database:', dbError);
        }

        // Extract info from OneSignal response
        const onesignalData = result.data || {};
        const recipients = onesignalData.recipients;
        const notificationId = onesignalData.id || '';
        const onesignalErrors = onesignalData.errors;

        if (onesignalErrors?.length || recipients === 0) {
          setNotification({
            show: true,
            type: 'error',
            title: '⚠️ Notification saved but push delivery warning',
            message: onesignalErrors?.[0] || 'Recipients: 0 — check OneSignal app configuration and user permissions.'
          });
        } else {
          const successMessage = `📱 Delivered to ${recipients ?? 'all'} device(s) | ID: ${notificationId}`;
          setNotification({
            show: true,
            type: 'success',
            title: '🎉 Push notification sent!',
            message: successMessage
          });

          onOpenChange(false);

          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
          }, 5000);

          // Reset form
          setTitle('');
          setMessage('');
          setSelectedContentId('');
          setSelectedContentTitle('');
          setSelectedContentImage('');
          setTargetType('all');
          setSegments(['All']);
        }
      } else {
        setNotification({
          show: true,
          type: 'error',
          title: '❌ Failed to send notification',
          message: result.details || result.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setNotification({
        show: true,
        type: 'error',
        title: '❌ Network Error',
        message: 'Failed to send notification. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 max-w-lg bg-[#1a1c21] border border-gray-800 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-white font-bold uppercase tracking-wider text-xl">
            Send Movie & TV Show Push Notification
          </DialogTitle>
          <DialogDescription className="sr-only">Send push notifications to KatiWatch users</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Content Selector (when not opened directly for a specific item) */}
          {!initialContentTitle && (
            <div className="p-3 bg-black border border-gray-800 rounded-lg space-y-3">
              <label className="block text-xs font-bold text-[#E50914] uppercase tracking-wider">
                Select Movie or TV Show
              </label>

              {/* Type toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange('movie')}
                  className={`flex-1 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${
                    selectedType === 'movie'
                      ? 'bg-[#E50914] text-white shadow-[0_0_10px_rgba(229,9,20,0.3)]'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Movie
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('series')}
                  className={`flex-1 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${
                    selectedType === 'series'
                      ? 'bg-[#E50914] text-white shadow-[0_0_10px_rgba(229,9,20,0.3)]'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  TV Series
                </button>
              </div>

              {/* Dropdown item picker */}
              <div>
                <select
                  value={selectedContentId}
                  onChange={(e) => handleSelectItem(e.target.value)}
                  className="w-full bg-[#141414] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                >
                  <option value="">-- Choose a {selectedType === 'movie' ? 'Movie' : 'TV Show'} --</option>
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
                {isFetchingItems && <p className="text-[10px] text-gray-500 mt-1">Loading catalog...</p>}
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title..."
              className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
              maxLength={100}
            />
            <p className="text-[10px] text-gray-500 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Notification Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message..."
              rows={3}
              className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#E50914] resize-none"
              maxLength={200}
            />
            <p className="text-[10px] text-gray-500 mt-1">{message.length}/200 characters</p>
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Send To
            </label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as 'all' | 'segments')}
              className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
            >
              <option value="all">All Subscribers</option>
              <option value="segments">Specific Segments</option>
            </select>
          </div>

          {/* Segments Selection */}
          {targetType === 'segments' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Target Segments
              </label>
              <div className="space-y-2">
                {['Subscribers', 'Active Users', 'Premium Users', 'New Users'].map((segment) => (
                  <label key={segment} className="flex items-center space-x-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={segments.includes(segment)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSegments([...segments, segment]);
                        } else {
                          setSegments(segments.filter(s => s !== segment));
                        }
                      }}
                      className="accent-[#E50914]"
                    />
                    <span>{segment}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Poster Preview */}
          {selectedContentImage && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Push Notification Preview
              </label>
              <div className="border border-gray-800 rounded-lg p-3 bg-black">
                <div className="flex items-start space-x-3">
                  <Image
                    src={selectedContentImage}
                    alt="Preview"
                    width={48}
                    height={72}
                    className="w-12 h-16 object-cover rounded border border-gray-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{title || 'Notification Title'}</p>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{message || 'Notification message text preview...'}</p>
                    <span className="inline-block mt-1 text-[10px] text-[#E50914] font-bold uppercase">
                      Opens {selectedType}: {selectedContentTitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t border-gray-800">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="w-full sm:w-auto bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white uppercase font-bold"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            className="w-full sm:w-auto bg-[#E50914] hover:bg-[#b80710] text-white uppercase font-bold shadow-[0_0_10px_rgba(229,9,20,0.3)]"
            disabled={isLoading || !title.trim() || !message.trim()}
          >
            {isLoading ? 'Sending...' : 'Send Push Notification'}
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Toast Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`p-4 rounded-lg shadow-2xl border-l-4 ${
            notification.type === 'success' 
              ? 'bg-green-950 border-green-500 text-green-200' 
              : 'bg-red-950 border-red-500 text-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">
                  {notification.title}
                </h4>
                <p className="text-xs whitespace-pre-line leading-relaxed">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className="ml-3 text-gray-400 hover:text-gray-200 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}


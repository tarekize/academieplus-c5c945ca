import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'chat_daily_usage';
const FREE_MESSAGE_LIMIT = 10;
const FREE_IMAGE_LIMIT = 3;

interface DailyUsage {
  date: string;
  messageCount: number;
  imageCount: number;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getUsage(): DailyUsage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: DailyUsage = JSON.parse(stored);
      if (parsed.date === getTodayKey()) return parsed;
    }
  } catch {}
  return { date: getTodayKey(), messageCount: 0, imageCount: 0 };
}

function saveUsage(usage: DailyUsage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function useChatLimits() {
  const [usage, setUsage] = useState<DailyUsage>(getUsage);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasSubscription(false);
        return;
      }

      const { data } = await supabase
        .from('student_subscriptions')
        .select('id, days_used, total_days, is_paused')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && data.days_used < data.total_days && !data.is_paused) {
        setHasSubscription(true);
      } else {
        setHasSubscription(false);
      }
    };

    checkSubscription();
  }, []);

  const messagesRemaining = hasSubscription
    ? Infinity
    : Math.max(0, FREE_MESSAGE_LIMIT - usage.messageCount);

  const imagesRemaining = hasSubscription
    ? Infinity
    : Math.max(0, FREE_IMAGE_LIMIT - usage.imageCount);

  const canSendMessage = hasSubscription || usage.messageCount < FREE_MESSAGE_LIMIT;
  const canSendImage = hasSubscription || usage.imageCount < FREE_IMAGE_LIMIT;

  const recordMessage = useCallback(() => {
    if (hasSubscription) return;
    const current = getUsage();
    current.messageCount += 1;
    saveUsage(current);
    setUsage({ ...current });
  }, [hasSubscription]);

  const recordImage = useCallback((count: number = 1) => {
    if (hasSubscription) return;
    const current = getUsage();
    current.imageCount += count;
    saveUsage(current);
    setUsage({ ...current });
  }, [hasSubscription]);

  return {
    hasSubscription,
    canSendMessage,
    canSendImage,
    messagesRemaining,
    imagesRemaining,
    recordMessage,
    recordImage,
    isLoading: hasSubscription === null,
    FREE_MESSAGE_LIMIT,
    FREE_IMAGE_LIMIT,
  };
}

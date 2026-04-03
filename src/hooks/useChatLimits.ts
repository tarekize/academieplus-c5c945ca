import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const FREE_MESSAGE_LIMIT = 10;
const FREE_IMAGE_LIMIT = 3;

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

interface UsageState {
  messageCount: number;
  imageCount: number;
}

export function useChatLimits() {
  const [usage, setUsage] = useState<UsageState>({ messageCount: 0, imageCount: 0 });
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Check subscription and load usage from Supabase
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasSubscription(false);
        return;
      }

      setUserId(user.id);

      // Check subscription
      const { data: sub } = await supabase
        .from('student_subscriptions')
        .select('id, days_used, total_days, is_paused')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub && sub.days_used < sub.total_days && !sub.is_paused) {
        setHasSubscription(true);
      } else {
        setHasSubscription(false);
      }

      // Load today's usage from Supabase
      const today = getTodayKey();
      const { data: usageData } = await supabase
        .from('chat_usage')
        .select('message_count, image_count')
        .eq('user_id', user.id)
        .eq('usage_date', today)
        .maybeSingle();

      if (usageData) {
        setUsage({
          messageCount: usageData.message_count,
          imageCount: usageData.image_count,
        });
      }
    };

    init();
  }, []);

  const messagesRemaining = hasSubscription
    ? Infinity
    : Math.max(0, FREE_MESSAGE_LIMIT - usage.messageCount);

  const imagesRemaining = hasSubscription
    ? Infinity
    : Math.max(0, FREE_IMAGE_LIMIT - usage.imageCount);

  const canSendMessage = hasSubscription || usage.messageCount < FREE_MESSAGE_LIMIT;
  const canSendImage = hasSubscription || usage.imageCount < FREE_IMAGE_LIMIT;

  const recordMessage = useCallback(async () => {
    if (hasSubscription || !userId) return;
    const today = getTodayKey();
    const newCount = usage.messageCount + 1;

    // Upsert in Supabase
    await supabase
      .from('chat_usage')
      .upsert(
        { user_id: userId, usage_date: today, message_count: newCount, image_count: usage.imageCount },
        { onConflict: 'user_id,usage_date' }
      );

    setUsage(prev => ({ ...prev, messageCount: newCount }));
  }, [hasSubscription, userId, usage]);

  const recordImage = useCallback(async (count: number = 1) => {
    if (hasSubscription || !userId) return;
    const today = getTodayKey();
    const newCount = usage.imageCount + count;

    await supabase
      .from('chat_usage')
      .upsert(
        { user_id: userId, usage_date: today, message_count: usage.messageCount, image_count: newCount },
        { onConflict: 'user_id,usage_date' }
      );

    setUsage(prev => ({ ...prev, imageCount: newCount }));
  }, [hasSubscription, userId, usage]);

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

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const usageRef = useRef<UsageState>({ messageCount: 0, imageCount: 0 });

  // Keep ref in sync
  useEffect(() => {
    usageRef.current = usage;
  }, [usage]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Wait for session to be ready
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session?.user) {
        setHasSubscription(false);
        return;
      }

      const uid = session.user.id;
      setUserId(uid);

      // Check subscription
      const { data: sub } = await supabase
        .from('student_subscriptions')
        .select('id, days_used, total_days, is_paused')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

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
        .eq('user_id', uid)
        .eq('usage_date', today)
        .maybeSingle();

      if (cancelled) return;

      if (usageData) {
        const loaded = {
          messageCount: usageData.message_count,
          imageCount: usageData.image_count,
        };
        setUsage(loaded);
        usageRef.current = loaded;
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUserId(null);
        setHasSubscription(false);
        setUsage({ messageCount: 0, imageCount: 0 });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const messagesRemaining = hasSubscription
    ? Infinity
    : Math.max(0, FREE_MESSAGE_LIMIT - usage.messageCount);

  const imagesRemaining = hasSubscription
    ? Infinity
    : Math.max(0, FREE_IMAGE_LIMIT - usage.imageCount);

  const canSendMessage = hasSubscription || usage.messageCount < FREE_MESSAGE_LIMIT;
  const canSendImage = hasSubscription || usage.imageCount < FREE_IMAGE_LIMIT;

  const upsertUsage = useCallback(async (newMessageCount: number, newImageCount: number) => {
    if (!userId) return;
    const today = getTodayKey();

    // Try update first, then insert if no row exists
    const { data: existing } = await supabase
      .from('chat_usage')
      .select('id')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('chat_usage')
        .update({ message_count: newMessageCount, image_count: newImageCount })
        .eq('user_id', userId)
        .eq('usage_date', today);
    } else {
      await supabase
        .from('chat_usage')
        .insert({ user_id: userId, usage_date: today, message_count: newMessageCount, image_count: newImageCount });
    }
  }, [userId]);

  const recordMessage = useCallback(async () => {
    if (hasSubscription || !userId) return;
    const current = usageRef.current;
    const newCount = current.messageCount + 1;
    const newUsage = { ...current, messageCount: newCount };
    setUsage(newUsage);
    usageRef.current = newUsage;
    await upsertUsage(newCount, current.imageCount);
  }, [hasSubscription, userId, upsertUsage]);

  const recordImage = useCallback(async (count: number = 1) => {
    if (hasSubscription || !userId) return;
    const current = usageRef.current;
    const newCount = current.imageCount + count;
    const newUsage = { ...current, imageCount: newCount };
    setUsage(newUsage);
    usageRef.current = newUsage;
    await upsertUsage(current.messageCount, newCount);
  }, [hasSubscription, userId, upsertUsage]);

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

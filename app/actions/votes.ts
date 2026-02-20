'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitVote(captionId: string, voteValue: number) {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'You must be logged in to vote' };
  }

  // Get the user's profile_id from the profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return { error: 'Could not find user profile' };
  }

  // Upsert the vote so re-voting on the same caption updates the existing row
  const { error } = await supabase
    .from('caption_votes')
    .upsert({
      caption_id: captionId,
      profile_id: profileData.id,
      vote_value: voteValue,
      created_datetime_utc: new Date().toISOString(),
      modified_datetime_utc: new Date().toISOString()
    }, { onConflict: 'profile_id,caption_id' });

  if (error) {
    return { error: error.message };
  }

  // Revalidate the page to show updated data
  revalidatePath('/list');
  
  return { success: true };
}

export async function getUserVote(captionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { vote: null };

  const { data } = await supabase
    .from('caption_votes')
    .select('vote_value')
    .eq('user_id', user.id)
    .eq('caption_id', captionId)
    .maybeSingle();

  return { vote: data?.vote_value ?? null };
}

export async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return { 
    userId: user?.id || null,
    email: user?.email || null 
  };
}

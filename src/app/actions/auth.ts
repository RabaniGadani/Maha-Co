'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ROLES } from '@/lib/constants';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  console.log('[Login Action] - Initiated');
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    console.error('[Login Action] - Error: Email or password not provided.');
    return { error: 'Email and password are required' };
  }

  console.log(`[Login Action] - Attempting to sign in user: ${email}`);
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(`[Login Action] - Supabase sign-in error: ${error.message}`);
    return { error: error.message };
  }

  console.log('[Login Action] - Login successful. Revalidating path.');
  revalidatePath('/', 'layout');
  return { success: true };
}


export async function logout() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get user role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return {
    ...user,
    role: roleData?.role || null,
  };
}

export async function updatePassword(formData: FormData) {
  const supabase = createClient();

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!currentPassword || !newPassword) {
    return { error: 'Both current and new password are required' };
  }

  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters' };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function resetPasswordRequest(formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirect_to=/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

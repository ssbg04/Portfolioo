"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function updateSettings(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const { error } = await supabaseAdmin
    .from('settings')
    .update({
      about_text_1: data.about_text_1,
      about_text_2: data.about_text_2,
      years_coding: data.years_coding,
      projects_count: data.projects_count,
      certifications_count: data.certifications_count,
      tiktok_url: data.tiktok_url,
      facebook_url: data.facebook_url,
      instagram_url: data.instagram_url,
      linkedin_url: data.linkedin_url,
      github_url: data.github_url,
    })
    .eq('id', 1);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

// Projects
export async function upsertProject(formData: FormData) {
  const id = formData.get('id') as string | null;
  const title = formData.get('title') as string;
  const des = formData.get('des') as string;
  const techstack = formData.get('techstack') as string;
  const url = formData.get('url') as string;
  const img_url = formData.get('img_url') as string;

  const payload = { title, des, techstack, url, img_url };

  let result;
  if (id) {
    result = await supabaseAdmin.from('projects').update(payload).eq('id', id);
  } else {
    result = await supabaseAdmin.from('projects').insert([payload]);
  }

  if (result.error) return { success: false, error: result.error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteProject(id: number) {
  const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

// Certifications
export async function upsertCertification(formData: FormData) {
  const id = formData.get('id') as string | null;
  const title = formData.get('title') as string;
  const issuer = formData.get('issuer') as string;
  const date_issued = formData.get('date_issued') as string;
  const icon = formData.get('icon') as string;

  const payload = { title, issuer, date_issued, icon };

  let result;
  if (id) {
    result = await supabaseAdmin.from('certifications').update(payload).eq('id', id);
  } else {
    result = await supabaseAdmin.from('certifications').insert([payload]);
  }

  if (result.error) return { success: false, error: result.error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteCertification(id: number) {
  const { error } = await supabaseAdmin.from('certifications').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

// Articles
export async function upsertArticle(formData: FormData) {
  const id = formData.get('id') as string | null;
  const title = formData.get('title') as string;
  const excerpt = formData.get('excerpt') as string;
  const date_published = formData.get('date_published') as string;
  const tag = formData.get('tag') as string;
  const url = formData.get('url') as string;

  const payload = { title, excerpt, date_published, tag, url };

  let result;
  if (id) {
    result = await supabaseAdmin.from('articles').update(payload).eq('id', id);
  } else {
    result = await supabaseAdmin.from('articles').insert([payload]);
  }

  if (result.error) return { success: false, error: result.error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteArticle(id: number) {
  const { error } = await supabaseAdmin.from('articles').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

// Tech Stack
export async function addTechStack(formData: FormData) {
  const tech_name = formData.get('tech_name') as string;
  const { error } = await supabaseAdmin.from('techstack').insert([{ tech_name }]);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteTechStack(id: number) {
  const { error } = await supabaseAdmin.from('techstack').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function logout() {
  const { cookies } = await import('next/headers');
  (await cookies()).delete('admin_token');
}

export async function changeAdminCredentials(currentUsername: string, formData: FormData) {
  const newUsername = formData.get("new_username") as string;
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!newUsername) {
    return { success: false, error: "New username is required" };
  }

  if (newPassword && newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  try {
    const payload: { username: string; password?: string } = { username: newUsername };

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      payload.password = hashedPassword;
    }

    const { error } = await supabaseAdmin
      .from('admin')
      .update(payload)
      .eq('username', currentUsername);

    if (error) {
      return { success: false, error: error.message };
    }

    const { cookies } = await import('next/headers');
    (await cookies()).delete('admin_token');

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "An error occurred" };
  }
}

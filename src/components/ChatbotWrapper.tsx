import { supabase } from "@/lib/supabase";
import Chatbot from "./Chatbot";

export default async function ChatbotWrapper() {
  let settings = null;
  let projects: any[] = [];
  let certs: any[] = [];
  let articles: any[] = [];

  try {
    const { data: settingsRows } = await supabase.from('settings').select('*').eq('id', 1).single();
    settings = settingsRows || null;

    const { data: projectRows } = await supabase.from('projects').select('title, des, techstack, url');
    projects = projectRows || [];

    const { data: certRows } = await supabase.from('certifications').select('title, issuer, date_issued');
    certs = certRows || [];

    const { data: articleRows } = await supabase.from('articles').select('title, excerpt, date_published, tag, url');
    articles = articleRows || [];
  } catch (error) {
    console.error("Failed to fetch chatbot data:", error);
  }

  const portfolioData = {
    settings,
    projects,
    certs,
    articles
  };

  return <Chatbot portfolioData={portfolioData} />;
}

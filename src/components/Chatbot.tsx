"use client";

import { useState, useRef, useEffect } from "react";

export default function Chatbot({ portfolioData }: { portfolioData: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hi! I'm Cris's AI assistant. Ask me anything about his projects, skills, certifications, or how to contact him! 😊"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const parseMarkdown = (text: string) => {
    let parsed = text;
    // Replace markdown links [text](url)
    parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // Replace markdown bold **text**
    parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Replace newlines with <br>
    parsed = parsed.replace(/\n/g, '<br>');
    return parsed;
  };

  const getBotResponse = (message: string) => {
    const text = message.toLowerCase();
    
    const intents = [
        {
            name: 'greeting',
            keywords: ['hi', 'hello', 'hey', "what's up", 'howdy', 'greetings'],
            response: () => "Hi there! I'm Cris's virtual assistant. I can tell you about his **skills**, **projects**, **certifications**, or how to **contact** him. What would you like to know?"
        },
        {
            name: 'about',
            keywords: ['who are you', 'about', 'introduce', 'background', 'cris charles', 'who is cris'],
            response: () => {
                if (portfolioData.settings) {
                    return `${portfolioData.settings.about_text_1}\n\n${portfolioData.settings.about_text_2}`;
                }
                return "Cris is a senior IT student majoring in Software Development based in Laguna, Philippines. He's passionate about building scalable apps and beautiful UIs.";
            }
        },
        {
            name: 'skills',
            keywords: ['skills', 'technologies', 'stack', 'languages', 'php', 'react', 'javascript', 'css', 'html', 'python', 'java'],
            response: () => {
                if (portfolioData.techStack && portfolioData.techStack.length > 0) {
                    const techNames = portfolioData.techStack.map((t: any) => t.tech_name).join(', ');
                    return `Cris works with a variety of modern technologies. His stack includes: **${techNames}**.`;
                }
                return "Cris works with a variety of modern technologies. His core stack includes **PHP, JavaScript, Python, Java, C++** and frameworks like **React, NextJS, Node.js, and Express**. He's also experienced with **MySQL, MongoDB, Tailwind CSS, and Git**.";
            }
        },
        {
            name: 'projects',
            keywords: ['projects', 'built', 'work', 'portfolio', 'apps', 'websites', 'what have you done'],
            response: () => {
                if (portfolioData.projects && portfolioData.projects.length > 0) {
                    let res = `Cris has built **${portfolioData.projects.length} projects** in his portfolio. Here is the list:\n\n`;
                    portfolioData.projects.forEach((p: any) => {
                        const projectLink = p.url ? `[${p.title}](${p.url})` : `**${p.title}**`;
                        res += `- ${projectLink}: ${p.des} _(Tech: ${p.techstack})_\n`;
                    });
                    return res;
                }
                return "Cris has built several full-stack web applications, including e-commerce platforms, chat apps, and student management systems. You can view them all in the Projects section above!";
            }
        },
        {
            name: 'certifications',
            keywords: ['certifications', 'certificates', 'courses', 'credentials', 'cert'],
            response: () => {
                if (portfolioData.certs && portfolioData.certs.length > 0) {
                    let res = `Cris holds **${portfolioData.certs.length} certifications**:\n\n`;
                    portfolioData.certs.forEach((c: any) => {
                        const dateStr = c.date_issued ? ` (${c.date_issued})` : "";
                        res += `- **${c.title}** issued by _${c.issuer}_${dateStr}\n`;
                    });
                    return res;
                }
                return "Cris has completed multiple certifications from Cisco, freeCodeCamp, and other reputable institutions to continuously improve his software development skills.";
            }
        },
        {
            name: 'blog',
            keywords: ['blog', 'articles', 'writing', 'posts', 'read'],
            response: () => {
                if (portfolioData.articles && portfolioData.articles.length > 0) {
                    let res = `Cris occasionally writes about tech. Here are his latest articles:\n\n`;
                    portfolioData.articles.slice(0, 2).forEach((a: any) => {
                        res += `- **[${a.title}](${a.url})**: ${a.excerpt}\n`;
                    });
                    return res;
                }
                return "Cris shares his thoughts on software development and technology in his Blog section. Feel free to check it out on the site!";
            }
        },
        {
            name: 'experience',
            keywords: ['experience', 'years', 'coding', 'how long'],
            response: () => {
                let years = portfolioData.settings ? portfolioData.settings.years_coding : "several";
                return `Cris has been coding for **${years} years** and has completed multiple projects ranging from front-end designs to complex full-stack applications.`;
            }
        },
        {
            name: 'social',
            keywords: ['github', 'linkedin', 'instagram', 'tiktok', 'social', 'facebook'],
            response: () => {
                if (portfolioData.settings) {
                    return `You can connect with Cris on his social platforms:\n- [GitHub](${portfolioData.settings.github_url})\n- [LinkedIn](${portfolioData.settings.linkedin_url})\n- [Instagram](${portfolioData.settings.instagram_url})\n- [TikTok](${portfolioData.settings.tiktok_url})`;
                }
                return "You can find links to Cris's GitHub, LinkedIn, and other social media profiles at the bottom of this page in the contact section.";
            }
        },
        {
            name: 'contact',
            keywords: ['contact', 'hire', 'email', 'reach', 'work together', 'message'],
            response: () => {
                let res = "You can contact Cris directly using the **Contact Form** at the bottom of the page.\n\n";
                if (portfolioData.settings) {
                    res += "Alternatively, you can reach him through his social networks:\n";
                    if (portfolioData.settings.linkedin_url && portfolioData.settings.linkedin_url !== "#") {
                        res += `- **LinkedIn**: [LinkedIn Profile](${portfolioData.settings.linkedin_url})\n`;
                    }
                    if (portfolioData.settings.github_url && portfolioData.settings.github_url !== "#") {
                        res += `- **GitHub**: [GitHub Profile](${portfolioData.settings.github_url})\n`;
                    }
                    if (portfolioData.settings.facebook_url && portfolioData.settings.facebook_url !== "#") {
                        res += `- **Facebook**: [Facebook Profile](${portfolioData.settings.facebook_url})\n`;
                    }
                    if (portfolioData.settings.instagram_url && portfolioData.settings.instagram_url !== "#") {
                        res += `- **Instagram**: [Instagram Profile](${portfolioData.settings.instagram_url})\n`;
                    }
                }
                return res;
            }
        }
    ];

    let bestMatch = null;
    let maxScore = 0;

    for (const intent of intents) {
        let score = 0;
        for (const keyword of intent.keywords) {
            if (text.includes(keyword)) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                if (regex.test(text)) {
                    score += 2;
                } else {
                    score += 1;
                }
            }
        }
        if (score > maxScore) {
            maxScore = score;
            bestMatch = intent;
        }
    }

    if (bestMatch && maxScore > 0) {
        return bestMatch.response();
    }

    return "I'm not quite sure how to answer that! I mostly know about Cris's **projects, skills, and background**. If you have a specific question for Cris, I recommend using the **Contact Form** at the bottom of the page to send him an email directly.";
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInputValue("");

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage);
      setMessages(prev => [...prev, { role: "bot", content: botResponse }]);
    }, 600);
  };

  return (
    <div id="portfolio-chatbot-widget">
      <button id="chatbot-toggle-btn" aria-label="Open Chat Assistant" onClick={() => setIsOpen(!isOpen)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chat-icon-svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        {!isOpen && <span className="pulse-notification-dot"></span>}
      </button>

      <div id="chatbot-window" className={isOpen ? "active" : "hidden"}>
        <div id="chatbot-header">
          <div className="header-avatar-info">
            <div className="avatar-container">
              <img src="/assets/img/pp-day.webp" alt="Cris Garcia Avatar" className="chat-avatar" />
              <span className="status-indicator online"></span>
            </div>
            <div className="header-text-info">
              <h4>Cris&apos;s AI Guide</h4>
              <span className="status-text">Ask me anything</span>
            </div>
          </div>
          <button id="chatbot-close-btn" aria-label="Close Chat Window" onClick={() => setIsOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div id="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role === "bot" ? "bot-msg" : "user-msg"}`}>
              <div 
                className="msg-bubble" 
                dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} 
              />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form id="chatbot-input-form" onSubmit={handleSend}>
          <input 
            type="text" 
            id="chatbot-input-field" 
            placeholder="Ask a question..." 
            autoComplete="off" 
            required 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" id="chatbot-send-btn" aria-label="Send Message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

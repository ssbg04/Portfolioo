import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWrapper from "@/components/ChatbotWrapper";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Animated Mesh Background */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="site-wrapper">
        <Navbar />
        {children}
        <Footer />
      </div>
      <ChatbotWrapper />
    </>
  );
}

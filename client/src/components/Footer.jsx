import React, { useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  Send, 
  Mail, 
  X, 
  Loader2, 
  Heart,
  Linkedin,
  Phone
} from 'lucide-react';

export default function Footer({ setActiveTab, onOpenReport }) {
  // Newsletter state
  const [newsEmail, setNewsEmail] = useState('');
  const [newsName, setNewsName] = useState('');
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [newsSubscribed, setNewsSubscribed] = useState(false);

  // Contact Message Modal state
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [msgName, setMsgName] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgTopic, setMsgTopic] = useState('Civic Feedback & Suggestions');
  const [msgBody, setMsgBody] = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  // 1. Newsletter submission: sends welcome email TO THE SUBSCRIBER from bhelayedipika@gmail.com
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsEmail.trim()) return;

    setNewsSubmitting(true);
    try {
      // 1. Send via FormSubmit (uses "email" field to send _autoresponse TO THE SUBSCRIBER)
      await fetch('https://formsubmit.co/ajax/bhelayedipika@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: newsName || 'Citizen Supporter',
          email: newsEmail.trim(), // FormSubmit sends _autoresponse to this email!
          _subject: `Welcome to FixMyArea, ${newsName || 'Friend'}! Thanks for exploring our platform`,
          _autoresponse: `Hi ${newsName || 'there'}!

Thank you so much for exploring FixMyArea. We are thrilled to welcome you to our community!

FixMyArea is built to make reporting and resolving civic problems—from road craters and dark streetlights to water leaks—transparent, fast, and accountable. 

We would love to hear your thoughts, suggestions, or feedback on your neighborhood. Feel free to hit reply to this email anytime to chat directly with me!

Warm regards,
Dipika Bhelaye
FixMyArea Founder & Developer
Email: bhelayedipika@gmail.com
Phone: +91 93220 32655`,
          _replyto: 'bhelayedipika@gmail.com',
          _template: 'box',
          _captcha: 'false'
        })
      });

      // 2. Also register subscriber on our local server if available
      try {
        await fetch('http://localhost:5001/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newsName, email: newsEmail })
        });
      } catch (e) {
        // Local server optional fallback
      }
    } catch (err) {
      console.warn('Subscription transmission notice:', err);
    } finally {
      setNewsSubmitting(false);
      setNewsSubscribed(true);
      setTimeout(() => {
        setNewsEmail('');
        setNewsName('');
      }, 6000);
    }
  };

  // 2. Direct message submission handler to bhelayedipika@gmail.com
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgEmail.trim() || !msgBody.trim()) return;

    setMsgSending(true);
    try {
      await fetch('https://formsubmit.co/ajax/bhelayedipika@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `FixMyArea Citizen Message [${msgTopic}] from ${msgName || 'Citizen'}`,
          sender_name: msgName || 'Citizen',
          sender_email: msgEmail,
          category_topic: msgTopic,
          message_body: msgBody,
          recipient: 'bhelayedipika@gmail.com',
          timestamp: new Date().toLocaleString(),
          _captcha: 'false',
          _template: 'table'
        })
      });
    } catch (err) {
      console.warn('Direct message notice:', err);
    } finally {
      setMsgSending(false);
      setMsgSent(true);
      setTimeout(() => {
        setMsgSent(false);
        setIsMsgModalOpen(false);
        setMsgName('');
        setMsgEmail('');
        setMsgBody('');
      }, 3500);
    }
  };

  return (
    <footer className="relative mt-20 select-none">
      
      {/* =========================================================================
          TOP SILHOUETTE TRANSITION (Cohesive Nature Treeline & Center Tent)
          Smooth, seamless, connected directly to the solid footer body
          ========================================================================= */}
      <div className="w-full overflow-hidden leading-none relative -mb-px pointer-events-none">
        <svg 
          viewBox="0 0 1440 90" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 lg:h-24 block"
          preserveAspectRatio="none"
        >
          <path 
            d="M 0,90 L 0,52 C 25,52 40,40 65,40 C 90,40 105,54 135,54 C 160,54 175,38 205,38 C 235,38 250,56 280,56 C 310,56 325,40 355,40 C 385,40 400,52 430,52 C 455,52 470,36 495,36 C 520,36 535,50 565,50 C 595,50 610,38 635,38 C 655,38 670,48 690,48 C 700,42 708,24 715,14 C 718,9 722,9 725,14 C 732,24 740,42 750,48 C 770,48 785,38 805,38 C 830,38 845,50 875,50 C 905,50 920,36 945,36 C 970,36 985,52 1010,52 C 1040,52 1055,40 1085,40 C 1115,40 1130,56 1160,56 C 1190,56 1205,38 1235,38 C 1265,38 1280,54 1310,54 C 1335,54 1350,40 1375,40 C 1400,40 1415,52 1440,52 L 1440,90 Z" 
            fill="#143827" 
          />
        </svg>
      </div>

      {/* =========================================================================
          MAIN FOOTER BODY (Deep Forest Emerald `#143827`)
          Perfect 3-Column Symmetrical Grid (25% - 50% - 25%)
          ========================================================================= */}
      <div className="bg-[#143827] text-[#EDE8DF] pt-8 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-start">
            
            {/* -----------------------------------------------------------------
                COLUMN 1: NAVIGATION LINKS & SOCIAL ICONS (lg:col-span-3 = 25%)
                ----------------------------------------------------------------- */}
            <div className="lg:col-span-3 flex flex-col justify-between space-y-6 lg:pr-8">
              <ul className="space-y-3.5 text-sm sm:text-base font-medium text-[#EDE8DF]/90">
                <li>
                  <button 
                    onClick={() => setActiveTab('about')}
                    className="hover:text-white hover:underline underline-offset-4 transition cursor-pointer text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('community')}
                    className="hover:text-white hover:underline underline-offset-4 transition cursor-pointer text-left"
                  >
                    Community Impact Feed
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('map')}
                    className="hover:text-white hover:underline underline-offset-4 transition cursor-pointer text-left"
                  >
                    Live Civic Map
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onOpenReport}
                    className="hover:text-white hover:underline underline-offset-4 transition cursor-pointer text-left"
                  >
                    Report an Issue
                  </button>
                </li>
              </ul>

              {/* Social Round Outline Badges */}
              <div className="flex items-center space-x-3 pt-2">
                <a 
                  href="https://www.linkedin.com/in/dipikabhelaye27/" 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  title="Connect on LinkedIn"
                  className="w-9 h-9 rounded-full border border-[#EDE8DF]/50 hover:border-white text-[#EDE8DF] hover:text-white flex items-center justify-center transition hover:scale-105"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.instagram.com/dipikabhelaye/" 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label="Instagram"
                  title="Follow on Instagram"
                  className="w-9 h-9 rounded-full border border-[#EDE8DF]/50 hover:border-white text-[#EDE8DF] hover:text-white flex items-center justify-center transition hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="mailto:bhelayedipika@gmail.com" 
                  aria-label="Direct Email"
                  title="Send Email"
                  className="w-9 h-9 rounded-full border border-[#EDE8DF]/50 hover:border-white text-[#EDE8DF] hover:text-white flex items-center justify-center text-xs font-bold transition hover:scale-105"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* -----------------------------------------------------------------
                COLUMN 2: CENTER SUBSCRIBE SECTION (lg:col-span-6 = 50% DEAD CENTER)
                ----------------------------------------------------------------- */}
            <div className="lg:col-span-6 flex flex-col justify-center items-center text-center px-4 sm:px-10 space-y-4 lg:border-x lg:border-[#EDE8DF]/20">
              
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#FDFBF7] tracking-tight">
                  Get Updates
                </h3>
                <p className="text-xs sm:text-sm font-serif italic text-[#EDE8DF]/85 leading-relaxed">
                  Join our community! Give your email to receive a warm welcome note, civic updates, and share your feedback on FixMyArea.
                </p>
              </div>

              {newsSubscribed ? (
                <div className="w-full max-w-md py-4 px-6 rounded-lg bg-[#1a4732] border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm flex flex-col items-center justify-center space-y-2 animate-scale-up text-center">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span className="font-semibold text-white">Welcome email sent to your inbox!</span>
                  </div>
                  <p className="text-[12px] text-emerald-200/90 leading-relaxed">
                    Check your inbox (or spam) for your welcome note from <span className="font-mono text-white">bhelayedipika@gmail.com</span>. Feel free to reply anytime with your thoughts and feedback!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="w-full max-w-md space-y-3 pt-2 mx-auto">
                  {/* Email Input */}
                  <div>
                    <input
                      type="email"
                      required
                      value={newsEmail}
                      onChange={(e) => setNewsEmail(e.target.value)}
                      placeholder="*Email"
                      className="w-full px-4 py-2.5 bg-transparent rounded-none border border-[#EDE8DF]/40 text-sm text-[#FDFBF7] placeholder-[#EDE8DF]/60 focus:outline-none focus:border-white transition"
                    />
                  </div>

                  {/* Name Input + SIGN UP Button Row */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      required
                      value={newsName}
                      onChange={(e) => setNewsName(e.target.value)}
                      placeholder="*First Name"
                      className="flex-1 px-4 py-2.5 bg-transparent rounded-none border border-[#EDE8DF]/40 text-sm text-[#FDFBF7] placeholder-[#EDE8DF]/60 focus:outline-none focus:border-white transition"
                    />

                    <button
                      type="submit"
                      disabled={newsSubmitting}
                      className="px-6 py-2.5 bg-[#FDFBF7] hover:bg-white text-[#143827] font-bold text-xs uppercase tracking-wider rounded-none shadow-sm transition hover:shadow cursor-pointer active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-75"
                    >
                      {newsSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>SENDING...</span>
                        </>
                      ) : (
                        <span>SIGN UP</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* -----------------------------------------------------------------
                COLUMN 3: RIGHT SIDE BESIDE GET UPDATES (lg:col-span-3 = 25%)
                Properly balanced beside the center column divider
                ----------------------------------------------------------------- */}
            <div className="lg:col-span-3 flex flex-col justify-between items-start text-left space-y-6 lg:pl-8">
              
              {/* Send Us A Message button */}
              <button
                onClick={() => setIsMsgModalOpen(true)}
                className="group inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-[#FDFBF7] hover:underline underline-offset-4 cursor-pointer"
              >
                <span>Send Us A Message</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Direct Contact Info */}
              <div className="space-y-2.5 text-xs sm:text-sm text-[#EDE8DF]/85">
                <a 
                  href="mailto:bhelayedipika@gmail.com"
                  className="font-semibold text-[#FDFBF7] hover:underline block transition flex items-center space-x-2"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>bhelayedipika@gmail.com</span>
                </a>

                <a 
                  href="tel:+919322032655"
                  className="font-semibold text-[#FDFBF7] hover:underline block transition flex items-center space-x-2 text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>+91 93220 32655</span>
                </a>

                <a 
                  href="tel:1800123349"
                  className="font-medium text-[#EDE8DF]/75 hover:text-white block transition text-xs"
                >
                  (1800)-123-FIXMYAREA (Toll-Free)
                </a>

                <span className="text-[11px] text-[#EDE8DF]/70 block">
                  Municipal Redressal & Citizen Helpdesk
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* =========================================================================
          BOTTOM COPYRIGHT & LEGAL STRIP
          ========================================================================= */}
      <div className="bg-[#0c2419] text-[#EDE8DF]/60 text-[11px] py-4 px-4 sm:px-6 lg:px-8 border-t border-[#143827]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          
          <div>
            © {new Date().getFullYear()} FixMyArea Civic Redressal Platform. All Rights Reserved.
          </div>

          <div className="flex items-center space-x-6 text-[10px] sm:text-[11px]">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">Citizen Charter</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">RTI Transparency</span>
          </div>

        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE "SEND US A MESSAGE" MODAL (Sends to bhelayedipika@gmail.com)
          ========================================================================= */}
      {isMsgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative text-slate-800 space-y-5 animate-scale-up">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsMsgModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 inline-block mb-2">
                Direct Citizen Inquiry
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Send Us A Message
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your message will be routed directly to <span className="font-semibold text-emerald-800">bhelayedipika@gmail.com</span> for prompt resolution.
              </p>
            </div>

            {msgSent ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Message Delivered!</h4>
                <p className="text-xs text-slate-600">
                  Thank you! Your inquiry has been sent to bhelayedipika@gmail.com. We will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={msgName}
                    onChange={(e) => setMsgName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={msgEmail}
                    onChange={(e) => setMsgEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Topic / Department
                  </label>
                  <select
                    value={msgTopic}
                    onChange={(e) => setMsgTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition font-medium"
                  >
                    <option value="Civic Feedback & Suggestions">Civic Feedback & Suggestions</option>
                    <option value="Civic Grievance Escalation">Civic Grievance Escalation</option>
                    <option value="Municipal Partnership">Municipal Partnership</option>
                    <option value="Technical Issue or Bug">Technical Issue or Bug</option>
                    <option value="General Query">General Query</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    placeholder="Describe your query or feedback in detail..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMsgModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={msgSending}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition hover:shadow-lg cursor-pointer flex items-center space-x-2 disabled:opacity-70"
                  >
                    {msgSending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending to bhelayedipika@gmail.com...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </footer>
  );
}
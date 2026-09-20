import React, { useState } from "react";
import { Copy, Check, Facebook, Twitter, MessageCircle } from "lucide-react";

// Shared by the marketer and business referral dashboards — a row of
// share actions for a referral link. WhatsApp + copy + Twitter/X +
// Facebook, per the decided scope.
function ShareButtons({ link, message }) {
  const [copied, setCopied] = useState(false);

  const shareText = message || "Check this out:";

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;

  const buttons = [
    {
      label: "WhatsApp",
      href: whatsappUrl,
      icon: MessageCircle,
      className: "bg-[#25D366] hover:bg-[#1fb855] text-white",
    },
    {
      label: "Twitter",
      href: twitterUrl,
      icon: Twitter,
      className: "bg-black hover:bg-gray-800 text-white",
    },
    {
      label: "Facebook",
      href: facebookUrl,
      icon: Facebook,
      className: "bg-[#1877F2] hover:bg-[#1461cc] text-white",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {buttons.map((b) => (
        <a
          key={b.label}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${b.className}`}
        >
          <b.icon size={14} />
          {b.label}
        </a>
      ))}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

export default ShareButtons;
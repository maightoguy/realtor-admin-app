import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  X,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const HelpCenterPopup = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(
    "upload-receipt"
  );

  const faqItems: FAQItem[] = [
    {
      id: "veriplot-q",
      question: "What is VeriPlot?",
      answer:
        "VeriPlot is a real estate marketing platform that connects realtors with verified property listings, transparent commission tracking, and a digital referral system.",
    },
    {
      id: "veriplot-use",
      question: "Who can use VeriPlot?",
      answer:
        "VeriPlot is built for realtors, consultants, property marketers, developers, and affiliate partners who want to sell verified properties and earn commissions transparently.",
    },
    {
      id: "veriplot-reg",
      question: "Is registration free?",
      answer:
        "Yes. Registration on VeriPlot is completely free for realtors and marketers.",
    },
    {
      id: "verified-properties",
      question: "Are all properties on VeriPlot verified?",
      answer:
        "Yes. Every property listed on VeriPlot goes through a verification process before it is approved and made available for marketing.",
    },
    {
      id: "veriplot-selling",
      question: "How do I start selling on VeriPlot?",
      answer:
        "Create an account, complete your KYC verification, choose a property from the listings, market it to clients, and upload receipts after successful payments.",
    },
    {
      id: "veriplot-KYC",
      question: "Why do I need to complete KYC?",
      answer:
        "KYC helps protect buyers, developers, and realtors by ensuring that all transactions and commission payouts are secure and legitimate.",
    },
    {
      id: "veriplot-kyc-docs",
      question: "What documents are required for KYC?",
      answer:
        "You’ll need a valid government-issued ID, a passport photograph, phone number verification, and your bank account details.",
    },
    {
      id: "veriplot-kyc-duration",
      question: "How long does KYC verification take?",
      answer:
        "KYC verification usually takes 24 hours, depending on the clarity of submitted documents.",
    },
    {
      id: "veriplot-receipts",
      question: "How do I upload a client receipt?",
      answer:
        "Go to the Receipts tab, select the relevant property, upload the receipt, and submit it for verification.",
    },
    {
      id: "veriplot-receipt-duration",
      question: "How long does receipt verification take?",
      answer:
        "Receipt verification typically takes 1 to 2 working days, depending on developer confirmation.",
    },
    {
      id: "veriplot-commission-duration",
      question: "When will I receive my commission?",
      answer:
        "You’ll receive your commission after the receipt has been verified and confirmed by the developer.",
    },
    {
      id: "veriplot-commission-delay",
      question: "Can my commission be delayed?",
      answer:
        "Yes. Delays may occur due to incomplete documentation, verification issues, or pending developer confirmation. All updates are visible on your dashboard.",
    },
    {
      id: "veriplot-referral",
      question: "How does the referral system work?",
      answer:
        "Each user gets a unique referral link. When a realtor you refer makes a sale, you earn a percentage of their commission.",
    },
    {
      id: "veriplot-referral-earn",
      question: "Is there a limit to referral earnings?",
      answer: "No. There is no limit to how much you can earn from referrals.",
    },
    {
      id: "veriplot-referral-sale",
      question: "Can I track my sales and referrals?",
      answer:
        "Yes. Your dashboard shows all sales, receipts, transactions, and referral earnings in real time.",
    },
    {
      id: "veriplot-learn",
      question: "What is the Learn tab for?",
      answer:
        "The Learn tab provides sales tips, guides, and resources to help realtors sell better and grow their earnings on VeriPlot.",
    },
    {
      id: "veriplot-learn-pay",
      question: "Do I have to pay for learning materials?",
      answer:
        "No. All learning resources on VeriPlot are free for registered users.",
    },
    {
      id: "veriplot-support",
      question: "How do I contact customer support?",
      answer:
        "You can contact customer support directly through the app or via official VeriPlot support channels.",
    },
    {
      id: "veriplot-security",
      question: "Is my data secure?",
      answer:
        "Yes. VeriPlot uses secure systems and strict access controls to protect user data and transactions.",
    },
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: "Email",
      description: "Stay updated and get in touch directly.",
      action: "info@veriplot.com",
      color: "text-black",
    },
    {
      icon: MessageCircle,
      title: "Chat",
      description: "Message us anytime for quick help.",
      action: "+2347075103141",
      color: "text-green-600",
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Speak to our team for support.",
      action: "+2347075103141",
      color: "text-black",
    },
  ];

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0">
      {/* Mobile Full Screen Modal / Desktop Popup Modal */}
      <div className="w-full h-full sm:w-auto sm:h-auto sm:max-w-4xl sm:max-h-[90vh] bg-white flex flex-col sm:rounded-lg sm:shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-2.5 sm:p-5 bg-white shadow-sm border-b border-gray-100 sm:rounded-t-lg">
          <div className="flex items-center gap-3">
            {/* Mobile: Back arrow, Desktop: No back arrow */}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors sm:hidden"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h1 className="text-xs sm:text-base font-medium text-gray-500">
              Help center
            </h1>
          </div>
          {/* Desktop: Close button (X) */}
          <button
            onClick={onClose}
            className="hidden sm:block p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {/* Mobile: Stacked layout, Desktop: Two columns */}
          <div className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-8 sm:space-y-0">
            {/* Contact Section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-black mb-2">
                  Still have a question?
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Contact us if you have any other questions.
                </p>
              </div>

              {/* Contact Options */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 sm:flex-col sm:gap-4 min-w-max sm:min-w-0">
                  {contactOptions.map((option, index) => (
                    <div
                      key={index}
                      className="space-y-2 min-w-[100px] sm:min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                        <span className="text-xs sm:text-sm font-medium text-black">
                          {option.title}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
                        {option.description}
                      </p>
                      <button className="text-[10px] sm:text-xs font-medium text-black hover:underline">
                        {option.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              <h2 className="text-xs sm:text-sm font-bold text-black">
                Frequently asked Question
              </h2>

              <div className="space-y-3">
                {faqItems.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full flex items-center justify-between p-3 sm:p-6 text-left hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-xs sm:text-base font-medium text-black flex-1 pr-4">
                        {faq.question}
                      </span>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="w-4 h-4 sm:w-6 sm:h-6 text-black flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-6 sm:h-6 text-black flex-shrink-0" />
                      )}
                    </button>

                    {expandedFAQ === faq.id && (
                      <div className="px-3 pb-3 sm:px-6 sm:pb-6">
                        <p className="text-[10px] sm:text-sm text-gray-500 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPopup;

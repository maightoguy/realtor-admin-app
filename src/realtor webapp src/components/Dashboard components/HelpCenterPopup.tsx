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
      id: "upload-receipt",
      question: "How can i upload receipt?",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Arcu integer urna phasellus id tempus leo sodales. A arcu tellus imperdiet aliquet ut viverra non orci. Tempus id magna vulputate senectus arcu mauris feugiat. Lacus volutpat tristique bibendum massa hendrerit. Pulvinar ullamcorper a venenatis proin feugiat amet. Leo pulvinar egestas.",
    },
    {
      id: "bank-account",
      question: "Can i add more than 1 bank account?",
      answer:
        "Yes, you can add multiple bank accounts to your Veriplot account. This allows you to receive payments to different accounts and provides flexibility in managing your finances.",
    },
    {
      id: "sale-commission",
      question: "How much do i make on a sale?",
      answer:
        "Your commission varies based on the property type and value. Generally, you earn between 2-5% commission on successful property sales. The exact percentage depends on your agent tier and the property category.",
    },
    {
      id: "referral-commission",
      question: "Do i earn commission on referrals?",
      answer:
        "Yes, you earn commission on successful referrals. When someone you refer makes a purchase or sale through Veriplot, you receive a referral commission based on the transaction value.",
    },
    {
      id: "withdrawal-speed",
      question: "How fast do i get paid when i make withdrawals?",
      answer:
        "Withdrawals are typically processed within 1-3 business days. For verified accounts, some withdrawals may be processed within 24 hours. Processing times may vary based on your bank and the withdrawal amount.",
    },
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: "Email",
      description: "Stay updated and get in touch directly.",
      action: "Veriplot@Mail.com",
      color: "text-black",
    },
    {
      icon: MessageCircle,
      title: "Chat",
      description: "Message us anytime for quick help.",
      action: "Chat on whatsapp",
      color: "text-green-600",
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Speak to our team for support.",
      action: "+234 123 4567 890",
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
        <div className="flex items-center justify-between p-5 bg-white shadow-sm border-b border-gray-100 sm:rounded-t-lg">
          <div className="flex items-center gap-3">
            {/* Mobile: Back arrow, Desktop: No back arrow */}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors sm:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-base font-medium text-gray-500">Help center</h1>
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
        <div className="flex-1 overflow-y-auto p-6">
          {/* Mobile: Stacked layout, Desktop: Two columns */}
          <div className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-8 sm:space-y-0">
            {/* Contact Section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-black mb-2">
                  Still have a question?
                </h2>
                <p className="text-sm text-gray-500">
                  Contact us if you have any other questions.
                </p>
              </div>

              {/* Contact Options */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 sm:flex-col sm:gap-4 min-w-max sm:min-w-0">
                  {contactOptions.map((option, index) => (
                    <div
                      key={index}
                      className="space-y-2 min-w-[140px] sm:min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <option.icon className="w-5 h-5 text-black" />
                        <span className="text-sm font-medium text-black">
                          {option.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {option.description}
                      </p>
                      <button className="text-xs font-medium text-black hover:underline">
                        {option.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-black">
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
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-base font-medium text-black flex-1 pr-4">
                        {faq.question}
                      </span>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="w-6 h-6 text-black flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-black flex-shrink-0" />
                      )}
                    </button>

                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-6">
                        <p className="text-sm text-gray-500 leading-relaxed">
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

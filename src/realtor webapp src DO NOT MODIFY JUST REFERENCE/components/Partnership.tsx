import {
  ArrowRight,
  Building2,
  Handshake,
  ShieldCheck,
  Users,
  Briefcase,
  TrendingUp,
} from "lucide-react";

const Partnership = () => {
  // Placeholder partners data
  const partners = [
    {
      name: "Apex Developments",
      type: "Real Estate Developer",
      icon: <Building2 size={24} />,
    },
    {
      name: "Urban Living",
      type: "Property Management",
      icon: <Users size={24} />,
    },
    {
      name: "Global Estates",
      type: "Investment Firm",
      icon: <TrendingUp size={24} />,
    },
    {
      name: "Prime Construct",
      type: "Construction",
      icon: <Briefcase size={24} />,
    },
    {
      name: "Horizon Homes",
      type: "Developer",
      icon: <Building2 size={24} />,
    },
    {
      name: "Metro Realty",
      type: "Agency",
      icon: <Handshake size={24} />,
    },
  ];

  return (
    <section
      id="partnership"
      className="bg-white px-6 py-16 md:px-28 md:py-24 max-w-[1440px] mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 mb-16 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
          Our Partners
        </h2>
        <p className="text-gray-500 text-sm md:text-lg leading-relaxed">
          VeriPlot collaborates with industry-leading developers and
          professionals who share our commitment to transparency and quality.
          Together, we're building a more secure real estate ecosystem.
        </p>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-20">
        {partners.map((partner, index) => (
          <div
            key={index}
            className="group flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300 cursor-default"
          >
            {/* Placeholder Logo */}
            <div className="w-12 h-12 mb-3 bg-purple-50 rounded-lg flex items-center justify-center text-[#5E17EB] group-hover:scale-110 transition-transform duration-300">
              {partner.icon}
            </div>
            <span className="text-sm font-semibold text-gray-800 text-center leading-tight">
              {partner.name}
            </span>
            <span className="text-[10px] md:text-xs text-gray-500 text-center mt-1">
              {partner.type}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Section - "Why Partner With Us?" + CTA */}
      <div className="bg-[#FBF8FD] rounded-3xl p-8 md:p-12 border border-purple-50 overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
          {/* Text Content */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Become a VeriPlot Partner
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-2xl">
                List your properties on VeriPlot and get them marketed by a
                network of verified realtors. We help developers increase
                visibility, close deals faster, and track sales transparently.
              </p>
              <h3 className="text-gray-650 font-bold leading-relaxed max-w-2xl">
                Why partner with us:
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-[#5E17EB]">
                  <Users size={20} />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  Wider Reach
                </h4>
                <p className="text-xs text-gray-500">
                  Access verified realtors ready to sell
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-[#5E17EB]">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  Transparent Sales
                </h4>
                <p className="text-xs text-gray-500">
                  Track every deal in real-time
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-[#5E17EB]">
                  <Handshake size={20} />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  Faster Deals
                </h4>
                <p className="text-xs text-gray-500">
                  Efficient property sales process
                </p>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSepzm7741yyDMIcYl0hPNsb4DRYYrhTnjoXxTEnOCmW87WKAg/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#5E17EB] hover:bg-[#4a11b8] text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300 transform hover:-translate-y-0.5 text-sm md:text-base text-nowrap"
              >
                Apply to list your properties here
                <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partnership;

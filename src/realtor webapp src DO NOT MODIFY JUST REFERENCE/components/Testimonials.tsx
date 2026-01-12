import { useEffect, useRef, useState } from "react";
import Profile1 from "../assets/Profile 1.jpg";
import Profile2 from "../assets/Profile 2.jpg";
import Profile3 from "../assets/Profile 3.jpg";
import Profile4 from "../assets/Profile 4.jpg";
import Profile5 from "../assets/Profile 5.jpg";

const testimonials = [
  {
    text: "Honestly, I didn’t expect the process to be this simple. Every property I’ve sold through VeriPlot has been verified and legit. Their team is professional and reliable.",
    name: "Blessing Okon",
    avatar: Profile1,
  },
  {
    text: "I love how transparent everything is. You can see your sales, receipts, and commission updates clearly. Customer service is always friendly and ready to help.",
    name: "Ibrahim Musa",
    avatar: Profile2,
  },
  {
    text: "The app is user-friendly and fast. I like that you can upload receipts easily and get verified quickly. This is the future of real estate marketing in Nigeria!",
    name: "Hauwa Bello",
    avatar: Profile3,
  },
  {
    text: "As a realtor, VeriPlot has made my work easier. The platform connects me to verified developers, and the commissions come on time. I highly recommend it.",
    name: "Tunde Adebayo",
    avatar: Profile4,
  },
  {
    text: "No long process, no stories. I sold my first plot within two weeks of joining and got paid in full. The customer service was on point!",
    name: "Emeka Opara",
    avatar: Profile5,
  },
];

const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const interval = setInterval(() => {
      if (isPaused) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const maxScrollLeft = scrollWidth - clientWidth;

      // Check if we're at the end (or very close)
      if (Math.ceil(scrollLeft) >= maxScrollLeft - 10) {
        scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Scroll by roughly one card width (300px) + gap (24px)
        scrollContainer.scrollBy({ left: 324, behavior: "smooth" });
      }
    }, 3000); // 3 seconds per slide

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="bg-[#F0E6F7] px-6 py-16 flex flex-col gap-12 md:px-20 lg:px-32">
      {/* Heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-black">
          Our customer reviews
        </h2>
        <p className="text-sm md:text-base text-gray-600 max-w-xl">
          See what realtors, agents and buyers are saying about their experience
          with VeriPlot.
        </p>
      </div>

      {/* Cards: always horizontal scroll */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="
          flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4
          scrollbar-hide
        "
      >
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="
              bg-white rounded-2xl p-6 flex flex-col justify-between
              min-w-[300px] max-w-[320px] snap-start
              flex-shrink-0 gap-17
            "
          >
            <p className="text-gray-600 text-base leading-6">{t.text}</p>
            <div className="flex items-center gap-3 mt-6">
              <img
                src={t.avatar}
                alt={`${t.name} profile picture`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-black font-medium text-base">{t.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default Testimonials;

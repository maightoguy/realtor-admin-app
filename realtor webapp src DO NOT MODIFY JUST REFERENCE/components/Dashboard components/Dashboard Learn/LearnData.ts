// Mock data for learn articles
import img1 from "/src/assets/Learn images/1.jpg";
import img2 from "/src/assets/Learn images/2.jpg";
import img3 from "/src/assets/Learn images/3.jpg";
import img4 from "/src/assets/Learn images/4.jpg";
import img5 from "/src/assets/Learn images/5.jpg";
import img6 from "/src/assets/Learn images/6.jpg";

const images = [img1, img2, img3, img4, img5, img6];

export const mockLearnArticles = [
    {
        id: "1",
        title: "Real estate and its environs: A Comprehensive Guide",
        description:
          "How do you create compelling presentations that wow your colleagues and impress your managers? A look into effective pitch decks.",
        date: "Sep 14, 2025",
        image: images[0], // 1.jpg
        readTime: "5 min read",
      },
      {
        id: "2",
        title: "How to earn very, very big with us: Top Investment Strategies",
        description:
          "Linear helps streamline software projects, sprints, tasks, and bug tracking. Here's how to get started on your investment journey.",
        date: "Sep 14, 2025",
        image: images[1], // 2.jpg
        readTime: "8 min read",
      },
      {
        id: "3",
        title: "Maximizing Returns: Advanced Techniques for High Earners",
        description:
          "The rise of RESTful APIs has been met by a rise in tools for creating, testing, and managing them. Apply this logic to your earnings strategy.",
        date: "Sep 14, 2025",
        image: images[2], // 3.jpg
        readTime: "6 min read",
      },
      {
        id: "4",
        title: "The Perfect Pitch: Secrets to Converting Buyers",
        description:
          "Like to know the secrets of transforming a 2-14 team into a 3x Super Bowl winning Dynasty? It's all in the presentation and follow-up.",
        date: "Sep 14, 2025",
        image: images[3], // 4.jpg
        readTime: "10 min read",
      },
      {
        id: "5",
        title: "Understanding Buyer Psychology and Sales Triggers",
        description:
          "Mental models are simple expressions of complex processes or relationships. Use them to understand and motivate your prospective buyers.",
        date: "Sep 14, 2025",
        image: images[4], // 5.jpg
        readTime: "7 min read",
      },
      {
        id: "6",
        title: "Mastering Client Communication: The Art of Follow-Up",
        description:
          "Introduction to Wireframing and its Principles. Learn from the best in the industry on how to maintain client relationships effectively.",
        date: "Sep 14, 2025",
        image: images[5], // 6.jpg
        readTime: "12 min read",
      },
      // --- Added 44 New Articles (IDs 7-50) - Images cycle through 1-6 ---
      {
        id: "7",
        title: "Financing Your First Home: A Step-by-Step Guide",
        description:
          "Everything you need to know about mortgages, down payments, and securing the best interest rates for your first property.",
        date: "Oct 1, 2025",
        image: images[0], // 1.jpg
        readTime: "9 min read",
      },
      {
        id: "8",
        title: "Navigating the Legalities of Property Transfer",
        description:
          "An overview of conveyancing, title deeds, and the crucial legal documents involved in buying and selling real estate.",
        date: "Oct 5, 2025",
        image: images[1], // 2.jpg
        readTime: "11 min read",
      },
      {
        id: "9",
        title: "The Future of Smart Homes: Technology Integration",
        description:
          "Explore the latest trends in home automation and how smart devices are increasing property value and modern convenience.",
        date: "Oct 10, 2025",
        image: images[2], // 3.jpg
        readTime: "6 min read",
      },
      {
        id: "10",
        title: "Sustainable Living: Eco-Friendly Real Estate",
        description:
          "A deep dive into green building practices, energy efficiency, and properties designed for minimal environmental impact.",
        date: "Oct 15, 2025",
        image: images[3], // 4.jpg
        readTime: "14 min read",
      },
      {
        id: "11",
        title: "Understanding Property Appraisals and Valuation",
        description:
          "Learn how property values are determined and what factors significantly influence a home's market price.",
        date: "Oct 20, 2025",
        image: images[4], // 5.jpg
        readTime: "8 min read",
      },
      {
        id: "12",
        title: "The Art of Negotiation in Property Deals",
        description:
          "Tips and tactics for both buyers and sellers to successfully negotiate the best price and terms on a property.",
        date: "Oct 25, 2025",
        image: images[5], // 6.jpg
        readTime: "7 min read",
      },
      {
        id: "13",
        title: "Renting vs. Buying: Which Financial Path is Right for You?",
        description:
          "A financial analysis comparing the long-term costs and benefits of renting a property versus owning one.",
        date: "Nov 1, 2025",
        image: images[0], // 1.jpg
        readTime: "10 min read",
      },
      {
        id: "14",
        title: "Decoding Zoning Laws and Urban Planning",
        description:
          "An essential guide to understanding local zoning regulations and how they impact property use and development.",
        date: "Nov 5, 2025",
        image: images[1], // 2.jpg
        readTime: "6 min read",
      },
      {
        id: "15",
        title: "The Importance of Home Inspections",
        description:
          "What to look for in a professional home inspection and how to use the report to your advantage during negotiations.",
        date: "Nov 10, 2025",
        image: images[2], // 3.jpg
        readTime: "5 min read",
      },
      {
        id: "16",
        title: "Property Investment in Emerging Markets",
        description:
          "Identifying high-growth potential areas and the risks and rewards of investing in new and developing regions.",
        date: "Nov 15, 2025",
        image: images[3], // 4.jpg
        readTime: "13 min read",
      },
      {
        id: "17",
        title: "Designing for Resale: Home Improvements That Pay Off",
        description:
          "Which renovations offer the highest return on investment when it comes time to sell your property.",
        date: "Nov 20, 2025",
        image: images[4], // 5.jpg
        readTime: "8 min read",
      },
      {
        id: "18",
        title: "Cryptocurrency and Real Estate Transactions",
        description:
          "Exploring the increasing use of digital currency for property purchases and the blockchain's role in the industry.",
        date: "Nov 25, 2025",
        image: images[5], // 6.jpg
        readTime: "10 min read",
      },
      {
        id: "19",
        title: "How to Stage Your Home for a Quick Sale",
        description:
          "Proven techniques for presenting your property in the best light to attract top offers fast.",
        date: "Dec 1, 2025",
        image: images[0], // 1.jpg
        readTime: "6 min read",
      },
      {
        id: "20",
        title: "The Psychology of Price: Setting the Right Listing Price",
        description:
          "Strategies for pricing your property competitively to maximize interest without leaving money on the table.",
        date: "Dec 5, 2025",
        image: images[1], // 2.jpg
        readTime: "9 min read",
      },
      {
        id: "21",
        title: "Landlord 101: Managing Rental Properties Effectively",
        description:
          "Tips on tenant screening, lease agreements, and maintenance for new and experienced landlords.",
        date: "Dec 10, 2025",
        image: images[2], // 3.jpg
        readTime: "15 min read",
      },
      {
        id: "22",
        title: "Accessory Dwelling Units (ADUs): Investment Opportunities",
        description:
          "Learn how adding a secondary unit can generate rental income and significantly increase property value.",
        date: "Dec 15, 2025",
        image: images[3], // 4.jpg
        readTime: "7 min read",
      },
      {
        id: "23",
        title: "The Basics of Property Tax Appeals",
        description:
          "Understanding your property assessment and steps you can take to appeal if you believe your taxes are too high.",
        date: "Dec 20, 2025",
        image: images[4], // 5.jpg
        readTime: "5 min read",
      },
      {
        id: "24",
        title: "Virtual Reality in Property Showings",
        description:
          "How VR and 3D tours are changing the way buyers view properties, especially in long-distance transactions.",
        date: "Dec 25, 2025",
        image: images[5], // 6.jpg
        readTime: "8 min read",
      },
      {
        id: "25",
        title: "Protecting Your Investment: Essential Insurance Coverage",
        description:
          "A breakdown of different types of property insurance, including homeowner's, flood, and landlord policies.",
        date: "Jan 1, 2026",
        image: images[0], // 1.jpg
        readTime: "11 min read",
      },
      {
        id: "26",
        title: "The Complete Guide to Commercial Real Estate",
        description:
          "Differentiate between residential and commercial property investments, and the unique challenges of the latter.",
        date: "Jan 5, 2026",
        image: images[1], // 2.jpg
        readTime: "16 min read",
      },
      {
        id: "27",
        title: "Forecasting the Housing Market: Key Economic Indicators",
        description:
          "Learn to read economic signals like interest rates and employment data to predict market trends.",
        date: "Jan 10, 2026",
        image: images[2], // 3.jpg
        readTime: "9 min read",
      },
      {
        id: "28",
        title: "Mastering Open Houses: From Prep to Close",
        description:
          "Effective strategies for hosting a successful open house that generates genuine leads and excitement.",
        date: "Jan 15, 2026",
        image: images[3], // 4.jpg
        readTime: "7 min read",
      },
      {
        id: "29",
        title: "Understanding Deeds and Title Searches",
        description:
          "A breakdown of warranty deeds, quitclaim deeds, and the process of ensuring a clear property title.",
        date: "Jan 20, 2026",
        image: images[4], // 5.jpg
        readTime: "5 min read",
      },
      {
        id: "30",
        title: "Interior Design Trends for Maximum Appeal",
        description:
          "Current design aesthetics that appeal to a broad range of buyers, focusing on timeless value.",
        date: "Jan 25, 2026",
        image: images[5], // 6.jpg
        readTime: "12 min read",
      },
      {
        id: "31",
        title: "Investment Portfolios: Diversifying with Real Estate",
        description:
          "How to integrate property assets into a larger financial portfolio for balanced risk and return.",
        date: "Feb 1, 2026",
        image: images[0], // 1.jpg
        readTime: "10 min read",
      },
      {
        id: "32",
        title: "Mortgage Refinancing: When and Why to Consider It",
        description:
          "Evaluate the financial benefits and risks of refinancing your existing home loan.",
        date: "Feb 5, 2026",
        image: images[1], // 2.jpg
        readTime: "6 min read",
      },
      {
        id: "33",
        title: "Short-Term Rentals: Navigating Airbnb and Local Laws",
        description:
          "A guide to generating income through vacation rentals and complying with local regulations and taxes.",
        date: "Feb 10, 2026",
        image: images[2], // 3.jpg
        readTime: "14 min read",
      },
      {
        id: "34",
        title: "Geographic Information Systems (GIS) in Real Estate",
        description:
          "Using advanced mapping and data layers to analyze property location and demographic data.",
        date: "Feb 15, 2026",
        image: images[3], // 4.jpg
        readTime: "8 min read",
      },
      {
        id: "35",
        title: "Effective Strategies for Selling Luxury Homes",
        description:
          "Tailored marketing approaches and client management techniques for the high-end real estate market.",
        date: "Feb 20, 2026",
        image: images[4], // 5.jpg
        readTime: "11 min read",
      },
      {
        id: "36",
        title: "Dealing with Buyer's Remorse and Cold Feet",
        description:
          "Techniques for agents to manage client anxiety and guide them confidently through the closing process.",
        date: "Feb 25, 2026",
        image: images[5], // 6.jpg
        readTime: "5 min read",
      },
      {
        id: "37",
        title: "The Hidden Costs of Homeownership: Beyond the Mortgage",
        description:
          "A look at maintenance, utilities, insurance, and other often-overlooked expenses of owning property.",
        date: "Mar 1, 2026",
        image: images[0], // 1.jpg
        readTime: "9 min read",
      },
      {
        id: "38",
        title: "Waterfront Property Investment: Risks and Rewards",
        description:
          "Special considerations for investing in coastal or lakeside homes, including flood zones and insurance.",
        date: "Mar 5, 2026",
        image: images[1], // 2.jpg
        readTime: "13 min read",
      },
      {
        id: "39",
        title: "Achieving Financial Freedom Through Rental Income",
        description:
          "Building a portfolio of rental properties to generate passive income and secure your future.",
        date: "Mar 10, 2026",
        image: images[2], // 3.jpg
        readTime: "10 min read",
      },
      {
        id: "40",
        title: "The Role of Drones in Modern Property Marketing",
        description:
          "How aerial photography and video tours are transforming property listings and virtual presentations.",
        date: "Mar 15, 2026",
        image: images[3], // 4.jpg
        readTime: "6 min read",
      },
      {
        id: "41",
        title: "Understanding Homeowners' Association (HOA) Rules",
        description:
          "What buyers need to know about HOAs, their fees, regulations, and how they impact property decisions.",
        date: "Mar 20, 2026",
        image: images[4], // 5.jpg
        readTime: "7 min read",
      },
      {
        id: "42",
        title: "Curb Appeal: Budget-Friendly Exterior Upgrades",
        description:
          "Simple, high-impact improvements to boost a property's first impression and perceived value.",
        date: "Mar 25, 2026",
        image: images[5], // 6.jpg
        readTime: "5 min read",
      },
      {
        id: "43",
        title: "Maximizing Tax Deductions for Homeowners",
        description:
          "A guide to the most valuable tax breaks available, from mortgage interest to property taxes.",
        date: "Apr 1, 2026",
        image: images[0], // 1.jpg
        readTime: "12 min read",
      },
      {
        id: "44",
        title: "The Pros and Cons of Fixer-Uppers",
        description:
          "Evaluating whether purchasing a property that requires extensive renovation is a worthwhile investment.",
        date: "Apr 5, 2026",
        image: images[1], // 2.jpg
        readTime: "10 min read",
      },
      {
        id: "45",
        title: "From Lead to Closing: Sales Funnel Optimization",
        description:
          "Optimizing the sales process to efficiently convert leads into completed property transactions.",
        date: "Apr 10, 2026",
        image: images[2], // 3.jpg
        readTime: "8 min read",
      },
      {
        id: "46",
        title: "Comparative Market Analysis (CMA) Explained",
        description:
          "How to perform a CMA to accurately value a property based on recent sales in the local area.",
        date: "Apr 15, 2026",
        image: images[3], // 4.jpg
        readTime: "7 min read",
      },
      {
        id: "47",
        title: "AI and Machine Learning in Property Management",
        description:
          "The application of AI for predictive maintenance, tenant management, and automated valuation.",
        date: "Apr 20, 2026",
        image: images[4], // 5.jpg
        readTime: "9 min read",
      },
      {
        id: "48",
        title: "The Essential Guide to 1031 Exchanges",
        description:
          "A deep dive into this tax-deferral strategy for exchanging one investment property for another.",
        date: "Apr 25, 2026",
        image: images[5], // 6.jpg
        readTime: "14 min read",
      },
      {
        id: "49",
        title: "Understanding Easements and Encumbrances",
        description:
          "Legal restrictions and rights that affect property ownership, such as utility easements and liens.",
        date: "May 1, 2026",
        image: images[0], // 1.jpg
        readTime: "6 min read",
      },
      {
        id: "50",
        title: "Modern Kitchen Design Trends for Property Value",
        description:
          "Key kitchen renovations and aesthetic choices that offer the highest aesthetic and financial return.",
        date: "May 5, 2026",
        image: images[1], // 2.jpg
        readTime: "8 min read",
      },
];

export interface LearnArticle {
    id: string;
    title: string;
    description: string;
    date: string;
    image: string;
    category: string;
    readTime: string;
}

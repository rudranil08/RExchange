export interface MockListing {
  id: string;
  title: string;
  creator: string;
  studentContext: string;
  category: string;
  exchangeType: string;
  offer: string;
  need: string;
  description: string;
  tags: string[];
}

export const MOCK_CATEGORIES = [
  "All",
  "Study",
  "Tech & Electronics",
  "Tickets & Events",
  "Skills & Services",
  "Opportunities",
  "Free / Give Away",
  "Other"
] as const;

export const MOCK_EXCHANGE_TYPES = [
  "All Types",
  "Swap",
  "Skill Exchange",
  "Sell",
  "Give Away",
  "Offer"
] as const;

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: "list-1",
    title: "Figma UI/UX Pitch Deck Design for Hackathons",
    creator: "Sarah Khan",
    studentContext: "Sophomore • Digital Media & Design",
    category: "Skills & Services",
    exchangeType: "Skill Exchange",
    offer: "High-impact Figma pitch deck and presentation slide design",
    need: "Python programming fundamentals & CS101 tutoring",
    description: "Experienced in Figma slide decks for campus startups. Looking for a CS peer to help me understand Python backend and recursion for CS101.",
    tags: ["figma", "design", "pitch-deck", "python", "tutoring"]
  },
  {
    id: "list-2",
    title: "Stewart Calculus 8th Edition + Complete Formula Notes",
    creator: "David Lee",
    studentContext: "Senior • Mechanical Engineering",
    category: "Study",
    exchangeType: "Swap",
    offer: "Calculus III textbook and handwritten formula study guides",
    need: "PyTorch machine learning model setup & mentorship",
    description: "Hardcover textbook in mint condition with my handwritten exam cheat sheets. Want mentorship on training a basic PyTorch model for my senior capstone.",
    tags: ["calculus", "textbook", "study-notes", "pytorch", "ml"]
  },
  {
    id: "list-3",
    title: "HackCampus VIP Hackathon All-Access Pass",
    creator: "Marcus Thorne",
    studentContext: "Junior • Electrical Engineering",
    category: "Tickets & Events",
    exchangeType: "Swap",
    offer: "HackCampus 2026 VIP Hackathon Pass & Swag kit",
    need: "TI-84 Plus Graphing Calculator",
    description: "Won an extra team ticket to HackCampus 2026 including hardware lab access. Need a TI-84 Plus CE graphing calculator for my circuits midterm.",
    tags: ["hackathon", "tickets", "events", "calculator"]
  },
  {
    id: "list-4",
    title: "TI-84 Plus CE Graphing Calculator (Rose Gold)",
    creator: "Priya Sharma",
    studentContext: "Freshman • Mathematics & Stats",
    category: "Tech & Electronics",
    exchangeType: "Swap",
    offer: "TI-84 Plus CE Graphing Calculator with charger",
    need: "HackCampus Hackathon ticket pass",
    description: "Working TI-84 Plus CE in rose gold with charger. Desperately looking for a pass to the sold-out HackCampus hackathon this weekend.",
    tags: ["calculator", "electronics", "tech", "hackathon", "tickets"]
  },
  {
    id: "list-5",
    title: "ML / PyTorch Capstone Project Tutoring & Debugging",
    creator: "Elena Rostova",
    studentContext: "Graduate • Data Science & AI",
    category: "Skills & Services",
    exchangeType: "Skill Exchange",
    offer: "PyTorch deep learning mentoring and debugging",
    need: "Stewart Calculus 8th Edition textbook",
    description: "Grad student in AI. Can help you structure and debug your PyTorch deep learning models. In exchange, I need Stewart Calculus textbook for my TA class.",
    tags: ["pytorch", "machine-learning", "tutoring", "calculus"]
  },
  {
    id: "list-6",
    title: "Robotics Team Firmware & ROS Co-Lead Position",
    creator: "Jordan Patel",
    studentContext: "Junior • Robotics & Mechatronics",
    category: "Opportunities",
    exchangeType: "Offer",
    offer: "Leadership role on Campus Rover Team + lab access",
    need: "Embedded C++ / ROS micro-controller skills",
    description: "Looking for an enthusiastic teammate to lead our autonomy stack firmware for the University Rover Challenge.",
    tags: ["robotics", "opportunities", "embedded", "c++", "ros"]
  },
  {
    id: "list-7",
    title: "Free Clean Chemistry Lab Coat (Size M) + ANSI Goggles",
    creator: "David Lee",
    studentContext: "Senior • Mechanical Engineering",
    category: "Free / Give Away",
    exchangeType: "Give Away",
    offer: "Clean chemistry lab coat (Size M) + ANSI Z87 safety goggles",
    need: "None / Free campus donation",
    description: "Graduating this semester, giving away clean chemistry lab coat and ANSI safety goggles to any freshman who needs them.",
    tags: ["lab-coat", "chemistry", "free", "giveaway", "safety-goggles"]
  },
  {
    id: "list-8",
    title: "Apple 60W USB-C Power Adapter + 2m Cable",
    creator: "Alex Morgan",
    studentContext: "Junior • Computer Science",
    category: "Tech & Electronics",
    exchangeType: "Swap",
    offer: "Genuine Apple 60W USB-C Charger block & braided cable",
    need: "Resume critique & technical interview mock session",
    description: "Spare charger in excellent condition. Looking for someone with internship experience to do a 45-min mock technical interview.",
    tags: ["apple", "charger", "tech", "interview-prep", "resume"]
  }
];

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  audioUrl: string;
  category: string;
  publishedAt: string;
  imageUrl: string;
  source: string;
  transcript: string[];
  isPlayed: boolean;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export const categories: Category[] = [
  {
    id: "tech",
    name: "Technology",
    icon: "cpu",
    description: "Latest in tech and innovation"
  },
  {
    id: "business",
    name: "Business",
    icon: "briefcase",
    description: "Business and financial news"
  },
  {
    id: "health",
    name: "Health",
    icon: "activity",
    description: "Health and wellness updates"
  },
  {
    id: "science",
    name: "Science",
    icon: "flask",
    description: "Scientific discoveries and research"
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "film",
    description: "Movies, music, and celebrity news"
  },
  {
    id: "sports",
    name: "Sports",
    icon: "trophy",
    description: "Latest sports scores and highlights"
  },
  {
    id: "politics",
    name: "Politics",
    icon: "landmark",
    description: "Political developments and policy"
  },
  {
    id: "world",
    name: "World",
    icon: "globe",
    description: "International news and events"
  }
];

export const mockNewsItems: NewsItem[] = [
  {
    id: "1",
    title: "AI Breakthrough in Medical Research",
    summary: "Researchers have developed a new AI model that can predict early signs of Alzheimer's disease with 94% accuracy, potentially enabling earlier intervention and treatment.",
    audioUrl: "/audio/news-1.mp3",
    category: "tech",
    publishedAt: "2023-09-15T08:30:00Z",
    imageUrl: "https://images.pexels.com/photos/6476255/pexels-photo-6476255.jpeg",
    source: "Tech Innovate",
    transcript: [
      "Researchers at Stanford University have made a significant breakthrough in medical AI.",
      "Their new model can detect early signs of Alzheimer's with 94% accuracy.",
      "This is a substantial improvement over current methods which are only about 80% accurate.",
      "The AI analyzes a combination of brain scans, blood tests, and cognitive assessments.",
      "Early detection could allow for more effective treatments and interventions.",
      "Clinical trials for this technology are expected to begin next year."
    ],
    isPlayed: false
  },
  {
    id: "2",
    title: "Global Climate Summit Reaches New Agreement",
    summary: "World leaders have agreed to reduce carbon emissions by an additional 10% by 2030 at the latest climate summit, with major economies pledging significant financial support for developing nations.",
    audioUrl: "/audio/news-2.mp3",
    category: "world",
    publishedAt: "2023-09-14T16:45:00Z",
    imageUrl: "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg",
    source: "Global News Network",
    transcript: [
      "The Climate Summit concluded today with a landmark agreement.",
      "195 countries have committed to a 10% reduction in carbon emissions by 2030.",
      "This is in addition to previous targets established in the Paris Agreement.",
      "Developed nations have pledged $100 billion annually to help developing countries.",
      "Environmental activists called the agreement a step forward but insufficient.",
      "Implementation plans are expected to be finalized within six months."
    ],
    isPlayed: false
  },
  {
    id: "3",
    title: "New Study Shows Benefits of Intermittent Fasting",
    summary: "A comprehensive 5-year study has demonstrated that intermittent fasting can lead to improved metabolic health, weight management, and potentially increased longevity when practiced safely.",
    audioUrl: "/audio/news-3.mp3",
    category: "health",
    publishedAt: "2023-09-13T12:15:00Z",
    imageUrl: "https://images.pexels.com/photos/5807575/pexels-photo-5807575.jpeg",
    source: "Health Today",
    transcript: [
      "A new study published in the Journal of Nutrition has shown positive results for intermittent fasting.",
      "Researchers followed 2,000 participants over five years.",
      "Those practicing intermittent fasting showed improved metabolic markers.",
      "Benefits included better insulin sensitivity and reduced inflammation.",
      "Weight management was also improved compared to control groups.",
      "Experts stress that fasting should be practiced safely and under guidance."
    ],
    isPlayed: true
  },
  {
    id: "4",
    title: "Tech Giant Announces Quantum Computing Milestone",
    summary: "A leading tech company has achieved quantum supremacy with a new 128-qubit processor, performing calculations that would take traditional supercomputers thousands of years to complete.",
    audioUrl: "/audio/news-4.mp3",
    category: "tech",
    publishedAt: "2023-09-12T09:00:00Z",
    imageUrl: "https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg",
    source: "Tech Chronicle",
    transcript: [
      "A major tech company announced a breakthrough in quantum computing today.",
      "Their new processor contains 128 qubits, doubling previous capabilities.",
      "It successfully performed calculations impossible for conventional computers.",
      "The company claims this demonstrates 'quantum supremacy'.",
      "This technology could revolutionize fields from cryptography to drug discovery.",
      "Commercial applications are still several years away, according to experts."
    ],
    isPlayed: true
  },
  {
    id: "5",
    title: "Market Report: Tech Stocks Surge After Fed Announcement",
    summary: "Technology stocks experienced a significant rally following the Federal Reserve's decision to maintain current interest rates, with the tech-heavy Nasdaq index gaining 2.3% in a single session.",
    audioUrl: "/audio/news-5.mp3",
    category: "business",
    publishedAt: "2023-09-11T17:30:00Z",
    imageUrl: "https://images.pexels.com/photos/6801651/pexels-photo-6801651.jpeg",
    source: "Financial Times",
    transcript: [
      "Tech stocks surged today following the Federal Reserve's announcement.",
      "The Fed will maintain current interest rates for the near term.",
      "The Nasdaq index closed up 2.3%, its best day in three months.",
      "Large tech companies led the rally, with several seeing gains over 4%.",
      "Analysts suggest this indicates continued investor confidence in the tech sector.",
      "Trading volume was 20% above average, showing strong market participation."
    ],
    isPlayed: false
  }
];
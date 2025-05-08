"use client";
import { useState, useRef } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { SearchResult } from "@/lib/types";

const users = [
  { name: "Tim", age: 5, desc: "likes planets and animals" },
  { name: "Thomas", age: 48, desc: "works in investment banking" },
  { name: "Marie", age: 67, desc: "doesn't quite understand AI" },
  { name: "Aroon", age: 16, desc: "studying for the SATs" },
  { name: "Addo", age: 29, desc: "likes his luxury" },
  { name: "Fatima", age: 34, desc: "teaches high school science" },
  { name: "Jorge", age: 22, desc: "university student, loves football" },
  { name: "Li Wei", age: 41, desc: "runs a small bakery" },
  { name: "Priya", age: 27, desc: "software engineer, enjoys hiking" },
  { name: "Omar", age: 53, desc: "history buff and chess player" },
  { name: "Sofia", age: 12, desc: "enjoys drawing and video games" },
  { name: "Grace", age: 75, desc: "retired, learning to use the internet" },
  { name: "Alex", age: 38, desc: "parent of two, time-strapped" },
  { name: "Musa", age: 19, desc: "aspiring musician" },
  { name: "Elena", age: 45, desc: "healthcare worker, marathon runner" },
];

const VISIBLE = 3;
const PROFILE_WIDTH = 300;

const userPrompts: Record<string, string> = {
  Tim: `You are a friendly search assistant for a curious 5‑year‑old with early reading skills and a passion for planets and animals. Write in very simple sentences, using short words and playful tone. Present facts as clear bullet points, include fun examples or little stories about friendly planets or animal characters. Use emojis or sounds (like "zoom!") to make concepts vivid. Avoid any technical terms or long paragraphs. Keep each answer bright, engaging, and easy to follow.`,
  Thomas: `You are a professional research assistant for an experienced investment banker. Deliver concise, data‑driven insights using industry terminology and relevant financial metrics. Structure answers with bullet points, tables, or numbered lists for clarity. Highlight key figures, trends, and actionable recommendations. Maintain a formal, analytical tone and avoid unnecessary storytelling. Focus on precision, rigor, and efficiency in every response.`,
  Marie: `You are a patient search guide for a 67‑year‑old who's new to technology and AI. Explain concepts in everyday language, avoiding jargon and defining any new word in plain English. Use short paragraphs and bullet points, with a one‑sentence summary up front. Offer simple analogies (like "AI is like a helpful librarian"). Encourage questions and provide gentle reminders that it's okay not to know everything. Keep the tone warm, supportive, and easy to understand.`,
  Aroon: `You are an expert SAT prep tutor for a focused 16‑year‑old aiming to excel on the SAT. Provide clear, structured explanations using concise bullet points, sample questions, and step‑by‑step solutions. Define any academic vocabulary in plain language and offer mnemonic devices or exam strategies. Maintain a supportive, motivating tone and highlight key takeaways for quick review. Use short paragraphs and label each section (e.g., "Concept," "Example," "Tip") to keep answers organized.`,
  Addo: `You are a luxury concierge search assistant for a discerning 29‑year‑old who values exclusivity and high‑end experiences. Curate recommendations that emphasize craftsmanship, limited editions, and premium services. Present results in bullet points with brand names, standout features, price ranges, and insider tips. Write in an elegant, aspirational tone—avoid mass‑market or budget options. Include brief comparisons to help select the ultimate luxury choice.`,
  Fatima: `You are a curriculum‑focused search assistant for a 34‑year‑old high school science teacher. Deliver accurate, standards‑aligned content with clear definitions, real‑world examples, and demonstration ideas. Structure answers with numbered steps, labeled diagrams (described textually), and suggested classroom activities. Explain any technical term in plain English, and offer extension exercises or formative assessment questions. Maintain a professional yet approachable tone throughout.`,
  Jorge: `You are an energetic search assistant for a 22‑year‑old university student passionate about football. Provide concise, well‑researched answers at a college reading level using bullet points and brief summaries. When helpful, draw analogies to football strategy or famous players to illustrate concepts. Include relevant data, statistics, or citations for academic topics. Keep the tone engaging and relatable, and suggest further resources or study guides.`,
  "Li Wei": `You are a practical business consulting search assistant for a 41‑year‑old bakery owner. Offer clear, actionable advice on operations, recipes, marketing, and cost management. Use bullet points and tables to compare ingredient costs, equipment options, or promotional channels. Provide step‑by‑step guides (e.g., for new recipes or social media campaigns) and highlight best practices from successful small bakeries. Maintain a supportive, professional tone focused on efficiency and profitability.`,
  Priya: `You are a versatile search assistant for a 27‑year‑old software engineer who loves hiking. Provide in‑depth technical explanations with relevant code snippets, links to official docs, and concise summaries. When helpful, draw hiking analogies to explain complex ideas (for example, "this algorithm is like mapping a trail"). Structure answers with bullet points and labeled sections (e.g., "Example Code," "Explanation," "Further Reading"). Keep a balanced tone: professional, yet friendly and engaging.`,
  Omar: `You are a scholarly search assistant for a 53‑year‑old who enjoys history and chess. Offer detailed historical context with timelines, primary‑source references, and key turning points. When appropriate, use chess metaphors (e.g., "this campaign opened like a queen's gambit") to illuminate strategy. Organize responses with numbered lists, mini timelines, or brief tables. Maintain an analytical, reflective tone that respects depth of knowledge and encourages strategic thinking.`,
  Sofia: `You are a playful search assistant for a 12‑year‑old who enjoys drawing and video games. Write in short, clear sentences and kid‑friendly language. Use bullet points and step‑by‑step guides for any process (like drawing tutorials or game tips). Include fun examples or simple analogies to popular games. Encourage creativity with prompts like "try sketching this character." Keep the tone upbeat, supportive, and interactive.`,
  Grace: `You are a patient search assistant for a 75‑year‑old beginner on the internet. Explain each step in simple, everyday language and define any new terms immediately. Use numbered instructions and single‑sentence explanations. Offer reassurance ("take your time") and gentle reminders that questions are welcome. Keep paragraphs very short and avoid jargon. Maintain a warm, encouraging tone throughout.`,
  Alex: `You are an efficient search assistant for a busy 38‑year‑old parent of two. Provide concise answers with clear bullet points or numbered lists. Highlight quick‑win tips, time‑saving hacks, and "must‑know" takeaways up front. Use short paragraphs and headers like "Overview," "Action Steps," and "Resources." Keep the tone empathetic and practical, focusing on delivering value in minimal time.`,
  Musa: `You are an inspiring search assistant for a 19‑year‑old aspiring musician. Deliver creative yet structured guidance: include bullet points under sections like "Technique Tips," "Practice Exercises," and "Recommended Tracks." Offer chord charts, basic notation examples, or links to simple tutorials when relevant. Use encouraging language and music‑related metaphors (e.g., "hit the high note like a crescendo"). Keep tone motivational and supportive of artistic growth.`,
  Elena: `You are a precise search assistant for a 45‑year‑old healthcare professional who runs marathons. Provide evidence‑based information with clear summaries, bullet points, and tables (e.g., training paces, nutrition plans). Cite authoritative sources when applicable. Offer step‑by‑step protocols (for both clinical questions and training schedules). Maintain a professional, data‑driven tone that's also motivational for athletic goals.`
};

export default function UseCasesPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [start, setStart] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profilesRowRef = useRef<HTMLDivElement>(null);

  const canScrollLeft = start > 0;
  const canScrollRight = start + VISIBLE < users.length;

  const handleLeft = () => {
    if (!canScrollLeft) return;
    setStart((s) => Math.max(0, s - 1));
  };
  const handleRight = () => {
    if (!canScrollRight) return;
    setStart((s) => Math.min(users.length - VISIBLE, s + 1));
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setError(null);
    setAnswer('');
    setSearchResults([]);

    // Prepend user prompt if a user is selected
    let finalQuery = query;
    if (selected !== null) {
      const user = users[selected];
      const prefix = userPrompts[user.name];
      if (prefix) {
        finalQuery = `${prefix}\n\n${query}`;
      }
    }

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: finalQuery,
          userContext: {
            demographics: {
              profession: selected !== null ? users[selected].desc : undefined
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results);
      setAnswer(data.answer);
    } catch (err) {
      setError('Failed to perform search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Always visible profiles section */}
        <div className="flex flex-col items-center mb-8">
          <h1
            className="text-3xl font-bold mb-8"
            style={{ fontFamily: "Times New Roman, Times, serif" }}
          >
            Search as...
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLeft}
              disabled={!canScrollLeft}
              className={`w-8 h-8 flex items-center justify-center rounded-full border transition
                ${canScrollLeft ? "bg-white hover:bg-gray-100 text-black border-gray-200" : "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"}
              `}
              aria-label="Scroll left"
            >
              &#8592;
            </button>
            <div
              className="overflow-hidden"
              style={{ width: `${PROFILE_WIDTH * VISIBLE}px`, maxWidth: `${PROFILE_WIDTH * VISIBLE}px` }}
            >
              <div
                className="flex gap-4 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${start * (PROFILE_WIDTH + 16)}px)` }}
              >
                {users.map((user, idx) => {
                  const isSelected = selected === idx;
                  return (
                    <button
                      key={user.name}
                      onClick={() => setSelected(selected === idx ? null : idx)}
                      className={`
                        transition rounded-full border
                        font-medium
                        w-[280px] h-9 px-6
                        flex flex-col items-center justify-center
                        text-center
                        ${isSelected
                          ? "bg-black text-white border-black"
                          : selected === null
                            ? "bg-white text-black border-gray-200 hover:bg-gray-100"
                            : "bg-gray-100 text-gray-400 border-gray-100"}
                      `}
                      style={{ fontFamily: "Times New Roman, Times, serif", minWidth: 280, maxWidth: 280 }}
                    >
                      <span className="leading-tight">
                        {user.name} - {user.age}
                      </span>
                      <span className="text-xs font-normal leading-tight">{user.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={handleRight}
              disabled={!canScrollRight}
              className={`w-8 h-8 flex items-center justify-center rounded-full border transition
                ${canScrollRight ? "bg-white hover:bg-gray-100 text-black border-gray-200" : "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"}
              `}
              aria-label="Scroll right"
            >
              &#8594;
            </button>
          </div>
        </div>

        {/* Search results and answer, and always show the rectangular search bar at the bottom */}
        <div className={searchQuery || isLoading ? "space-y-8" : ""}>
          {/* Results section */}
          {(searchQuery || isLoading) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : (
                <SearchResults 
                  results={searchResults}
                  answer={answer}
                />
              )}
            </div>
          )}

          {/* Search bar at the bottom (always visible) */}
          <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center z-40">
            <div className="w-full max-w-4xl mx-auto px-4">
              <div className="px-4 py-4 backdrop-blur-lg bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <SearchBar 
                  onSearch={handleSearch} 
                  initialQuery={searchQuery}
                  isConversationMode={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
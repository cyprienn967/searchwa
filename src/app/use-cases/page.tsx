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
const PROFILE_WIDTH = 320;

const userPrompts: Record<string, string> = {
  Tim: `Answer the following question directly and accurately for a curious 5-year-old with early reading skills.
Use very simple sentences, short words, and a playful tone.
Present facts as clear bullet points.
If relevant to the question, include examples or brief stories.
Use emojis occasionally if it helps explain the concept.
Avoid technical terms or long paragraphs.
IMPORTANT: Focus primarily on answering the exact question asked, not just on planets and animals.`,

  Thomas: `Answer the following question directly and accurately for an experienced investment banker.
Deliver concise, data-driven insights.
Use industry terminology only when relevant to the question.
Structure information with bullet points, tables, or numbered lists for clarity.
Highlight key figures, trends, and actionable information.
Maintain a formal, analytical tone.
IMPORTANT: Focus primarily on answering the exact question asked, not just on finance topics.`,

  Marie: `Answer the following question directly and accurately for a 67-year-old who's new to technology.
Explain concepts in everyday language, avoiding jargon.
Define any technical terms you must use in plain English.
Use short paragraphs and bullet points.
Provide a one-sentence summary at the beginning.
Use simple analogies when helpful for complex ideas.
IMPORTANT: Focus primarily on answering the exact question asked, not just on technology topics.`,

  Aroon: `Answer the following question directly and accurately for a 16-year-old studying for the SAT.
Provide clear, structured explanations at an appropriate academic level.
Use concise bullet points and step-by-step solutions when applicable.
Define academic vocabulary when needed.
Include study strategies if relevant to the question.
Maintain a supportive, motivating tone.
IMPORTANT: Focus primarily on answering the exact question asked, not just on SAT-related topics.`,

  Addo: `Answer the following question directly and accurately for someone who appreciates luxury and high-quality.
If the question relates to products or experiences, emphasize quality, craftsmanship, and premium options.
Present information elegantly with attention to detail.
Include brand names, features, or comparisons only when relevant.
Write in a sophisticated, aspirational tone.
IMPORTANT: Focus primarily on answering the exact question asked, not just on luxury topics.`,

  Fatima: `Answer the following question directly and accurately for a high school science teacher.
Provide accurate, educational content related to the question.
Include clear definitions, examples, and practical applications when relevant.
Structure information in a teaching-friendly format.
Explain technical concepts clearly without oversimplifying.
Offer classroom application ideas only if directly relevant.
IMPORTANT: Focus primarily on answering the exact question asked, not just on science education topics.`,

  Jorge: `Answer the following question directly and accurately for a university student who enjoys football.
Provide well-researched information at a college reading level.
Use bullet points and brief summaries for clarity.
Include analogies to football only if they genuinely help explain the concept.
Keep the tone engaging and relatable.
IMPORTANT: Focus primarily on answering the exact question asked, not just on football topics.`,

  "Li Wei": `Answer the following question directly and accurately for a small bakery owner.
Provide practical, actionable information related to the question.
If the question relates to business, include operational insights.
Use bullet points and structured formats for clarity.
Keep advice practical and implementation-focused.
IMPORTANT: Focus primarily on answering the exact question asked, not just on bakery or business topics.`,

  Priya: `Answer the following question directly and accurately for a software engineer who enjoys hiking.
Provide technical depth when the question calls for it.
Include code examples only if directly related to a technical question.
Structure information with clear sections and bullet points.
Use hiking analogies only when they genuinely clarify a concept.
Balance technical precision with accessibility.
IMPORTANT: Focus primarily on answering the exact question asked, not just on technology or hiking topics.`,

  Omar: `Answer the following question directly and accurately for someone interested in history and chess.
Provide depth and context appropriate to the question.
Include historical references or timelines if relevant.
Use chess metaphors only when they genuinely help explain a concept.
Maintain an analytical, thoughtful tone.
IMPORTANT: Focus primarily on answering the exact question asked, not just on history or chess topics.`,

  Sofia: `Answer the following question directly and accurately for a 12-year-old who enjoys drawing and games.
Use clear, straightforward language appropriate for this age.
Include step-by-step instructions if the question asks for how to do something.
Make explanations visual and engaging when possible.
Keep the tone friendly and supportive.
IMPORTANT: Focus primarily on answering the exact question asked, not just on art or gaming topics.`,

  Grace: `Answer the following question directly and accurately for a senior who is learning to use the internet.
Use simple, jargon-free language.
Provide step-by-step instructions for any technical processes.
Keep explanations brief and clear.
Be patient and encouraging in your tone.
IMPORTANT: Focus primarily on answering the exact question asked, not just on technology topics.`,

  Alex: `Answer the following question directly and accurately for a busy parent with limited time.
Provide concise, practical information that gets straight to the point.
Use bullet points, numbered lists, and clear headers.
Highlight the most important takeaways first.
Keep everything brief and action-oriented.
IMPORTANT: Focus primarily on answering the exact question asked in the most time-efficient way.`,

  Musa: `Answer the following question directly and accurately for an aspiring musician.
If the question relates to music, include relevant musical concepts.
Structure information in a clear, organized way.
Provide practical guidance if the question asks for it.
Use encouraging language that supports creative development.
IMPORTANT: Focus primarily on answering the exact question asked, not just on music topics.`,

  Elena: `Answer the following question directly and accurately for a healthcare professional who runs marathons.
Provide evidence-based information when the question calls for it.
Use clear summaries and structured formatting.
Include references to reliable sources when appropriate.
Maintain a professional tone while being motivational when relevant.
IMPORTANT: Focus primarily on answering the exact question asked, not just on healthcare or running topics.`
};

export default function UseCasesPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [start, setStart] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCount, setSearchCount] = useState<number>(0);
  const [searchLimitReached, setSearchLimitReached] = useState<boolean>(false);

  const MAX_SEARCHES = 5;
  const remainingSearches = MAX_SEARCHES - searchCount;

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
    if (searchLimitReached || searchCount >= MAX_SEARCHES) {
      setError("You have reached the maximum number of searches. Please try again later.");
      setSearchLimitReached(true);
      return;
    }

    setSearchQuery(query);
    setIsLoading(true);
    setError(null);
    setAnswer('');
    setSearchResults([]);

    // Structure the query with the prompt if a user is selected
    let finalQuery = query;
    if (selected !== null) {
      const user = users[selected];
      const prefix = userPrompts[user.name];
      if (prefix) {
        finalQuery = `${prefix}
        
USER QUESTION: ${query}

Remember to answer this specific question directly, not just reflect on topics mentioned in the instructions above.`;
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

      // Check if the response is a stream
      if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get stream reader');
        }

        // Set loading to false, we'll show the incremental results
        setIsLoading(false);
        
        // For collecting the streamed answer
        let fullAnswer = '';
        
        // Process the stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Convert the chunk to text
          const chunkText = new TextDecoder().decode(value);
          
          // Process each line (each line is a JSON object)
          const lines = chunkText.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (data.type === 'results') {
                // Update search results when we get them
                setSearchResults(data.data.results);
              } else if (data.type === 'chunk') {
                // Incrementally update the answer as chunks arrive
                fullAnswer += data.data;
                setAnswer(fullAnswer);
              } else if (data.type === 'error') {
                throw new Error(data.data);
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
        
        // Increment search count and check if limit is reached
        const newSearchCount = searchCount + 1;
        setSearchCount(newSearchCount);
        if (newSearchCount >= MAX_SEARCHES) {
          setSearchLimitReached(true);
        }
      } else {
        // Fallback to non-streaming response (for backward compatibility)
        const data = await response.json();
        setSearchResults(data.results);
        setAnswer(data.answer);
        
        // Increment search count and check if limit is reached
        const newSearchCount = searchCount + 1;
        setSearchCount(newSearchCount);
        if (newSearchCount >= MAX_SEARCHES) {
          setSearchLimitReached(true);
        }
        
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to perform search. Please try again.');
      console.error('Search error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Always visible profiles section */}
        <div className="flex flex-col items-center mb-12">
          <h1
            className="text-4xl font-bold mb-6"
            style={{ fontFamily: "Times New Roman, Times, serif" }}
          >
            Search as...
          </h1>
          
          {selected !== null && (
            <p className="text-lg text-gray-600 mb-8">
              You're searching as <span className="font-semibold">{users[selected].name}</span> - {users[selected].desc}
            </p>
          )}
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeft}
              disabled={!canScrollLeft}
              className={`w-12 h-12 flex items-center justify-center rounded-lg border shadow-sm transition
                ${canScrollLeft 
                  ? "bg-white hover:bg-gray-50 active:bg-gray-100 text-black border-gray-200" 
                  : "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"}
              `}
              aria-label="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div
              className="overflow-hidden"
              style={{ width: `${PROFILE_WIDTH * VISIBLE + (VISIBLE - 1) * 24}px`, maxWidth: `${PROFILE_WIDTH * VISIBLE + (VISIBLE - 1) * 24}px` }}
            >
              <div
                className="flex gap-6 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${start * (PROFILE_WIDTH + 24)}px)` }}
                ref={profilesRowRef}
              >
                {users.map((user, idx) => {
                  const isSelected = selected === idx;
                  return (
                    <button
                      key={user.name}
                      onClick={() => {
                        // Clear results when changing profiles
                        if (selected !== idx) {
                          setSearchQuery("");
                          setAnswer("");
                          setSearchResults([]);
                          setError(null);
                        }
                        setSelected(selected === idx ? null : idx);
                      }}
                      className={`
                        transition rounded-lg border shadow-sm
                        font-medium cursor-pointer
                        w-[${PROFILE_WIDTH}px] p-5
                        flex flex-col items-start justify-center
                        text-left relative
                        hover:shadow-md hover:translate-y-[-2px]
                        active:translate-y-[0px] active:shadow-sm
                        ${isSelected
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600"
                          : selected === null
                            ? "bg-white text-black border-gray-200 hover:bg-gray-50"
                            : "bg-gray-100 text-gray-500 border-gray-100"}
                      `}
                      style={{ 
                        fontFamily: "Times New Roman, Times, serif", 
                        minWidth: PROFILE_WIDTH, 
                        maxWidth: PROFILE_WIDTH,
                        minHeight: "90px",
                      }}
                    >
                      <span className="text-lg font-semibold leading-tight mb-2">
                        {user.name}, {user.age}
                      </span>
                      <span className="text-sm font-normal leading-normal">{user.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={handleRight}
              disabled={!canScrollRight}
              className={`w-12 h-12 flex items-center justify-center rounded-lg border shadow-sm transition
                ${canScrollRight 
                  ? "bg-white hover:bg-gray-50 active:bg-gray-100 text-black border-gray-200" 
                  : "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"}
              `}
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search counter */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${
            searchLimitReached 
              ? "bg-red-50 text-red-700 border border-red-200" 
              : "bg-purple-50 text-purple-700 border border-purple-200"
          }`}>
            <span className="font-medium">
              {searchLimitReached 
                ? "Search limit reached" 
                : `${remainingSearches} search${remainingSearches !== 1 ? 'es' : ''} remaining`
              }
            </span>
          </div>
        </div>

        {/* Search results and answer */}
        <div className={searchQuery || isLoading ? "space-y-10" : ""}>
          {/* Results section */}
          {(searchQuery || isLoading) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-6">{error}</div>
              ) : (
                <SearchResults 
                  results={searchResults}
                  answer={answer}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          )}

          {/* Search bar at the bottom (always visible) */}
          <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center z-40">
            <div className="w-full max-w-4xl mx-auto px-6">
              <div className="px-6 py-5 backdrop-blur-lg bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <SearchBar 
                  onSearch={handleSearch} 
                  initialQuery=""
                  isConversationMode={true}
                  disabled={searchLimitReached}
                />
                
                {searchLimitReached && (
                  <div className="mt-2 text-center text-red-600 text-sm">
                    You've reached the maximum of {MAX_SEARCHES} searches. Please try again later.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
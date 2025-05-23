import { useState } from "react";

export default function ProfileModal({ 
  onSubmit, 
  onClose, 
  loading,
  userEmail,
  inviteCode 
}: { 
  onSubmit: (data: any) => Promise<boolean>, 
  onClose: () => void, 
  loading: boolean,
  userEmail: string,
  inviteCode: string
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [usage, setUsage] = useState("");
  const [answerFormat, setAnswerFormat] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      // Combine the three text fields into one about field
      const combinedAbout = `Tell us about yourself:\n${about}\n\nHow I'll use Steer:\n${usage}\n\nHow I want my answers:\n${answerFormat}`;
      const success = await onSubmit({ 
        email: userEmail,
        inviteCode,
        name, 
        age,
        location,
        about: combinedAbout,
        interests: [], // Initialize empty interests array
        feedback: [], // Initialize empty feedback array
        flag: false, // Default flag value
        prompt: "" // Empty prompt by default
      });
      
      if (success) {
        onClose();
      } else {
        setError("Failed to save profile. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Complete Your Profile</h2>
        </div>
        <form id="profile-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={age}
              onChange={e => setAge(e.target.value)}
              required
              placeholder="Your age"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
              placeholder="United States"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tell us about yourself</label>
            <textarea 
              className="w-full border rounded px-3 py-2 min-h-[100px]" 
              value={about} 
              onChange={e => setAbout(e.target.value)} 
              required 
              placeholder="I'm in high school studying for my AP exams. I'm interested in science and I'm experienced in tech, and I'm starting to teach myself to code. I'm not too good at writing English though :)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">How will you use Steer?</label>
            <textarea 
              className="w-full border rounded px-3 py-2 min-h-[100px]" 
              value={usage} 
              onChange={e => setUsage(e.target.value)} 
              required 
              placeholder="mostly to search random science stuff up like with Google, but also to understand the latest news in politics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">How do you want your answers?</label>
            <textarea 
              className="w-full border rounded px-3 py-2 min-h-[100px]" 
              value={answerFormat} 
              onChange={e => setAnswerFormat(e.target.value)} 
              required 
              placeholder="bullet points help me understand best"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </form>
        <div className="p-6 pt-4 border-t">
          <button
            type="submit"
            form="profile-form"
            className="w-full py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
} 
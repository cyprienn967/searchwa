import { useState } from "react";

export default function ProfileModal({ onSubmit, loading }: { onSubmit: (data: any) => void, loading: boolean }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [about, setAbout] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col relative">
        <h2 className="text-2xl font-bold p-6 pb-4 text-center">Tell us about yourself</h2>
        <form
          id="profile-form"
          className="space-y-4 overflow-y-auto p-6 pt-0"
          onSubmit={e => {
            e.preventDefault();
            onSubmit({ name, age, about });
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              className="w-full border rounded px-3 py-2" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input 
              className="w-full border rounded px-3 py-2" 
              value={age} 
              onChange={e => setAge(e.target.value)} 
              required 
              type="number" 
              min="0" 
              placeholder="15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tell us about yourself</label>
            <textarea 
              className="w-full border rounded px-3 py-2 min-h-[200px]" 
              value={about} 
              onChange={e => setAbout(e.target.value)} 
              required 
              placeholder="I'm in high school studying for my AP exams. I'm interested in science and I'm experienced in tech, and I'm starting to teach myself to code. I'm not too good at writing English though :)

I'll mostly use Steer to search random science stuff up like with Google, but also to understand the latest news in politics.

For answers, bullet points help me understand best!"
            />
          </div>
        </form>
        <div className="p-6 pt-4 border-t">
          <button
            type="submit"
            form="profile-form"
            className="w-full py-2 bg-indigo-600 text-white rounded font-semibold"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
} 
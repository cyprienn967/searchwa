import { useState } from "react";

export default function ProfileModal({ onSubmit, loading }: { onSubmit: (data: any) => void, loading: boolean }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 relative">
        <h2 className="text-2xl font-bold mb-4 text-center">Tell us about yourself</h2>
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            onSubmit({ name, age, location, about });
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input className="w-full border rounded px-3 py-2" value={age} onChange={e => setAge(e.target.value)} required type="number" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input className="w-full border rounded px-3 py-2" value={location} onChange={e => setLocation(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tell us about yourself and your interests</label>
            <textarea className="w-full border rounded px-3 py-2 min-h-[100px]" value={about} onChange={e => setAbout(e.target.value)} required />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded font-semibold"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
} 
"use client";
import { useState } from "react";

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

export default function UseCases() {
  const [selected, setSelected] = useState<number | null>(null);
  const [start, setStart] = useState(0);

  const canScrollLeft = start > 0;
  const canScrollRight = start + VISIBLE < users.length;

  const handleLeft = () => setStart((s) => Math.max(0, s - 1));
  const handleRight = () => setStart((s) => Math.min(users.length - VISIBLE, s + 1));

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
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
        <div className="flex gap-4">
          {users.slice(start, start + VISIBLE).map((user, idx) => {
            const realIdx = start + idx;
            const isSelected = selected === realIdx;
            return (
              <button
                key={user.name}
                onClick={() => setSelected(selected === realIdx ? null : realIdx)}
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
                style={{ fontFamily: "Times New Roman, Times, serif" }}
              >
                <span className="leading-tight">
                  {user.name} - {user.age}
                </span>
                <span className="text-xs font-normal leading-tight">{user.desc}</span>
              </button>
            );
          })}
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
  );
} 
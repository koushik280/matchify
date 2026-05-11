"use client";

import { motion } from "framer-motion";

const INTEREST_OPTIONS = [
  "Music",
  "Travel",
  "Sports",
  "Food",
  "Movies",
  "Gaming",
  "Photography",
  "Dancing",
  "Reading",
  "Fitness",
  "Yoga",
  "Art",
  "Hiking",
  "Coffee",
  "Cooking",
  "Pets",
  "Fashion",
  "Technology",
];

interface InterestsSelectorProps {
  selected: string[];
  onChange: (interests: string[]) => void;
}

export function InterestsSelector({
  selected,
  onChange,
}: InterestsSelectorProps) {
  const toggle = (interest: string) => {
    if (selected.includes(interest)) {
      onChange(selected.filter((i) => i !== interest));
    } else {
      onChange([...selected, interest]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-3">
        Select your interests
      </label>
      <div className="flex flex-wrap gap-3">
        {INTEREST_OPTIONS.map((interest) => (
          <motion.button
            key={interest}
            type="button"
            onClick={() => toggle(interest)}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selected.includes(interest)
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-white/10 hover:bg-white/20 text-foreground"
            }`}
          >
            {interest}
          </motion.button>
        ))}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground mt-4">
          Selected ({selected.length}): {selected.join(", ")}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is oneDB?",
    answer: "oneDB is a comprehensive database platform that brings together projects, ideas, people, apps, and resources in one place. It's designed to help you discover, contribute, and build with the community."
  },
  {
    question: "How does the Arena work?",
    answer: "The Arena is a space where you can instantly publish your projects and ideas without approval. Content is ranked weekly based on community interaction and time, allowing the best content to rise to the top."
  },
  {
    question: "How does the Database differ from Arena?",
    answer: "The Database contains curated entries for people, resources, and apps that are community-validated through voting. Unlike Arena, submissions require community approval through an upvote/downvote system with threshold-based approval to ensure quality."
  },
  {
    question: "How can I contribute?",
    answer: "You can contribute by submitting projects, ideas, people, apps, or resources through our submission forms. You can also vote on database submissions to help curate quality content. All contributions help build the oneDB community."
  },
  {
    question: "Do I need to sign up to use oneDB?",
    answer: "You can browse and explore oneDB without signing up. However, to submit content, vote, like, or comment, you'll need to create an account using one of our supported authentication methods (Discord, GitHub, or Google)."
  },
  {
    question: "How are items ranked in the Arena?",
    answer: "Items in the Arena are ranked weekly based on a combination of community interaction (likes, comments) and time. This ensures fresh content gets visibility while rewarding community engagement."
  },
  {
    question:"Why admin approval for DB submissions when you say it's community driven?",
    answer:"oneDB indeed is community driven but for initial submissions when we don't have a large enough audience to validate the content, we need to have admins to help in moderation process to ensure the quality of the content. Still community's decision hold more weight than admin."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
        
            <h2 className="text-3xl font-bold">FAQ</h2>
          </div>
          <p className="text-muted-foreground">
            Everything you need to know about oneDB
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="border-2 border-dashed border-border rounded-lg bg-card overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-semibold text-lg pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-primary flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-4 pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


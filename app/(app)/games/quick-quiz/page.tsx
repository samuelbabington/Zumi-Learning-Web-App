"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Zap, Timer, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Question = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
};

// Demo questions — these would come from AI generation in production
const DEMO_QUESTIONS: Question[] = [
  {
    question: "What does RAM stand for in computing?",
    options: ["Random Access Memory", "Read And Modify", "Rapid Algorithmic Memory", "Remote Access Module"],
    correct: 0,
    explanation: "RAM stands for Random Access Memory. It's temporary storage the CPU uses to hold data it's actively working with.",
    topic: "Computer Science",
  },
  {
    question: "Which process do plants use to convert sunlight into food?",
    options: ["Respiration", "Fermentation", "Photosynthesis", "Osmosis"],
    correct: 2,
    explanation: "Photosynthesis is the process plants use to convert light energy into glucose using CO₂ and water.",
    topic: "Biology",
  },
  {
    question: "What is the chemical symbol for Gold?",
    options: ["Gd", "Go", "Au", "Ag"],
    correct: 2,
    explanation: "Au comes from the Latin word 'Aurum', which means gold.",
    topic: "Chemistry",
  },
  {
    question: "In Python, which keyword is used to define a function?",
    options: ["function", "fun", "define", "def"],
    correct: 3,
    explanation: "In Python, the 'def' keyword is used to define a function: def my_function():",
    topic: "Computer Science",
  },
  {
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"],
    correct: 2,
    explanation: "The mitochondria is known as the powerhouse of the cell because it produces ATP energy through cellular respiration.",
    topic: "Biology",
  },
];

type GameState = "config" | "playing" | "results";

export default function QuickQuizPage() {
  const [state, setState] = useState<GameState>("config");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(20);
  const [results, setResults] = useState<{ correct: boolean; answer: number | null }[]>([]);
  const [config, setConfig] = useState({ count: 5, timed: true, difficulty: "intermediate" });
  const [combo, setCombo] = useState(0);

  const questions = DEMO_QUESTIONS.slice(0, config.count);
  const current = questions[questionIdx];

  const handleAnswer = useCallback((idx: number | null) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);

    const isCorrect = idx === current?.correct;
    if (isCorrect) {
      setScore((s) => s + (combo >= 3 ? 2 : 1) * (config.timed ? Math.max(1, Math.ceil(timer / 4)) : 1));
      setCombo((c) => c + 1);
    } else {
      setCombo(0);
    }
    setResults((r) => [...r, { correct: isCorrect, answer: idx }]);
  }, [answered, current?.correct, combo, config.timed, timer]);

  useEffect(() => {
    if (state !== "playing" || answered || !config.timed) return;
    if (timer <= 0) { handleAnswer(null); return; }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [state, answered, config.timed, timer, handleAnswer]);

  const nextQuestion = () => {
    if (questionIdx + 1 >= questions.length) {
      setState("results");
    } else {
      setQuestionIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
      setTimer(20);
    }
  };

  const restart = () => {
    setState("config");
    setQuestionIdx(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setTimer(20);
    setResults([]);
    setCombo(0);
  };

  if (state === "config") {
    return (
      <div className="min-h-screen bg-zumi-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 animate-slide-up">
          <Link href="/games" className="inline-flex items-center gap-2 text-sm text-zumi-muted hover:text-zumi transition-colors">
            <ArrowLeft size={16} /> Back to games
          </Link>

          <div className="card-base p-8 space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-3 animate-float">⚡</div>
              <h1 className="text-2xl font-extrabold text-zumi" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quick Quiz</h1>
              <p className="text-zumi-muted text-sm mt-1">Multiple-choice questions with instant feedback</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zumi-2 block mb-2">Questions</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => setConfig((c) => ({ ...c, count: n }))}
                      className={cn("flex-1 py-2 rounded-xl text-sm font-medium border transition-all", config.count === n ? "border-pink-500 bg-pink-500/15 text-zumi-pink" : "border-zumi bg-zumi-surface-2 text-zumi-2 hover:border-zumi-2")}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zumi-2 block mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {["easy", "intermediate", "advanced"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setConfig((c) => ({ ...c, difficulty: d }))}
                      className={cn("flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize", config.difficulty === d ? "border-pink-500 bg-pink-500/15 text-zumi-pink" : "border-zumi bg-zumi-surface-2 text-zumi-2 hover:border-zumi-2")}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zumi-surface-2 border border-zumi">
                <div>
                  <p className="text-sm font-medium text-zumi">Countdown timer</p>
                  <p className="text-xs text-zumi-muted">20 seconds per question</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={config.timed} onChange={(e) => setConfig((c) => ({ ...c, timed: e.target.checked }))} className="sr-only peer" />
                  <div className="w-10 h-5 bg-zumi-surface-3 border border-zumi rounded-full peer peer-checked:bg-pink-500 peer-checked:border-pink-500 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={() => setState("playing")}>
              Start Quiz ⚡
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "results") {
    const correct = results.filter((r) => r.correct).length;
    const accuracy = Math.round((correct / questions.length) * 100);
    const xpEarned = score * 10;

    return (
      <div className="min-h-screen bg-zumi-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 animate-pop-in">
          <div className="card-base p-8 text-center space-y-6">
            <div>
              <div className="text-6xl mb-3">{accuracy >= 80 ? "🏆" : accuracy >= 60 ? "⭐" : "💪"}</div>
              <h2 className="text-2xl font-extrabold text-zumi" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {accuracy >= 80 ? "Excellent!" : accuracy >= 60 ? "Good job!" : "Keep practicing!"}
              </h2>
              <p className="text-zumi-muted mt-1">Quiz complete</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🎯", label: "Accuracy", value: `${accuracy}%` },
                { icon: "✅", label: "Correct", value: `${correct}/${questions.length}` },
                { icon: "⚡", label: "XP Earned", value: `+${xpEarned}` },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl bg-zumi-surface-2 border border-zumi text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="text-lg font-bold text-zumi">{s.value}</p>
                  <p className="text-xs text-zumi-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Question results breakdown */}
            <div className="space-y-2 text-left">
              {results.map((r, i) => (
                <div key={i} className={cn("flex items-center gap-3 p-2.5 rounded-xl border text-sm", r.correct ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10")}>
                  {r.correct ? <CheckCircle2 size={16} className="text-green-400 shrink-0" /> : <XCircle size={16} className="text-red-400 shrink-0" />}
                  <span className="text-zumi-muted text-xs truncate">{questions[i].question}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={restart} className="flex-1">Try again</Button>
              <Link href="/games" className="flex-1">
                <Button className="w-full"><Trophy size={15} /> More games</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing state
  const progress = ((questionIdx) / questions.length) * 100;
  const timerPercent = (timer / 20) * 100;

  return (
    <div className="min-h-screen bg-zumi-bg flex flex-col p-4 md:p-6">
      {/* Top bar */}
      <div className="max-w-2xl mx-auto w-full mb-6">
        <div className="flex items-center justify-between mb-3">
          <Link href="/games" className="p-2 rounded-lg btn-secondary">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {combo >= 3 && (
              <span className="flex items-center gap-1 text-orange-400 font-bold animate-bounce-soft">
                🔥 {combo}x Combo!
              </span>
            )}
            <span className="flex items-center gap-1 font-bold text-zumi">
              <Zap size={14} className="text-pink-400" />
              {score} pts
            </span>
            <span className="text-zumi-muted text-xs">{questionIdx + 1}/{questions.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-zumi-surface-2 rounded-full overflow-hidden">
          <div className="h-full xp-bar-fill rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-5 animate-fade-in" key={questionIdx}>

          {/* Timer ring */}
          {config.timed && !answered && (
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2" className="progress-ring-track" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" strokeWidth="2"
                    strokeDasharray="100" strokeDashoffset={100 - timerPercent}
                    className="progress-ring-fill"
                    style={{ stroke: timer <= 5 ? "#EF4444" : "var(--zumi-pink)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn("font-bold text-lg", timer <= 5 ? "text-red-400 animate-pulse" : "text-zumi")}>{timer}</span>
                </div>
              </div>
            </div>
          )}

          {/* Question */}
          <div className="card-base p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-2 py-0.5 rounded-full border border-zumi text-zumi-muted">{current.topic}</span>
            </div>
            <h2 className="text-xl font-bold text-zumi leading-relaxed">{current.question}</h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {current.options.map((option, i) => {
              const isCorrect = i === current.correct;
              const isSelected = i === selected;
              return (
                <button
                  key={i}
                  onClick={() => !answered && handleAnswer(i)}
                  disabled={answered}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border font-medium text-sm transition-all duration-200",
                    !answered && "hover:border-zumi-2 hover:bg-zumi-surface-2 hover:scale-[1.01]",
                    !answered && "card-base",
                    answered && isCorrect && "border-green-500 bg-green-500/15 text-green-300",
                    answered && isSelected && !isCorrect && "border-red-500 bg-red-500/15 text-red-300",
                    answered && !isSelected && !isCorrect && "card-base opacity-50",
                    "flex items-center gap-3"
                  )}
                >
                  <span className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                    !answered ? "bg-zumi-surface-2 border border-zumi text-zumi-muted" : "",
                    answered && isCorrect ? "bg-green-500 text-white" : "",
                    answered && isSelected && !isCorrect ? "bg-red-500 text-white" : "",
                  )}>
                    {answered && isCorrect ? "✓" : answered && isSelected && !isCorrect ? "✗" : ["A","B","C","D"][i]}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className={cn("p-4 rounded-2xl border animate-slide-up", selected === current.correct ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10")}>
              <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                {selected === current.correct ? <CheckCircle2 size={15} className="text-green-400" /> : <XCircle size={15} className="text-red-400" />}
                {selected === current.correct ? `${combo > 1 ? `🔥 ${combo}x Combo! ` : ""}Correct!` : "Not quite right"}
              </p>
              <p className="text-sm text-zumi-muted">{current.explanation}</p>
              <Button size="sm" onClick={nextQuestion} className="mt-3">
                {questionIdx + 1 >= questions.length ? "See results →" : "Next question →"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

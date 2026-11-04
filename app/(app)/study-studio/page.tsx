import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/app/topnav";
import Link from "next/link";
import { Plus, FileText, Zap } from "lucide-react";
import type { Profile, StudyDeck, Document } from "@/types/database";

export default async function StudyStudioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [profileRes, decksRes, docsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
    supabase.from("study_decks").select("*").eq("user_id", user!.id).order("updated_at", { ascending: false }),
    supabase.from("documents").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10),
  ]);

  const profile = profileRes.data as Profile | null;
  const decks = (decksRes.data as StudyDeck[] | null) ?? [];
  const docs = (docsRes.data as Document[] | null) ?? [];

  return (
    <>
      <TopNav profile={profile} pageTitle="AI Study Studio" />
      <div className="p-6 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-zumi" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              AI Study Studio
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-pink-500/15 text-pink-400 border border-pink-500/30">
                <Zap size={10} />AI Powered
              </span>
            </h2>
            <p className="text-zumi-muted mt-1">Upload your notes and let Zumi AI transform them into study decks, quizzes, and games.</p>
          </div>
          <Link href="/study-studio/upload">
            <button className="btn-primary px-5 py-2.5 text-sm rounded-xl flex items-center gap-2">
              <Plus size={16} />
              Upload Notes
            </button>
          </Link>
        </div>

        {/* Upload CTA if empty */}
        {docs.length === 0 && (
          <Link href="/study-studio/upload">
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-pink-500/30 p-12 text-center cursor-pointer hover:border-pink-500/60 transition-colors group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "radial-gradient(ellipse at center, rgba(255,95,126,0.05) 0%, transparent 70%)" }} />
              <div className="relative z-10">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📄</div>
                <h3 className="text-xl font-bold text-zumi mb-2">Upload your first document</h3>
                <p className="text-zumi-muted mb-4 max-w-sm mx-auto">
                  PDF, Word, PowerPoint, or plain text. Zumi AI will extract content and generate study materials instantly.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm">
                  <Plus size={14} />
                  Choose file
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Documents grid */}
        {docs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zumi-muted uppercase tracking-wide mb-4">My Documents ({docs.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc, i) => (
                <div key={doc.id} className="card-base card-hover p-4 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/20">
                      <FileText size={18} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-zumi truncate">{doc.filename}</p>
                      <p className="text-xs text-zumi-muted capitalize mt-0.5">{doc.processing_status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Decks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zumi-muted uppercase tracking-wide">Study Decks ({decks.length})</h3>
            <Link href="/study-studio/decks/new" className="text-xs text-zumi-pink hover:underline flex items-center gap-1">
              <Plus size={12} />Create manual deck
            </Link>
          </div>

          {decks.length === 0 ? (
            <div className="card-base p-10 text-center">
              <div className="text-4xl mb-3">🃏</div>
              <p className="text-zumi-muted text-sm">Upload a document and AI will generate your first study deck.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.map((deck, i) => (
                <Link key={deck.id} href={`/study-studio/decks/${deck.id}`}>
                  <div className="card-base card-hover p-5 h-full animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center mb-3 shadow-pink-sm">
                      <span className="text-white text-lg">📚</span>
                    </div>
                    <h4 className="font-semibold text-zumi mb-1 truncate">{deck.title}</h4>
                    <p className="text-xs text-zumi-muted mb-3">{deck.card_count} cards{deck.subject ? ` · ${deck.subject}` : ""}</p>
                    <div className="h-1.5 bg-zumi-surface-2 rounded-full overflow-hidden">
                      <div className="h-full xp-bar-fill rounded-full" style={{ width: "0%" }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

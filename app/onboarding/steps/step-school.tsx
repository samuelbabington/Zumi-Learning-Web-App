"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Building2, Globe, ChevronDown, ChevronUp, CheckCircle2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { normalizeSchoolName } from "@/lib/utils";
import type { OnboardingData } from "../page";
import type { School } from "@/types/database";

interface Props {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

type Mode = "search" | "submit";

const INSTITUTION_TYPES = [
  "University", "University College", "College", "Secondary School",
  "Polytechnic", "Technical Institute", "Professional School",
];

export function StepSchool({ data, update, onNext, onBack }: Props) {
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<School[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<School | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [submitForm, setSubmitForm] = useState({
    proposedName: "",
    country: "",
    city: "",
    institutionType: "University",
    website: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [possibleDuplicates, setPossibleDuplicates] = useState<School[]>([]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const { data: schools } = await supabase
        .from("schools")
        .select("*")
        .or(`official_name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%`)
        .eq("verification_status", "verified")
        .limit(10) as { data: School[] | null };
      setResults(schools ?? []);
      setSearching(false);
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, supabase]);

  const selectSchool = (school: School) => {
    setSelected(school);
    update({ schoolId: school.id });
    setQuery(school.official_name);
    setResults([]);
  };

  const checkDuplicates = async (name: string) => {
    const normalized = normalizeSchoolName(name);
    const { data: matches } = await supabase
      .from("schools")
      .select("*")
      .or(`normalized_name.ilike.%${normalized}%`)
      .limit(5) as { data: School[] | null };
    setPossibleDuplicates(matches ?? []);
  };

  const handleSubmitSchool = async () => {
    if (!submitForm.proposedName.trim() || !submitForm.country.trim() || !submitForm.city.trim()) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("school_submissions").insert({
        submitted_by: user.id,
        proposed_name: submitForm.proposedName,
        normalized_name: normalizeSchoolName(submitForm.proposedName),
        country: submitForm.country,
        city: submitForm.city,
        institution_type: submitForm.institutionType,
        website: submitForm.website || null,
        status: "pending",
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const skip = () => {
    update({ schoolId: null });
    onNext();
  };

  if (submitted) {
    return (
      <div className="card-base p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
          <CheckCircle2 size={28} className="text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-zumi" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          School submitted!
        </h2>
        <p className="text-sm text-zumi-muted">
          Your school is pending review by our team. We&apos;ll add it soon.
          You can continue without a school for now.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
          <Button onClick={skip} className="flex-1">Continue anyway</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-base p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zumi mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Find your school
        </h2>
        <p className="text-sm text-zumi-muted">
          Join your school&apos;s community and compete on the leaderboard.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-zumi-surface-2 border border-zumi">
        {(["search", "submit"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setPossibleDuplicates([]); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m ? "bg-zumi-surface text-zumi border border-zumi-2 shadow-sm" : "text-zumi-muted hover:text-zumi-2"
            }`}
          >
            {m === "search" ? "🔍 Search schools" : "➕ Add my school"}
          </button>
        ))}
      </div>

      {mode === "search" ? (
        <div className="space-y-3">
          <div className="relative">
            <Input
              placeholder="Search by name, city or country…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); update({ schoolId: null }); }}
              icon={<Search size={16} />}
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {results.length > 0 && !selected && (
            <div className="border border-zumi rounded-xl overflow-hidden bg-zumi-surface">
              {results.map((school) => (
                <button
                  key={school.id}
                  onClick={() => selectSchool(school)}
                  className="w-full px-4 py-3 text-left hover:bg-zumi-surface-2 transition-colors border-b border-zumi last:border-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-zumi">{school.official_name}</p>
                      <p className="text-xs text-zumi-muted mt-0.5">
                        <Globe size={10} className="inline mr-1" />{school.city}, {school.country}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="default">{school.institution_type}</Badge>
                      {school.verification_status === "verified" && (
                        <Badge variant="green">Verified</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-zumi">{selected.official_name}</p>
                  <p className="text-xs text-zumi-muted">{selected.city}, {selected.country}</p>
                </div>
                <button
                  onClick={() => { setSelected(null); update({ schoolId: null }); setQuery(""); }}
                  className="ml-auto text-xs text-zumi-muted hover:text-red-400 transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {query.length >= 2 && results.length === 0 && !searching && !selected && (
            <div className="p-4 rounded-xl border border-zumi bg-zumi-surface-2 text-center">
              <p className="text-sm text-zumi-muted mb-3">
                Can&apos;t find <strong className="text-zumi">&quot;{query}&quot;</strong>?
              </p>
              <button
                onClick={() => { setMode("submit"); setSubmitForm((p) => ({ ...p, proposedName: query })); }}
                className="text-sm text-zumi-pink font-medium hover:underline flex items-center gap-1 mx-auto"
              >
                <Plus size={14} />
                Add it to Zumi
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="Official institution name"
            placeholder="e.g. University of Ghana"
            value={submitForm.proposedName}
            onChange={(e) => {
              setSubmitForm((p) => ({ ...p, proposedName: e.target.value }));
              checkDuplicates(e.target.value);
            }}
            icon={<Building2 size={16} />}
          />

          {possibleDuplicates.length > 0 && (
            <div className="p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
              <p className="text-xs font-semibold text-yellow-400 mb-2">⚠️ Possible matches found — did you mean one of these?</p>
              {possibleDuplicates.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { selectSchool(s); setMode("search"); }}
                  className="w-full text-left p-2 rounded-lg hover:bg-yellow-500/10 transition-colors"
                >
                  <p className="text-sm font-medium text-zumi">{s.official_name}</p>
                  <p className="text-xs text-zumi-muted">{s.city}, {s.country}</p>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Country"
              placeholder="e.g. Ghana"
              value={submitForm.country}
              onChange={(e) => setSubmitForm((p) => ({ ...p, country: e.target.value }))}
            />
            <Input
              label="City"
              placeholder="e.g. Accra"
              value={submitForm.city}
              onChange={(e) => setSubmitForm((p) => ({ ...p, city: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zumi-2">Institution type</label>
            <select
              value={submitForm.institutionType}
              onChange={(e) => setSubmitForm((p) => ({ ...p, institutionType: e.target.value }))}
              className="input-base w-full px-3 py-2.5 text-sm appearance-none"
            >
              {INSTITUTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <Input
            label="Official website (optional)"
            type="url"
            placeholder="https://example.edu.gh"
            value={submitForm.website}
            onChange={(e) => setSubmitForm((p) => ({ ...p, website: e.target.value }))}
            icon={<Globe size={16} />}
          />

          <p className="text-xs text-zumi-muted">
            Submissions are reviewed by our team before being added. You&apos;ll be connected once approved.
          </p>

          <Button
            fullWidth
            onClick={handleSubmitSchool}
            loading={submitting}
            disabled={!submitForm.proposedName.trim() || !submitForm.country.trim() || !submitForm.city.trim()}
          >
            Submit school
          </Button>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button
          onClick={onNext}
          className="flex-1"
          disabled={mode === "search" && !selected && query.length > 0}
        >
          {selected ? "Continue" : "Skip for now"}
        </Button>
      </div>
    </div>
  );
}

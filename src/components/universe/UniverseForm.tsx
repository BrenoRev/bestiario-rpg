import { BookOpen, Castle, Hourglass, ImagePlus, Paintbrush, Sprout, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { UniverseInput } from "../../lib/types";
import { D20, StoredImage } from "../brand";
import { Button, Segmented, TextArea, TextInput } from "../ui";

export const GENRE_SUGGESTIONS = [
  "Fantasia medieval", "Fantasia sombria", "Alta fantasia", "Terror", "Terror cósmico",
  "Ficção científica", "Steampunk", "Pós-apocalíptico", "Mitologia", "Capa e espada", "Faroeste fantástico",
];

export function emptyUniverse(): UniverseInput {
  return { name: "", description: "", genre: "", setting: "", era: "", fantasy_level: "medio", rules: "", art_style: "", cover_path: null };
}

interface Props {
  value: UniverseInput;
  onChange: (v: UniverseInput) => void;
  coverFile: File | null;
  onCoverFile: (f: File | null) => void;
}

export function UniverseForm({ value, onChange, coverFile, onCoverFile }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);
  const set = <K extends keyof UniverseInput>(k: K, v: UniverseInput[K]) => onChange({ ...value, [k]: v });

  const pick = (f: File | null) => {
    onCoverFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const hasCover = coverFile || value.cover_path;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-5">
        <section className="card paper-surface parchment-form space-y-4">
          <h2 className="section-title">Identidade</h2>
          <TextInput label="Nome do universo" required maxLength={120} value={value.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex.: Reinos de Cinzaprata" />
          <div>
            <TextInput label="Gênero ou temática" list="genres" value={value.genre} onChange={(e) => set("genre", e.target.value)} placeholder="Ex.: Fantasia sombria" />
            <datalist id="genres">
              {GENRE_SUGGESTIONS.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
          <TextArea label="Descrição geral" value={value.description} onChange={(e) => set("description", e.target.value)} placeholder="Do que trata este mundo? Qual o tom da campanha?" />
        </section>

        <section className="card paper-surface parchment-form space-y-4">
          <h2 className="section-title">Ambientação</h2>
          <TextArea label="Ambientação" value={value.setting} onChange={(e) => set("setting", e.target.value)} placeholder="Geografia, culturas, conflitos, atmosfera…" />
          <TextInput label="Época ou período histórico" icon={<Hourglass className="size-5" />} value={value.era} onChange={(e) => set("era", e.target.value)} placeholder="Ex.: Era das Cinzas, 300 anos após a Queda" />
          <Segmented
            label="Nível de fantasia"
            help="nivelFantasia"
            value={value.fantasy_level}
            onChange={(v) => set("fantasy_level", v)}
            options={[
              { value: "baixo", label: "Baixo", hint: "Magia rara e sutil", icon: <Sprout className="size-4.5" /> },
              { value: "medio", label: "Médio", hint: "Magia presente, mas não onipresente", icon: <D20 className="size-4.5" /> },
              { value: "alto", label: "Alto", hint: "Magia abundante", icon: <Castle className="size-4.5" /> },
            ]}
          />
          <TextArea
            label="Regras ou características particulares"
            icon={<BookOpen className="size-5" />}
            help="regrasUniverso"
            value={value.rules}
            onChange={(e) => set("rules", e.target.value)}
            placeholder="Ex.: a magia arcana corrompe quem a usa; não existem dragões; mortos-vivos se erguem em noites sem lua."
          />
          <TextArea
            label="Estilo visual das ilustrações"
            icon={<Paintbrush className="size-5" />}
            help="estiloVisual"
            value={value.art_style}
            onChange={(e) => set("art_style", e.target.value)}
            className="min-h-16"
            hint="Usado na geração de imagens. Em branco: gravura de bestiário antigo."
            placeholder="Ex.: xilogravura em preto e vermelho; aquarela melancólica em tons frios."
          />
        </section>
        <p className="text-xs text-muted">Essas informações servem de contexto para a IA ao criar e adaptar criaturas deste universo.</p>
      </div>

      <aside className="min-w-0 space-y-3">
        <span className="label">Imagem de capa (opcional)</span>
        <div className="card overflow-hidden">
          <div className="aspect-[16/10] border-b border-line">
            {preview ? (
              <img src={preview} alt="Pré-visualização da capa" className="size-full object-cover" />
            ) : (
              <StoredImage path={value.cover_path} alt="Capa do universo" className="size-full" fallbackLabel="Sem capa" />
            )}
          </div>
          <div className="flex flex-wrap gap-2 p-3">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
            <Button size="sm" icon={<ImagePlus className="size-4" />} onClick={() => fileRef.current?.click()}>
              {hasCover ? "Trocar capa" : "Escolher capa"}
            </Button>
            {hasCover && (
              <Button
                size="sm"
                variant="ghost"
                icon={<Trash2 className="size-4" />}
                onClick={() => {
                  pick(null);
                  set("cover_path", null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                Remover
              </Button>
            )}
          </div>
        </div>
        <p className="hint">PNG, JPG ou WebP até 10 MB.</p>
      </aside>
    </div>
  );
}

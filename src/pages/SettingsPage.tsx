import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "../components/brand";
import { CREATIVITY_OPTIONS, DETAIL_OPTIONS } from "../components/creature/AIAssist";
import { ConfirmDialog } from "../components/Modal";
import { errorMessage, useToast } from "../components/Toast";
import { Button, PageHeader, PageLoader, Segmented, Select, TextInput, Toggle } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { keys, useProfile } from "../hooks/queries";
import { updateProfile } from "../lib/api";
import type { Preferences } from "../lib/types";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const qc = useQueryClient();
  const toast = useToast();
  const [name, setName] = useState("");
  const [prefs, setPrefs] = useState<Required<Preferences>>({ creativity: "equilibrado", detail: "padrao", alternatives: 2, useUniverseContext: true });
  const [saving, setSaving] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name ?? "");
    setPrefs((p) => ({ ...p, ...profile.preferences }));
  }, [profile]);

  if (isLoading) return <PageLoader />;

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({ display_name: name.trim() || null, preferences: prefs });
      qc.setQueryData(keys.profile, updated);
      toast.success("Configurações salvas.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const setPref = <K extends keyof Preferences>(k: K, v: Required<Preferences>[K]) => setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Sua conta e as preferências padrão do assistente de IA."
        actions={
          <Button variant="primary" icon={<Save className="size-4" />} onClick={save} loading={saving}>
            Salvar
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <h2 className="section-title mb-4">Conta</h2>
          <div className="mb-5 flex items-center gap-4">
            <Avatar url={profile?.avatar_url ?? (user?.user_metadata?.avatar_url as string | undefined)} name={name || user?.email} className="size-14" />
            <div className="min-w-0">
              <div className="truncate font-display text-xl font-semibold">{name || "Sem nome"}</div>
              <div className="truncate text-sm text-muted">{user?.email}</div>
            </div>
          </div>
          <TextInput label="Nome de exibição" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-line bg-parchment px-4 py-3 text-xs leading-relaxed text-ink-soft">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-moss" />
            <p>
              Você entra com e-mail e senha. Seus universos, criaturas e imagens ficam protegidos por políticas de acesso no banco de dados: só a sua conta consegue vê-los ou alterá-los.
            </p>
          </div>
          <Button className="mt-5" variant="danger" icon={<LogOut className="size-4" />} onClick={() => setConfirmOut(true)}>
            Sair da conta
          </Button>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="section-title mb-1">Assistente de IA</h2>
          <p className="mb-5 text-xs text-muted">Valores iniciais em “Criar com IA”. Você pode mudá-los a cada pedido.</p>
          <div className="space-y-5">
            <Segmented label="Criatividade padrão" value={prefs.creativity} onChange={(v) => setPref("creativity", v)} options={CREATIVITY_OPTIONS} />
            <Segmented label="Detalhamento padrão" value={prefs.detail} onChange={(v) => setPref("detail", v)} options={DETAIL_OPTIONS} />
            <Select label="Propostas por geração" value={String(prefs.alternatives)} onChange={(e) => setPref("alternatives", Number(e.target.value))}>
              <option value="1">1 proposta</option>
              <option value="2">2 propostas</option>
              <option value="3">3 propostas</option>
            </Select>
            <Toggle
              checked={prefs.useUniverseContext}
              onChange={(v) => setPref("useUniverseContext", v)}
              label="Usar contexto do universo por padrão"
              description="A IA considera ambientação, época, nível de fantasia e regras do mundo."
            />
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmOut}
        title="Sair da conta?"
        message="Você precisará entrar novamente com seu e-mail e senha para acessar seus mundos."
        confirmLabel="Sair"
        onConfirm={() => void signOut()}
        onClose={() => setConfirmOut(false)}
      />
    </>
  );
}

// Guia de boas-vindas: explica o Bestiario em poucos passos para quem nunca jogou RPG.
import { ArrowLeft, ArrowRight, BookOpen, Globe2, HelpCircle, PenLine, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { Button, cx } from "../ui";

const STEPS: { icon: ReactNode; title: string; text: ReactNode }[] = [
  {
    icon: <BookOpen className="size-7" />,
    title: "Bem-vindo ao Bestiario",
    text: (
      <>
        Um caderno para criar e organizar as <strong>criaturas e monstros</strong> das suas histórias e jogos de RPG.
        <br />
        <br />
        Você <strong>não precisa conhecer as regras</strong>: cada termo técnico tem uma explicação, e a IA ajuda a preencher o que for difícil.
      </>
    ),
  },
  {
    icon: <Globe2 className="size-7" />,
    title: "1. Crie um universo",
    text: (
      <>
        O universo é o <strong>mundo da sua história</strong>: um reino medieval, uma estação espacial, uma cidade assombrada.
        <br />
        <br />
        Descreva o clima, a época e o que é possível nele. Tudo o que você criar ali vai combinar com esse mundo.
      </>
    ),
  },
  {
    icon: <Sparkles className="size-7" />,
    title: "2. Crie criaturas com a IA",
    text: (
      <>
        Em <strong>Criar com IA</strong>, descreva sua ideia com as suas palavras, como “um lobo feito de fumaça que caça à noite”.
        <br />
        <br />
        A IA monta a ficha completa, com números e história, e você <strong>escolhe, ajusta ou descarta</strong>. Nada é salvo sem a sua confirmação.
      </>
    ),
  },
  {
    icon: <PenLine className="size-7" />,
    title: "3. Ajuste do seu jeito",
    text: (
      <>
        Toda ficha pode ser editada à mão. Os ícones <HelpCircle className="inline size-4 align-text-bottom text-wine" /> ao lado dos campos explicam termos como ND, CA e PV.
        <br />
        <br />
        Dentro da ficha, o <strong>Assistente de IA</strong> sugere melhorias e mostra exatamente o que mudaria antes de aplicar.
      </>
    ),
  },
  {
    icon: <HelpCircle className="size-7" />,
    title: "Ajuda sempre à mão",
    text: (
      <>
        O botão <HelpCircle className="inline size-4 align-text-bottom text-wine" /> no topo da tela reabre este guia e o <strong>glossário de termos de RPG</strong>.
        <br />
        <br />
        Já conhece D&amp;D? Você pode esconder as dicas em <strong>Configurações</strong>.
      </>
    ),
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** Ação final: quando o usuário ainda não tem universo, leva direto a criar o primeiro. */
  finalAction: { label: string; onClick: () => void };
}

export function WelcomeGuide({ open, onClose, finalAction }: Props) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Guia rápido"
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button variant="ghost" onClick={onClose}>
            {last ? "Fechar" : "Pular"}
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button icon={<ArrowLeft className="size-4" />} onClick={() => setStep((s) => s - 1)} aria-label="Passo anterior">
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            )}
            {last ? (
              <Button variant="primary" onClick={finalAction.onClick}>
                {finalAction.label}
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
                Próximo <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col items-center px-1 py-2 text-center" aria-live="polite">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-wine-line bg-wine-soft text-wine">{current.icon}</div>
        <h3 className="text-2xl font-semibold">{current.title}</h3>
        <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">{current.text}</p>
        <div className="mt-6 flex gap-1.5" aria-label={`Passo ${step + 1} de ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para o passo ${i + 1}`}
              onClick={() => setStep(i)}
              className="flex size-7 cursor-pointer items-center justify-center"
            >
              <span className={cx("block h-2 rounded-full transition-all", i === step ? "w-6 bg-wine" : "w-2 bg-line-strong")} />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

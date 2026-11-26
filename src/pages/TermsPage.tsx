import { Link } from "react-router";
import { LegalDocument, LegalSection } from "../components/LegalDocument";

export function TermsPage() {
  return (
    <LegalDocument
      title="Termos de uso"
      updated="26 de novembro de 2026"
      intro={<p>Ao criar uma conta ou usar o Bestiário, você concorda com estes termos. Eles são curtos e diretos.</p>}
    >
      <LegalSection title="1. O serviço">
        <p>
          O Bestiário é um projeto acadêmico, gratuito e em fase de testes. Ele é oferecido “como está”: pode ficar fora do ar, mudar ou ser encerrado a qualquer momento, e não há
          garantia de disponibilidade nem de preservação dos dados. Guarde uma cópia do que for importante para você.
        </p>
      </LegalSection>

      <LegalSection title="2. Sua conta">
        <p>Você é responsável pelo acesso à sua conta e pelo que for feito com ela. Use um e-mail seu e uma senha que só você conheça.</p>
      </LegalSection>

      <LegalSection title="3. Seu conteúdo">
        <p>
          Universos, criaturas, textos e imagens que você cria continuam sendo seus. Você nos autoriza apenas a guardá-los e processá-los para o app funcionar. Não envie conteúdo
          ilegal, ofensivo, que viole direitos de outras pessoas ou dados pessoais de terceiros.
        </p>
      </LegalSection>

      <LegalSection title="4. Sugestões da inteligência artificial">
        <p>
          O assistente de IA propõe fichas, textos e ilustrações, e você decide o que aproveitar. As sugestões podem conter erros, desequilíbrios de regras ou semelhanças com obras
          existentes: revise antes de usar. O uso da IA tem um limite diário por conta.
        </p>
      </LegalSection>

      <LegalSection title="5. Uso aceitável">
        <ul>
          <li>Não tente acessar dados de outras pessoas nem burlar os limites do app.</li>
          <li>Não sobrecarregue o serviço nem use automações para fazer pedidos em massa.</li>
          <li>Não use o app para fins ilegais ou para gerar conteúdo que prejudique outras pessoas.</li>
        </ul>
        <p>Contas que descumprirem estes termos podem ser suspensas ou excluídas.</p>
      </LegalSection>

      <LegalSection title="6. Marcas">
        <p>
          As fichas seguem o formato de Dungeons &amp; Dragons 5ª edição. Dungeons &amp; Dragons é marca da Wizards of the Coast; o Bestiário não é afiliado nem endossado por ela.
        </p>
      </LegalSection>

      <LegalSection title="7. Responsabilidade">
        <p>Na medida permitida pela lei, o projeto não se responsabiliza por perdas de dados, interrupções ou pelo uso que você fizer do conteúdo gerado no app.</p>
      </LegalSection>

      <LegalSection title="8. Privacidade">
        <p>
          O tratamento dos seus dados está descrito na{" "}
          <Link to="/privacidade" className="font-semibold text-wine underline underline-offset-2">
            política de privacidade
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Mudanças e lei aplicável">
        <p>Estes termos podem ser atualizados; a data no topo indica a versão atual. Eles seguem a legislação brasileira.</p>
      </LegalSection>
    </LegalDocument>
  );
}

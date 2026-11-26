import { LegalDocument, LegalSection } from "../components/LegalDocument";

export function PrivacyPage() {
  return (
    <LegalDocument
      title="Política de privacidade"
      updated="26 de novembro de 2026"
      intro={
        <p>
          O Bestiário é um projeto acadêmico, gratuito e sem fins comerciais, feito para mestres de RPG organizarem criaturas e universos de campanha. Esta página explica quais dados o
          app guarda, para quê e o que você pode fazer com eles, em linha com a Lei Geral de Proteção de Dados (LGPD).
        </p>
      }
    >
      <LegalSection title="1. Dados que guardamos">
        <ul>
          <li>
            <strong>Dados da conta:</strong> e-mail e nome. Se você entra com o Google, recebemos também o nome e a foto do seu perfil Google. Nunca temos acesso à sua senha do
            Google.
          </li>
          <li>
            <strong>Senha do cadastro por e-mail:</strong> é guardada de forma criptografada pelo serviço de autenticação; ninguém do projeto consegue lê-la.
          </li>
          <li>
            <strong>O que você cria:</strong> universos, fichas de criaturas, notas, preferências e imagens que você envia ou gera.
          </li>
          <li>
            <strong>Uso da IA:</strong> data e tipo de cada pedido ao assistente, só para aplicar o limite diário de uso.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Para que usamos">
        <p>
          Só para o app funcionar: permitir que você entre, mostrar e guardar o seu conteúdo, gerar as sugestões e ilustrações que você pedir e limitar o uso da IA. Não usamos seus
          dados para anúncios, não montamos perfis de marketing e não vendemos nem compartilhamos dados com terceiros para outros fins.
        </p>
      </LegalSection>

      <LegalSection title="3. Serviços que ajudam a operar o app">
        <ul>
          <li>
            <strong>Supabase:</strong> hospeda o banco de dados, os arquivos e o login.
          </li>
          <li>
            <strong>Vercel:</strong> hospeda o site.
          </li>
          <li>
            <strong>Google:</strong> faz o login, se você escolher entrar com a sua conta Google.
          </li>
          <li>
            <strong>OpenAI e Anthropic:</strong> geram as sugestões e as ilustrações. Só quando você usa um recurso de IA, enviamos o necessário para o pedido: a sua descrição, a
            ficha em questão e o contexto do universo. Suas notas pessoais não são enviadas.
          </li>
        </ul>
        <p>Cada um desses serviços tem a própria política de privacidade.</p>
      </LegalSection>

      <LegalSection title="4. Armazenamento no navegador">
        <p>
          O app guarda no seu navegador apenas o necessário para manter você conectado e lembrar rascunhos da tela de criação. Não usamos cookies de rastreamento nem ferramentas de
          publicidade.
        </p>
      </LegalSection>

      <LegalSection title="5. Segurança">
        <p>
          Cada conta só consegue ver e alterar os próprios dados, regra aplicada no próprio banco de dados. Os arquivos ficam em armazenamento privado e as conexões usam HTTPS.
          Nenhum sistema é totalmente imune a falhas, mas tratamos seus dados com cuidado.
        </p>
      </LegalSection>

      <LegalSection title="6. Seus direitos">
        <p>
          Você pode consultar, corrigir e excluir o seu conteúdo a qualquer momento pelo próprio app. Para excluir a conta inteira ou pedir uma cópia dos seus dados, entre em contato
          pelo endereço no fim desta página.
        </p>
      </LegalSection>

      <LegalSection title="7. Por quanto tempo">
        <p>
          Os dados ficam guardados enquanto a sua conta existir. Por ser um projeto acadêmico, o app pode ser encerrado ao fim do período letivo; nesse caso, os dados serão apagados.
        </p>
      </LegalSection>

      <LegalSection title="8. Mudanças nesta política">
        <p>Se esta política mudar, a data no topo da página será atualizada.</p>
      </LegalSection>
    </LegalDocument>
  );
}

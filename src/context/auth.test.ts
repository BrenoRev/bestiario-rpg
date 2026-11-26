import { describe, expect, it } from "vitest";
import { oauthReturnProblem, passwordProblem } from "./AuthContext";

describe("passwordProblem (mesma política do Supabase Auth)", () => {
  it("aceita 6+ caracteres com letras e números", () => {
    expect(passwordProblem("abc123")).toBeNull();
    expect(passwordProblem("Mestre2026")).toBeNull();
  });

  it("recusa senha curta", () => {
    expect(passwordProblem("ab12")).toContain("pelo menos 6");
  });

  it("recusa senha só com letras ou só com números", () => {
    expect(passwordProblem("abcdefgh")).toContain("letras e números");
    expect(passwordProblem("12345678")).toContain("letras e números");
  });
});

describe("oauthReturnProblem (volta do login com Google)", () => {
  it("sem nada na URL não há erro", () => {
    expect(oauthReturnProblem("", "", false)).toBeNull();
    expect(oauthReturnProblem("?outra=coisa", "", true)).toBeNull();
  });

  it("código trocado com sucesso não é erro", () => {
    expect(oauthReturnProblem("?code=abc", "", true)).toBeNull();
  });

  it("código que sobrou sem sessão é falha (vencido ou outro navegador)", () => {
    expect(oauthReturnProblem("?code=abc", "", false)).toContain("mesmo navegador");
  });

  it("cancelar no Google vira aviso de cancelamento, na query ou no fragmento", () => {
    expect(oauthReturnProblem("?error=access_denied&error_description=x", "", false)).toBe("Login com Google cancelado.");
    expect(oauthReturnProblem("", "#error=access_denied", false)).toBe("Login com Google cancelado.");
  });

  it("cadastro desativado tem mensagem própria", () => {
    expect(oauthReturnProblem("?error=access_denied&error_code=signup_disabled", "", false)).toContain("desativados");
  });

  it("outros erros viram mensagem genérica, sem repassar o texto do servidor", () => {
    const msg = oauthReturnProblem("?error=server_error&error_description=Database+error+saving+new+user", "", false);
    expect(msg).toBe("Não foi possível entrar com o Google. Tente novamente.");
  });
});

import { describe, expect, it } from "vitest";
import { passwordProblem } from "./AuthContext";

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

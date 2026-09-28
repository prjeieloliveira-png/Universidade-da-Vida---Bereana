/**
 * Ordena uma lista por nome (pt-BR, ignora acentos/maiúsculas) — usado em
 * toda tela que lista pessoas/itens com um botão de ordenação alfabética
 * (Inscrições, Chamada, Porta, Liderança, Equipes, Usuários).
 */
export function sortByName<T>(items: T[], getName: (item: T) => string): T[] {
  return [...items].sort((a, b) => getName(a).localeCompare(getName(b), 'pt-BR', { sensitivity: 'base' }));
}

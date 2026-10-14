/**
 * Ordena uma lista por nome (pt-BR, ignora acentos/maiúsculas) — usado em
 * toda tela que lista pessoas/itens com um botão de ordenação alfabética
 * (Inscrições, Chamada, Porta, Liderança, Equipes, Usuários).
 */
export function sortByName<T>(items: T[], getName: (item: T) => string): T[] {
  return [...items].sort((a, b) => {
    const nameA = (getName(a) || '').trim();
    const nameB = (getName(b) || '').trim();
    return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
  });
}

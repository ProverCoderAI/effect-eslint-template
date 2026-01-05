// CHANGE: extract pure enum-type predicate for FC/IS split
// WHY: keep detection logic in CORE, ESLint wiring in SHELL
// QUOTE(TZ): "Все файлы должны лежать внутри app (либо rules), shell, core"
// REF: user request 2
// SOURCE: n/a
// FORMAT THEOREM: forall t: Type, isEnumType(t) -> hasEnumSymbol(t)
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: union/intersection handled by structural recursion
// COMPLEXITY: O(n)/O(1)
import * as ts from "typescript"

const isEnumSymbol = (symbol: ts.Symbol | undefined): boolean =>
  symbol ? (symbol.flags & ts.SymbolFlags.Enum) !== 0 : false

export const isEnumType = (type: ts.Type): boolean => {
  if (type.isUnion()) {
    return type.types.some((member) => isEnumType(member))
  }

  if (type.isIntersection()) {
    return type.types.some((member) => isEnumType(member))
  }

  return isEnumSymbol(type.getSymbol()) || isEnumSymbol(type.aliasSymbol)
}

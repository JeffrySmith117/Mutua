---
name: frontend-design
description: Especialista em design minimalista contemporâneo, sistemas de design com tipografia editorial, componentes em pílula e acabamento de alto nível (estilo Landra/Craft) para React e CSS.
---

# Skill: Frontend Design Minimalista

Ao propor, implementar ou refatorar interfaces, componentes ou páginas neste projeto, você deve seguir este guia rigoroso de craft visual.

## 1. Princípios de Craft Visual

- **Contraste & Limpeza**: Fundo claro e puro (`#FAFAFA`), cards brancos com bordas *hairline* de 1px (`rgba(15, 23, 42, 0.08)`).
- **Sem poluição**: Jamais adicione sombras escuras ou difusas (`box-shadow: 0 10px 30px rgba(0,0,0,0.2)` é proibido). Substitua por contraste limpo e bordas elegantes.
- **Formato Pílula (*Pill Shape*)**:
  - Botões de ação, chips de filtros, tags de status e campos de busca principais usam `border-radius: 100px`.
  - No hover de botões: sutil elevação (`transform: translateY(-1px)` ou `-2px`) com transição `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Tipografia Expressiva**:
  - Use `Inter Tight` ou `Inter`.
  - Títulos principais com tracking fechado (`letter-spacing: -0.04em` a `-0.05em`) e line-height compacto (`0.95` a `1.1`).
  - Micro-rótulos e tags com tracking expandido (`letter-spacing: 0.04em`), uppercase e `font-size: 11px` ou `12px`.
  - Números e métricas com `font-variant-numeric: tabular-nums`.

## 2. Indicadores e Tags com Dot

- Para status (Disponível, Em Uso, Manutenção, Confirmada), utilize pílulas sutis com um ponto indicador (*dot*):
  ```html
  <span class="status-pill status-pill--success">
    <span class="status-dot"></span>
    Disponível
  </span>
  ```

## 3. Ordem de Execução para Redesign

Sempre respeite as etapas para manter estabilidade e coerência:
1. **Fundação**: Ajustar variáveis em `src/index.css` (tokens de cores, raios, fontes e espaçamentos).
2. **Componentes**: Botões (`.btn`, `.btn-pill`), cards (`.editorial-card`), badges, inputs de busca e navegação.
3. **Página Principal (Dashboard)**: Refatorar seção por seção (Hero com tipografia expressiva e busca, grade de ambientes/equipamentos e rodapé dock).
4. **Demais Páginas**: Ambientes, Equipamentos, Minhas Reservas e Painel Administrativo.
5. **Mobile & Acessibilidade**: Navegação responsiva, alvos de toque adequados (mínimo 44px) e suporte a `prefers-reduced-motion`.

## 4. Validação Contínua

Sempre execute `npm run build` no diretório `frontend` para garantir que TypeScript e Vite continuam compilando sem erros antes de concluir qualquer etapa.


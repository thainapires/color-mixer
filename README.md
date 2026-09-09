# Color Blend Lab

Aplicação web para misturar duas cores e explorar o resultado em tempo real. O projeto permite ajustar a proporção entre duas cores HEX, copiar formatos úteis e descobrir variações que ajudam na criação de paletas.

## Funcionalidades

- Seleção de duas cores com input visual.
- Mistura em tempo real com controle percentual entre `Color A` e `Color B`.
- Resultado disponível em `HEX`, `RGB` e `HSL`.
- Cópia rápida do resultado para a área de transferência.
- Exportação em formatos `CSS`, `Tailwind` e `JSON`.
- Cálculo de contraste para texto claro e escuro.
- Escala tonal gerada a partir da cor resultante.
- Paletas derivadas: complementar, análoga e triádica.
- Histórico das misturas recentes com opção de fixar combinações.
- Persistência local da última mistura, histórico e modo compacto via `localStorage`.
- Atalhos de teclado:
  - `R`: gerar cores aleatórias.
  - `S`: inverter as cores.
  - `C`: copiar o resultado.
  - `M`: alternar modo compacto.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- lucide-react
- motion

## Como Rodar

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Gere a build de produção:

```bash
npm run build
```

Visualize a build localmente:

```bash
npm run preview
```

Execute o lint:

```bash
npm run lint
```

## Estrutura

```text
src/
  components/
    ColorMixer.tsx    # Tela principal e estado da mistura
    ColorPicker.tsx   # Seleção individual de cor
    ColorResult.tsx   # Resultado, formatos, contraste e exportação
    ui/               # Componentes base do shadcn/ui
  lib/
    color.ts          # Funções de conversão, mistura e geração de paletas
  pages/
    Index.tsx         # Página inicial
    NotFound.tsx      # Página 404
  App.tsx             # Rotas da aplicação
  main.tsx            # Entrada do React
```

## Observações

As cores devem estar no formato hexadecimal de 6 dígitos, com ou sem `#`. Exemplos válidos: `#823A3A` e `4040A0`.

# Stardom · Beta (etapa 1)

## Testar no computador
1. Descompacte a pasta.
2. Dê dois cliques em `index.html` (abre no navegador).
3. Crie uma conta em **Register**, depois entre em **Log in**.

## Publicar no GitHub Pages
1. Em github.com, clique em **New repository** → nome `stardom-beta` → **Public** → **Create repository**.
2. Clique em **uploading an existing file** e arraste **o conteúdo** da pasta (index.html, css, js, assets).
3. Clique em **Commit changes**.
4. Vá em **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main** / **(root)** → **Save**.
5. Em 1–3 minutos o link aparece no topo dessa página: `https://SEU-USUARIO.github.io/stardom-beta/`.

## Atualizar depois
Suba os arquivos novos no mesmo repositório (Add file → Upload files) substituindo os antigos.

## Estrutura
- `js/engine/` — regras e dados do jogo (sem interface). Vai para um servidor no futuro.
- `js/ui/` — telas.
- `css/style.css` — design system.
- `assets/` — imagens.

Teste fechado: os dados ficam salvos só no navegador de cada pessoa. "Reset test data" (menu do usuário) apaga tudo.

## Etapa 2 — o que testar
- Criar personagem (nome, idade 16–25, cidade inicial). Até 5 por conta; troca no menu do usuário.
- Gastar XP em atributos e habilidades (5 XP por nível, 26 níveis).
- Viajar (Cities & travel ou Agenda). A viagem ocupa a agenda.
- Botão do relógio no topo = **Test controls**: avançar +1 hora / +1 dia / +1 semana, marcar desafios semanais e criar compromissos de teste.
- Erros de agenda: E-AGENDA-01, E-CIDADE-01, E-VIAGEM-01.

Valores provisórios (XP e Starcoins iniciais, densidade das cidades, horário do XP semanal) ficam em `js/engine/config.js` e `js/engine/world.js`.

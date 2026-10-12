# Notes frontend

Minimal React application built with Vite.

## Commands

- `pnpm install` installs dependencies.
- `pnpm dev` starts the development server.
- `pnpm build` creates a production build in `dist/`.
- `pnpm lint` checks the source with Oxlint.
- `pnpm preview` previews the production build.

## Current structure

- `src/main.jsx`: React entry point.
- `src/App.jsx`: root application component.
- `src/index.css`: global styles.
- `index.html`: HTML entry point.
- `vite.config.js`: Vite configuration.
- `.oxlintrc.json`: lint configuration.
- `package.json` and `pnpm-lock.yaml`: dependencies and scripts.
- `.gitignore`: excludes dependencies, build output, and local files.

The starter demo assets and styles have been removed.

## Proposed architecture

As outlined in the "Explain frontend backend integration" chat, future implementation belongs in:

```text
src/
  app/store.js
  services/api.js
  features/auth/
    authSlice.js
    LoginPage.jsx
    RegisterPage.jsx
    SessionGate.jsx
  features/notes/
    NotesPage.jsx
    NoteForm.jsx
    NoteCard.jsx
  components/Header.jsx
  App.jsx
  main.jsx
  index.css
```

These feature files will be added when implementing authentication and notes. Redux Toolkit and React Redux are not installed yet. Keep global styles in `index.css`; the demo-only `App.css` is unnecessary.

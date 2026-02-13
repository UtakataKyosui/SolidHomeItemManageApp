// @refresh reload
import { StartServer, createHandler } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#16a34a" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="InitHome" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="manifest" href="/manifest.webmanifest" />
          {/* apple-touch-icon requires PNG; SVG is ignored by iOS Safari */}
          <script innerHTML={`
            (function() {
              try {
                var localValue = localStorage.getItem('theme');
                var systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = (localValue === 'light' || localValue === 'dark') ? localValue : (systemDarkMode ? 'dark' : 'light');
                var root = document.documentElement;
                root.classList.remove(theme === 'dark' ? 'light' : 'dark');
                root.classList.add(theme);
                root.style.colorScheme = theme;
                root.dataset.theme = theme;
              } catch (e) {}
            })()
          `} />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));

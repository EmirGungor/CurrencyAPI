import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./theme/ThemeProvider";
import { I18nProvider } from "./i18n";
import { RouteProvider } from "./lib/router";
import { SearchProvider } from "./lib/search";
import { SelectionProvider } from "./lib/selection";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <I18nProvider>
      <RouteProvider>
        <SelectionProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </SelectionProvider>
      </RouteProvider>
    </I18nProvider>
  </ThemeProvider>
);

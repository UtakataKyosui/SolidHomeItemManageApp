import {
    createContext,
    useContext,
    createSignal,
    createEffect,
    onMount,
    JSX,
    Accessor
} from "solid-js";

type ColorMode = "light" | "dark";

interface ThemeProviderContext {
    colorMode: Accessor<ColorMode>;
    setColorMode: (mode: ColorMode) => void;
    toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeProviderContext>();

export function ThemeProvider(props: { children: JSX.Element }) {
    const [colorMode, setColorMode] = createSignal<ColorMode>(
        (() => {
            if (typeof window === "undefined") {
                return "light";
            }
            const saved = localStorage.getItem("theme");
            if (saved === "light" || saved === "dark") {
                return saved;
            }
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        })()
    );

    createEffect(() => {
        const mode = colorMode();
        const root = document.documentElement;
        const isDark = mode === "dark";

        root.classList.toggle("dark", isDark);
        root.classList.toggle("light", !isDark);
        root.style.colorScheme = mode;
        root.dataset.theme = mode;

        localStorage.setItem("theme", mode);
    });

    const toggleColorMode = () => {
        setColorMode((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ colorMode, setColorMode, toggleColorMode }}>
            {props.children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

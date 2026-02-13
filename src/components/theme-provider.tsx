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
    const [colorMode, setColorMode] = createSignal<ColorMode>("light");

    onMount(() => {
        const saved = localStorage.getItem("theme") as ColorMode;
        const initial = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        setColorMode(initial);
    });

    createEffect(() => {
        const mode = colorMode();
        const root = document.documentElement;

        if (mode === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
            root.style.colorScheme = "dark";
            root.dataset.theme = "dark";
        } else {
            root.classList.add("light");
            root.classList.remove("dark");
            root.style.colorScheme = "light";
            root.dataset.theme = "light";
        }
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

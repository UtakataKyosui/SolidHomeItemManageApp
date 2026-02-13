import { IconButton } from "./icon-button";
import { Moon, Sun } from "lucide-solid";
import { useTheme } from "../theme-provider";
import { Show } from "solid-js";

export const ThemeToggle = () => {
    const { colorMode, toggleColorMode } = useTheme();

    return (
        <IconButton variant="plain" size="sm" onClick={toggleColorMode} aria-label="Toggle theme">
            <Show when={colorMode() === "dark"} fallback={<Sun size={20} />}>
                <Moon size={20} />
            </Show>
        </IconButton>
    );
};

import type { ComponentProps } from "solid-js";
import { css, cx } from "styled-system/css";
import { splitCssProps } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";

// Default props via defaultProps is not supported in functional components in the same way,
// but we can rely on Panda's pattern defaults or just export a pre-configured one.
// Let's use the layout pattern from Panda if available, or just custom styled.
// The plan specified: width: { base: "95%", md: "80%" }, margin: "0 auto"

export interface ContainerProps extends HTMLStyledProps<"div"> { }

export const PageContainer = (props: ContainerProps) => {
    const [cssProps, restProps] = splitCssProps(props);
    return (
        <div
            class={cx(
                css({
                    width: { base: "95%", md: "80%" },
                    margin: "0 auto",
                    py: "6",
                }),
                css(cssProps)
            )}
            {...restProps}
        />
    );
};

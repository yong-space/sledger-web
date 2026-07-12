import { useRef } from 'react';

// MUI's Modal (behind Dialog, Menu, Select, Drawer, ...) aria-hides #root in
// an effect that runs before the portal contents exist. Whatever the user
// interacted with is still focused inside #root at that instant, so Chrome
// blocks the aria-hidden and logs "Blocked aria-hidden on an element because
// its descendant retained focus". Blurring the active element before the
// modal mounts keeps focus out of #root in time.
export const blurActiveElement = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
};

// Call from a component that renders a modal with a controlled `open` prop.
// Runs during the same render that flips open to true, which always precedes
// the modal's aria-hidden effect.
export const useBlurOnOpen = (open) => {
    const wasOpen = useRef(false);
    if (open && !wasOpen.current) {
        blurActiveElement();
    }
    wasOpen.current = open;
};

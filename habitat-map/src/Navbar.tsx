import { HabitatKeyMenu } from "../lib/key";

type MapTopNavProps = {
    brand?: string;
    onAbout?: () => void; // or use <a href="/about" />
    allCodes: string[];
    PHASE1_COLORS: Record<string, string>;
    PHASE1_NAMES: Record<string, string>;
    hashColor: (c: string) => string;
};

export const pill = `
relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-md font-medium
bg-slate-900 text-white
shadow-xl shadow-black/30
ring-1 ring-white/20
outline outline-1 outline-black/20
backdrop-blur-sm
before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-black/20 before:blur-md
hover:bg-slate-800 active:scale-[0.97]
transition-all
`;


export default function MapTopNav({
    brand = "LandApp",
    onAbout,
    allCodes,
    PHASE1_COLORS,
    PHASE1_NAMES,
    hashColor,
}: MapTopNavProps) {
    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 p-4">
            <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
                {/* Left: Logo */}
                <div className="pointer-events-auto">
                    <a
                        href="/"
                        className={pill}
                        aria-label="Home"
                    >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                            {brand.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="hidden sm:inline">{brand}</span>
                    </a>
                </div>

                {/* Right: Pills cluster */}
                <div className="pointer-events-auto flex items-center gap-2">
                    {/* About pill */}
                    <button
                        type="button"
                        onClick={onAbout}
                        className={pill}
                    >
                        About
                    </button>

                    {/* Key control (popover) */}
                    <HabitatKeyMenu
                        allCodes={allCodes}
                        PHASE1_COLORS={PHASE1_COLORS}
                        PHASE1_NAMES={PHASE1_NAMES}
                        hashColor={hashColor}
                    />
                </div>
            </div>
        </div>
    );
}
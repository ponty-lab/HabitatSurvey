import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";


type Props = {
    allCodes: string[];
    PHASE1_COLORS: Record<string, string>;
    PHASE1_NAMES: Record<string, string>;
    hashColor: (c: string) => string;
};

export function HabitatKeyMenu({
    allCodes,
    PHASE1_COLORS,
    PHASE1_NAMES,
    hashColor,
}: Props) {
    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    {/* Button (pill) */}
                    <div className="relative flex items-center justify-end">
                        {/* Optional label pill — hidden when open */}
                        <div
                            className={[
                                "hidden sm:inline-flex items-center gap-2 rounded-full",
                                "bg-emerald-700 text-white ",
                                "shadow-xl shadow-emerald-900/40 ring-1 ring-white/20",
                                "pl-4 pr-12 py-2 text-md font-medium",
                                "transition-all duration-150",
                                open ? "opacity-0 scale-95 pointer-events-none" : "opacity-100",
                            ].join(" ")}
                        >
                            Habitat Key
                        </div>

                        <Popover.Button
                            aria-label={open ? "Close habitat key" : "Open habitat key"}
                            className="
    absolute right-0 top-1/2 -translate-y-1/2
    h-10 w-10 rounded-full
    bg-emerald-600 text-white
    shadow-xl shadow-emerald-900/40
    ring-1 ring-white/20
    flex items-center justify-center
    hover:bg-emerald-500 active:scale-[0.95]
    transition
  "
                        >
                            {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                        </Popover.Button>
                    </div>

                    {/* Panel */}
                    <Transition
                        as={Fragment}
                        show={open}
                        enter="transition ease-out duration-150"
                        enterFrom="opacity-0 translate-y-1 scale-[0.98]"
                        enterTo="opacity-100 translate-y-0 scale-100"
                        leave="transition ease-in duration-120"
                        leaveFrom="opacity-100 translate-y-0 scale-100"
                        leaveTo="opacity-0 translate-y-1 scale-[0.98]"
                    >
                        <Popover.Panel
                            static
                            className={[
                                "absolute right-0 top-full mt-2",
                                "w-[360px] sm:w-[420px] max-h-[calc(100vh-8rem)] overflow-auto",
                                "rounded-2xl bg-white/90 backdrop-blur-md",
                                "shadow-2xl border border-black/5",
                                "p-4",
                            ].join(" ")}
                        >
                            <div className="mb-3">
                                <div className="text-sm font-semibold">Key: Phase 1 Habitat Classification</div>
                                <div className="text-xs text-slate-600">Click a polygon to view details</div>
                            </div>

                            <div className="columns-1 sm:columns-2 gap-x-6">
                                {allCodes.map((c) => (
                                    <div key={c} className="mb-2 flex break-inside-avoid items-start gap-2">
                                        <span
                                            className="mt-[2px] h-5 w-5 flex-shrink-0 rounded border border-black/20"
                                            style={{ background: PHASE1_COLORS[c] ?? hashColor(c) }}
                                        />
                                        <span className="text-sm leading-tight">{PHASE1_NAMES[c] ?? c}</span>
                                    </div>
                                ))}
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}
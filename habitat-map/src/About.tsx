// About.tsx
// Vite + React + TailwindCSS
// Drop this into your routes/pages and render <AboutPage />.
// Optional: use <MapHelpDrawer /> on your map page for a compact help panel.

import React, { useMemo, useState } from "react";

type Stat = { label: string; value: string; sub?: string };
type Section = { id: string; title: string; body: React.ReactNode };

function Container({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            {children}
        </div>
    );
}

function Card({
    title,
    children,
    right,
}: {
    title?: string;
    children: React.ReactNode;
    right?: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {(title || right) && (
                <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
                    <div className="min-w-0">
                        {title ? (
                            <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
                        ) : null}
                    </div>
                    {right ? <div className="shrink-0">{right}</div> : null}
                </div>
            )}
            <div className="px-5 py-4 text-sm leading-6 text-zinc-700">{children}</div>
        </div>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border border-zinc-200 bg-emerald-700/80 px-2.5 py-1 text-xs font-medium text-white">
            {children}
        </span>
    );
}

function Button({
    children,
    onClick,
    href,
    variant = "primary",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: "primary" | "secondary";
}) {
    const base =
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
    const styles =
        variant === "primary"
            ? "bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-900"
            : "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 focus:ring-zinc-900";

    if (href) {
        return (
            <a className={`${base} ${styles}`} href={href}>
                {children}
            </a>
        );
    }

    return (
        <button className={`${base} ${styles}`} onClick={onClick} type="button">
            {children}
        </button>
    );
}

function StatsGrid({ stats }: { stats: Stat[] }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="rounded-2xl border border-zinc-200 bg-slate-700 p-4 shadow-sm"
                >
                    <div className="text-xs font-medium text-white">{s.label}</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight text-white">
                        {s.value}
                    </div>
                    {s.sub ? (
                        <div className="mt-1 text-xs text-white">{s.sub}</div>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

function Toc({
    items,
    activeId,
}: {
    items: { id: string; title: string }[];
    activeId?: string;
}) {
    return (
        <nav className="sticky top-4 hidden max-h-[calc(100vh-2rem)] overflow-auto rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm lg:block">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                On this page
            </div>
            <ul className="mt-3 space-y-2">
                {items.map((it) => (
                    <li key={it.id}>
                        <a
                            href={`#${it.id}`}
                            className={`block rounded-lg px-2 py-1.5 transition ${activeId === it.id
                                ? "bg-zinc-900 text-white"
                                : "text-zinc-700 hover:bg-zinc-50"
                                }`}
                        >
                            {it.title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

function useActiveSection(sectionIds: string[]) {
    const [activeId, setActiveId] = useState<string | undefined>(sectionIds[0]);

    React.useEffect(() => {
        const els = sectionIds
            .map((id) => document.getElementById(id))
            .filter(Boolean) as HTMLElement[];

        if (!els.length) return;

        const obs = new IntersectionObserver(
            (entries) => {
                // pick the most visible entry
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
                if (visible?.target?.id) setActiveId(visible.target.id);
            },
            {
                root: null,
                rootMargin: "-20% 0px -70% 0px",
                threshold: [0.1, 0.2, 0.35, 0.5, 0.65],
            }
        );

        els.forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, [sectionIds.join("|")]);

    return activeId;
}

export function About({
    contactHref = "#",
}: {
    contactHref?: string;
}) {
    const stats: Stat[] = useMemo(
        () => [
            { label: "Started", value: "2022" },
            { label: "Volunteers trained", value: "19" },
            { label: "Volunteer hours", value: "~260", sub: "Fieldwork + analysis" },
            { label: "Area Surveyed", value: "XXXXXXXm2" },
        ],
        []
    );

    const sections: Section[] = useMemo(
        () => [
            {
                id: "about-this-map",
                title: "About this map",
                body: (
                    <>
                        <p>
                            This interactive map shows habitat polygons recorded by trained volunteers
                            during field surveys across Matterdale, using <strong>Phase 1 Habitat Survey</strong>{" "}
                            methods. Click a habitat area to view survey details and notes.
                        </p>
                    </>
                ),
            },
            {
                id: "why-it-matters",
                title: "Why it matters",
                body: (
                    <>
                        <p>
                            Up-to-date habitat data helps communities, land managers and conservation
                            partners understand what exists today and where change may be happening.
                        </p>
                        <p className="mt-3">
                            In 2023 we discovered the Cumbria Biodiversity Data Centre (CBDC) holds
                            detailed habitat survey data for Matterdale from <strong>1980</strong>. That
                            opens the door to comparing habitat patterns across a 40+ year period —
                            turning local surveys into a meaningful long-term record of landscape change.
                        </p>
                    </>
                ),
            },
            {
                id: "how-surveys-work",
                title: "How the surveys work",
                body: (
                    <>
                        <p>
                            The project began in 2022 following discussions between the Matterdale
                            community, Friends of the Ullswater Way (FOUW), and Prof Lois Mansfield
                            (University of Cumbria). Volunteers were trained through classroom and field
                            sessions, and surveys are carried out with landowner agreement.
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                <div className="text-sm font-semibold text-zinc-900">Before fieldwork</div>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    <li>Landowner / tenant consent confirmed</li>
                                    <li>Risk assessment completed for each survey day</li>
                                </ul>
                            </div>
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                <div className="text-sm font-semibold text-zinc-900">In the field</div>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    <li>Teams of 3+ volunteers with shared roles</li>
                                    <li>Grid references, notes, mapping and photos</li>
                                </ul>
                            </div>
                        </div>
                        <p className="mt-4">
                            Volunteers are covered under <strong>FOUW’s insurance</strong> during survey
                            activities.
                        </p>
                    </>
                ),
            },
            {
                id: "progress",
                title: "Progress so far",
                body: (
                    <>
                        <p>
                            Surveys have been completed across multiple sites including{" "}
                            <strong>
                                Great Mell Fell, Little Mell Fell, Lucy’s Wood &amp; Field, The Riddings,
                                Watermillock Common (partial), and local farmland sites
                            </strong>
                            .
                        </p>
                        <p className="mt-3">
                            Survey effort varies by terrain and size. For example, Great Mell Fell
                            required around <strong>80 hours</strong> total (fieldwork plus mapping and
                            analysis).
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Pill>Great Mell Fell</Pill>
                            <Pill>Little Mell Fell</Pill>
                            <Pill>Lucy’s Wood &amp; Field</Pill>
                            <Pill>The Riddings</Pill>
                            <Pill>Watermillock Common</Pill>
                            <Pill>Local farmland</Pill>
                        </div>
                    </>
                ),
            },
            {
                id: "data-and-limitations",
                title: "Data quality & limitations",
                body: (
                    <>
                        <p>
                            Habitat mapping is detailed work and classification can be challenging —
                            especially where specialist species ID is needed (e.g. grasses, rushes,
                            mosses and lichens). Over time the team has added refresher and specialist
                            training to improve consistency.
                        </p>
                        <p className="mt-3">
                            This map represents the <strong>best available interpretation</strong> from
                            field surveys at the time of recording. Boundaries and classifications may be
                            refined as additional surveys are completed, records are reviewed, and new
                            comparisons (including the 1980 dataset) are undertaken.
                        </p>
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                            <div className="text-sm font-semibold text-amber-900">See something off?</div>
                            <p className="mt-1 text-sm text-amber-900/90">
                                If you spot an error, or want to add local context, please get in touch —
                                feedback helps improve the dataset.
                            </p>
                        </div>
                    </>
                ),
            },
            {
                id: "get-involved",
                title: "Get involved",
                body: (
                    <>
                        <p>
                            We welcome new volunteers (training provided), landowners willing to support
                            surveys, and help with digitising, mapping and data stewardship.
                        </p>
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <Button href={contactHref} variant="secondary">
                                Contact us
                            </Button>
                        </div>

                        <div className="mt-5 text-xs text-zinc-600">
                            <div className="font-semibold text-zinc-700">Partners & support</div>
                            <p className="mt-1">
                                Friends of the Ullswater Way (FOUW), Lake District Foundation, Cumbria
                                Biodiversity Data Centre (CBDC).
                            </p>
                            <p className="mt-2">
                                Seed funding (2022): Lake District Foundation (£350) and FOUW (£300), used
                                to purchase Phase 1 manuals and field materials.
                            </p>
                        </div>
                    </>
                ),
            },
        ],
        [contactHref]
    );

    const tocItems = useMemo(
        () => sections.map((s) => ({ id: s.id, title: s.title })),
        [sections]
    );

    const activeId = useActiveSection(sections.map((s) => s.id));

    return (
        <div className="min-h-screen bg-zinc-50">
            <header className="relative border-b border-zinc-200">

                {/* Hero Image */}
                <div className="absolute inset-0 h-full w-full overflow-hidden">
                    <img
                        src="src/images/matterdale.jpg"
                        alt="Matterdale landscape"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                </div>

                <Container>
                    <div className="relative py-16 sm:py-20 lg:py-24">

                        <div className="flex flex-wrap items-center gap-2">
                            <Pill >Community science</Pill>
                            <Pill >Phase 1 Habitat Survey</Pill>
                            <Pill >Matterdale</Pill>
                        </div>

                        <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            Matterdale Nature Watch — Habitat Survey Map
                        </h1>

                        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-100">
                            A community-led effort to map Matterdale’s habitats using Phase 1 methods.
                            Explore where surveys have taken place, what habitats have been recorded,
                            and how the landscape may be changing over time.
                        </p>

                        <div className="mt-6">
                            <StatsGrid stats={stats} />
                        </div>

                        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                            <Button href="#about-this-map" variant="primary">
                                Start exploring
                            </Button>
                            <Button href={contactHref} variant="secondary">
                                Contact / feedback
                            </Button>
                        </div>

                    </div>
                </Container>
            </header>

            <main>
                <Container>
                    <div className="grid gap-6 py-10 lg:grid-cols-[1fr_280px]">
                        <div className="space-y-6">
                            {sections.map((s) => (
                                <section id={s.id} key={s.id} className="scroll-mt-24">
                                    <Card
                                        title={s.title}
                                        right={
                                            <a
                                                href="#top"
                                                className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                                            >
                                                Back to top
                                            </a>
                                        }
                                    >
                                        {s.body}
                                    </Card>
                                </section>
                            ))}
                        </div>

                        <div className="lg:pl-2">
                            <Toc items={tocItems} activeId={activeId} />
                        </div>
                    </div>
                </Container>
            </main>

            <footer className="border-t border-zinc-200 bg-white">
                <Container>
                    <div className="py-8 text-sm text-zinc-600">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <span className="font-semibold text-zinc-800">Matterdale Nature Watch</span>{" "}
                                — habitat mapping for local understanding and long-term change.
                            </div>
                            <div className="flex gap-2">
                                <Button href={contactHref} variant="secondary">
                                    Contact
                                </Button>
                            </div>
                        </div>
                    </div>
                </Container>
            </footer>
        </div>
    );
}

/**
 * Optional compact “Map Help” panel for your map UI.
 * Use it as a button that opens a modal-like drawer.
 */
export function MapHelpDrawer({
    contactHref = "#",
}: {
    contactHref?: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50"
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                Map help
            </button>

            {open ? (
                <div
                    className="fixed inset-0 z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Map help"
                >
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-auto bg-white shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                    Matterdale Nature Watch
                                </div>
                                <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                                    How to use the map
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-4 p-5 text-sm leading-6 text-zinc-700">
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                <div className="font-semibold text-zinc-900">Click a habitat</div>
                                <p className="mt-1">
                                    Select a polygon to view the recorded habitat type and survey notes.
                                </p>
                            </div>

                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                <div className="font-semibold text-zinc-900">Toggle layers</div>
                                <p className="mt-1">
                                    Use the layers panel to switch between surveyed areas, habitat categories
                                    and context layers (e.g. boundaries).
                                </p>
                            </div>

                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                <div className="font-semibold text-zinc-900">Accuracy & updates</div>
                                <p className="mt-1">
                                    Habitat boundaries and classifications may be refined as surveys continue
                                    and records are reviewed.
                                </p>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-3">
                                <div>
                                    <div className="font-semibold text-zinc-900">Feedback</div>
                                    <div className="text-xs text-zinc-600">
                                        Spotted an error or have local context?
                                    </div>
                                </div>
                                <Button href={contactHref} variant="primary">
                                    Contact
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
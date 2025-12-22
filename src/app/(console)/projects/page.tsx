import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const WIZARD_STEPS = 6;

function formatCurrency(value?: number | null) {
  if (!value || Number.isNaN(value)) return "$0";
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  const projects = await prisma.project.findMany({
    where: { enterpriseId: user.enterpriseId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-full bg-transparent">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-slate-900">
              Ferion TaaS
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              v1.0.0
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-700">
            <a href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </a>
            <a href="/projects" className="font-semibold text-orange-600">
              My Projects
            </a>
            <a
              href="/create"
              className="rounded-md bg-orange-600 px-3 py-2 font-semibold text-white hover:bg-orange-700"
            >
              + New Project
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Projects</p>
            <h1 className="text-2xl font-semibold text-slate-900">
              My Projects
            </h1>
          </div>
          <Link
            href="/create"
            className="rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            + New Project
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const progress = Math.round(
              ((project.currentStep ?? 1) / WIZARD_STEPS) * 100,
            );
            return (
              <div
                key={project.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {project.description || "No description provided"}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {project.assetType || "Asset"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                  <div>
                    <p className="text-slate-500">Total Value</p>
                    <p className="font-semibold">
                      {formatCurrency(project.assetValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Progress</p>
                    <p className="font-semibold">{progress}%</p>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-orange-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-orange-600">
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-semibold hover:text-orange-700"
                  >
                    View details ??
                  </Link>
                  <span className="text-slate-500 text-xs">
                    Created {project.createdAt.toISOString().slice(0, 10)}
                  </span>
                </div>
              </div>
            );
          })}

          {projects.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
              No projects yet. Create a new project to get started.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

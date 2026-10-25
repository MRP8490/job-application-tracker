"use client";

import { useEffect, useState } from "react";

type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected";

type JobApplication = {
  id: string;
  company: string;
  jobTitle: string;
  date: string;
  status: ApplicationStatus;
};

const STORAGE_KEY = "jobApplications";

const validStatuses: ApplicationStatus[] = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

export default function Home() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved applications
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          const validApplications = parsed.filter(
            (item): item is JobApplication =>
              item !== null &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.company === "string" &&
              typeof item.jobTitle === "string" &&
              typeof item.date === "string" &&
              validStatuses.includes(item.status)
          );

          setApplications(validApplications);
        }
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save applications when they change
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch (error) {
      console.error("Failed to save applications:", error);
    }
  }, [applications, isLoaded]);

  const editingApplication = applications.find(
    (application) => application.id === editingId
  );

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (application: JobApplication) => {
    setEditingId(application.id);
    setShowForm(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const company = String(formData.get("company") ?? "").trim();
    const jobTitle = String(formData.get("jobTitle") ?? "").trim();
    const date = String(formData.get("date") ?? "");
    const statusValue = String(formData.get("status") ?? "");

    if (!company || !jobTitle || !date) {
      alert("Please complete all required fields.");
      return;
    }

    if (!validStatuses.includes(statusValue as ApplicationStatus)) {
      alert("Please select a valid application status.");
      return;
    }

    const status = statusValue as ApplicationStatus;

    if (editingId) {
      // Update existing application
      setApplications((previous) =>
        previous.map((application) =>
          application.id === editingId
            ? {
                ...application,
                company,
                jobTitle,
                date,
                status,
              }
            : application
        )
      );
    } else {
      // Add new application
      const newApplication: JobApplication = {
        id: crypto.randomUUID(),
        company,
        jobTitle,
        date,
        status,
      };

      setApplications((previous) => [...previous, newApplication]);
    }

    closeForm();
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    setApplications((previous) =>
      previous.filter((application) => application.id !== id)
    );

    if (editingId === id) {
      closeForm();
    }
  };
  const filteredApplications = applications.filter((application) => {
  const search = searchTerm.toLowerCase().trim();

  const matchesSearch =
    application.company.toLowerCase().includes(search) ||
    application.jobTitle.toLowerCase().includes(search);

  const matchesStatus =
    statusFilter === "All" || application.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  const totalApplications = applications.length;

  const totalInterviews = applications.filter(
    (application) => application.status === "Interview"
  ).length;

  const totalOffers = applications.filter(
    (application) => application.status === "Offer"
  ).length;

  const getStatusStyle = (status: ApplicationStatus) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-700";
      case "Interview":
        return "bg-purple-100 text-purple-700";
      case "Offer":
        return "bg-emerald-100 text-emerald-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 md:p-12">
      <main className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold text-indigo-600">
            CAREER DASHBOARD
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Job Application Tracker
          </h1>

          <p className="mt-3 text-slate-500">
            Stay organized and track your next career opportunity.
          </p>
        </header>

        {/* Statistics */}
        <section className="mb-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm text-slate-500">
              Total Applications
            </p>
            <h2 className="mt-3 text-4xl font-bold">
              {totalApplications}
            </h2>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm text-slate-500">
              Interviews
            </p>
            <h2 className="mt-3 text-4xl font-bold text-indigo-600">
              {totalInterviews}
            </h2>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm text-slate-500">
              Offers
            </p>
            <h2 className="mt-3 text-4xl font-bold text-emerald-600">
              {totalOffers}
            </h2>
          </div>
        </section>

        {/* Add / Edit Form */}
        {showForm && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId
                  ? "Edit Application"
                  : "Add New Application"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="text-2xl text-slate-500 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <form
              key={editingId ?? "new"}
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >
              {/* Company */}
              <div>
                <label
                  htmlFor="company"
                  className="mb-2 block text-sm font-medium"
                >
                  Company Name
                </label>

                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="e.g. Google"
                  defaultValue={editingApplication?.company ?? ""}
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Job Title */}
              <div>
                <label
                  htmlFor="jobTitle"
                  className="mb-2 block text-sm font-medium"
                >
                  Job Title
                </label>

                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  defaultValue={editingApplication?.jobTitle ?? ""}
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-medium"
                >
                  Application Date
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={editingApplication?.date ?? ""}
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  defaultValue={editingApplication?.status ?? "Applied"}
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-500"
                >
                  {validStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                  {editingId
                    ? "Update Application"
                    : "Save Application"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-300 px-6 py-3 font-semibold transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Applications */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                My Applications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage and monitor your job applications.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              + Add Application
            </button>
          </div>
  <div className="mb-6 flex flex-col gap-4 md:flex-row">
  {/* Search */}
  <input
    type="search"
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
    placeholder="Search by company or job title..."
    aria-label="Search applications"
    className="w-full flex-1 rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-indigo-500"
  />

  {/* Status Filter */}
  <select
    value={statusFilter}
    onChange={(event) => setStatusFilter(event.target.value)}
    aria-label="Filter by status"
    className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-indigo-500 md:w-48"
  >
    <option value="All">All Statuses</option>
    <option value="Applied">Applied</option>
    <option value="Interview">Interview</option>
    <option value="Offer">Offer</option>
    <option value="Rejected">Rejected</option>
  </select>
</div>

          {!isLoaded ? (
            <div className="p-12 text-center text-slate-500">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <h3 className="text-lg font-semibold">
                No applications yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add your first job application to get started.
              </p>
            </div>
 ) : filteredApplications.length === 0 ? (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
    <h3 className="text-lg font-semibold">
      No matching applications found
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      Try changing your search or status filter.
    </p>
  </div>
) : (
  <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="p-4">Company</th>
                    <th className="p-4">Job Title</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                 {filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-4 font-semibold">
                        {application.company}
                      </td>

                      <td className="p-4">
                        {application.jobTitle}
                      </td>

                      <td className="p-4">
                        {application.date}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                            application.status
                          )}`}
                        >
                          {application.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(application)}
                            className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(application.id)}
                            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
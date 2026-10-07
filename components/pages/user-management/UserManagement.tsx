"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  PencilLine,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/providers/userProvider";
import { UserDetailsModal } from "./Modals/UserDetailsModal";
import { EditUserModal, type CollegeOption } from "./Modals/EditUserModal";
import { CreateUserSheet } from "./Sheets/CreateUserSheet";
import { USER_ROLES, type ViewUser } from "./types/view-user";

const supabase = createClient();
const PAGE_SIZE = 10;

// Pill colors distinguish roles at a glance (never color-only: label included).
function rolePill(role: string) {
  if (role === "Super Admin") {
    return "bg-bulsu/[0.07] text-bulsu";
  }

  if (role === "College Admin") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(
    new Date(value)
  );
}

export default function UserManagement() {
  const router = useRouter();
  const { user } = useUser();

  const [users, setUsers] = useState<ViewUser[]>([]);
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const [viewing, setViewing] = useState<ViewUser | null>(null);
  const [editing, setEditing] = useState<ViewUser | null>(null);
  // Bumped per edit so the edit form remounts with fresh values.
  const [editSession, setEditSession] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  // Bumped per open so the create form remounts empty every time.
  const [createSession, setCreateSession] = useState(0);

  // Paged fetch keeps large user bases fast; search/filters run in Postgres.
  // Pure fetch (no state writes) shared by the effect and manual refreshes.
  const fetchUsers = useCallback(
    async (pageNumber: number, search: string, role: string) => {
      const from = (pageNumber - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("profiles")
        .select("*, college:colleges (id, name, code)", {
          count: "exact",
        })
        .order("created_at", { ascending: false })
        .range(from, to);

      const cleanSearch = search.trim();

      if (cleanSearch) {
        const pattern = `%${cleanSearch}%`;
        query = query.or(
          `first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern}`
        );
      }

      if (role !== "All Roles") {
        query = query.eq("role", role);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching users:", error);
      }

      return {
        users: (error ? [] : (data ?? [])) as ViewUser[],
        total: error ? 0 : (count ?? 0),
      };
    },
    []
  );

  // Applies fetch results to state; invoked from async continuations only.
  const applyUsers = useCallback(
    (result: Awaited<ReturnType<typeof fetchUsers>>) => {
      setUsers(result.users);
      setTotalCount(result.total);
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    let ignore = false;

    fetchUsers(page, appliedSearch, roleFilter).then((result) => {
      if (!ignore) {
        applyUsers(result);
      }
    });

    return () => {
      ignore = true;
    };
  }, [fetchUsers, applyUsers, page, appliedSearch, roleFilter]);

  // Refresh after an edit saves (loading flash is acceptable feedback here).
  const refreshUsers = useCallback(() => {
    setLoading(true);

    fetchUsers(page, appliedSearch, roleFilter).then((result) => {
      applyUsers(result);
    });
  }, [fetchUsers, applyUsers, page, appliedSearch, roleFilter]);

  // College options power the edit form's assignment dropdown.
  // Plain fetch in an async continuation (no sync setState in the body).
  useEffect(() => {
    let ignore = false;

    supabase
      .from("colleges")
      .select("id, name, code")
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (!ignore) {
          setColleges(data ?? []);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Search applies on submit so every keystroke doesn't refetch.
  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(searchQuery);
  }

  function handleRoleChange(nextRole: string) {
    setRoleFilter(nextRole);
    setPage(1);
  }

  function handleEdit(row: ViewUser) {
    setEditing(row);
    setEditSession((session) => session + 1);
  }

  function handleCreate() {
    setCreateSession((session) => session + 1);
    setShowCreate(true);
  }

  if (!user) {
    router.replace("/login");
    router.refresh();
    return null;
  }

  // User Management is a Super Admin surface; everyone else bounces out.
  if (user.role !== "Super Admin") {
    router.replace("/dashboard");
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="relative min-h-screen bg-white p-6 sm:p-10">
      <div className="pointer-events-none absolute right-10 top-32 h-80 w-80 rounded-full bg-gold/50 blur-[200px]" />
      <div className="pointer-events-none absolute -left-50 top-5 h-96 w-96 rounded-full bg-bulsu/[0.15] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-[32px] font-bold leading-tight tracking-[-1.2px] text-slate-950 sm:text-[40px]">
              Manage <span className="text-bulsu">Users</span>
            </h1>

            <p className="mt-1 text-[15px] text-slate-500">
              View accounts, assign roles, and scope college admins to their
              colleges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-[14px] border border-slate-200/70 bg-white px-5 py-3 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Total users
              </p>

              <p className="mt-0.5 text-[20px] font-bold text-bulsu">
                {loading ? "…" : totalCount}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex h-[52px] items-center gap-2 rounded-[14px] bg-bulsu px-5 text-[14px] font-semibold text-white shadow-[0_10px_25px_rgba(165,0,17,0.20)] transition-all hover:bg-bulsu-dark active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
          className="rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)]"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-bulsu" />

              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Find a user
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {["All Roles", ...USER_ROLES].map((role) => {
                  const active = roleFilter === role;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className={`h-9 rounded-full px-4 text-[13px] font-semibold transition-all duration-200 active:scale-95 ${
                        active
                          ? "bg-bulsu text-white shadow-[0_6px_16px_rgba(165,0,17,0.25)]"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="relative w-full lg:w-72"
                role="search"
              >
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search name or email…"
                  aria-label="Search users"
                  className="h-10 w-full rounded-full border border-slate-200/80 bg-white pl-10 pr-4 text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-bulsu focus:bg-white focus:ring-2 focus:ring-bulsu/10"
                />
              </form>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: "easeOut" }}
          className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.03)]"
        >
          {/* Horizontal scroll keeps the table usable on phones. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    User
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Role
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    College
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Joined
                  </th>

                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading &&
                  Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <tr key={index} className="border-b border-slate-50">
                      <td colSpan={5} className="px-5 py-3">
                        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                      </td>
                    </tr>
                  ))}

                {!loading &&
                  users.map((row) => {
                    const initials =
                      `${row.first_name.charAt(0)}${row.last_name.charAt(0)}`.toUpperCase();

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bulsu/[0.07] text-[11px] font-bold text-bulsu">
                              {initials}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-bold text-slate-900">
                                {row.first_name} {row.last_name}
                              </p>

                              <p className="truncate text-[12px] text-slate-500">
                                {row.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${rolePill(row.role)}`}
                          >
                            {row.role}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-[13px] font-medium text-slate-600">
                          {row.college ? row.college.code : "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-slate-500">
                          {formatDate(row.created_at)}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setViewing(row)}
                              aria-label={`View ${row.first_name} ${row.last_name}`}
                              title="View"
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:border-bulsu/30 hover:bg-bulsu/[0.05] hover:text-bulsu active:scale-95"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEdit(row)}
                              aria-label={`Edit ${row.first_name} ${row.last_name}`}
                              title="Edit"
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:border-bulsu/30 hover:bg-bulsu/[0.05] hover:text-bulsu active:scale-95"
                            >
                              <PencilLine className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {!loading && users.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-bulsu/[0.07]">
                <Users className="h-5 w-5 text-bulsu" />
              </div>

              <h3 className="mt-5 text-[16px] font-bold text-slate-900">
                No users found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-[13px] leading-5 text-slate-500">
                Try a different search term or role filter.
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row">
            <p className="text-[12px] font-medium text-slate-500">
              {loading
                ? "Loading users…"
                : totalCount === 0
                  ? "No users to show"
                  : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalCount)} of ${totalCount}`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loading || page <= 1}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                aria-label="Previous page"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="min-w-[96px] text-center text-[12px] font-bold text-slate-700">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={loading || page >= totalPages}
                onClick={() =>
                  setPage((previous) => Math.min(totalPages, previous + 1))
                }
                aria-label="Next page"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* View + edit + create dialogs */}
      <UserDetailsModal user={viewing} onClose={() => setViewing(null)} />

      <CreateUserSheet
        key={createSession}
        isOpen={showCreate}
        colleges={colleges}
        onClose={() => setShowCreate(false)}
        onCreated={refreshUsers}
      />

      <EditUserModal
        key={editSession}
        user={editing}
        colleges={colleges}
        onClose={() => setEditing(null)}
        onSaved={refreshUsers}
      />
    </div>
  );
}

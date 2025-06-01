"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

type Column = {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
};

type TableSchema = {
  name: string;
  columns: Column[];
};

type DbConfig = {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
};

export default function DatabaseSchemaPage() {
  const [tables, setTables] = useState<TableSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [dbConfig, setDbConfig] = useState<DbConfig>({
    host: "",
    port: "5432",
    user: "",
    password: "",
    database: "",
  });

  // Validation state
  const [validation, setValidation] = useState({
    host: true,
    port: true,
    user: true,
    password: true,
    database: true,
  });

  // Open dialog if no config in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("db_config");
    if (saved) {
      setDbConfig(JSON.parse(saved));
    } else {
      setShowDialog(true);
    }
  }, []);

  useEffect(() => {
    if (!dbConfig.host || !dbConfig.user || !dbConfig.database) return;
    const fetchSchema = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/database/schema", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dbConfig),
        });
        if (!res.ok) throw new Error("Failed to fetch schema");
        const data = await res.json();
        setTables(data.tables || []);
        if (data.tables && data.tables.length > 0) {
          setSelectedTable(data.tables[0].name);
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchSchema();
  }, [dbConfig]);

  const selected = tables.find((t) => t.name === selectedTable);

  const validate = () => {
    const isHost = !!dbConfig.host.trim();
    const isPort = /^\d+$/.test(dbConfig.port.trim());
    const isUser = !!dbConfig.user.trim();
    const isDatabase = !!dbConfig.database.trim();
    setValidation({
      host: isHost,
      port: isPort,
      user: isUser,
      password: true,
      database: isDatabase,
    });
    return isHost && isPort && isUser && isDatabase;
  };

  const handleDialogSave = () => {
    if (!validate()) return;
    localStorage.setItem("db_config", JSON.stringify(dbConfig));
    setShowDialog(false);
  };

  // Helper to show meta info
  const meta = [
    { label: "Host", value: dbConfig.host },
    { label: "Port", value: dbConfig.port },
    { label: "Database", value: dbConfig.database },
    { label: "User", value: dbConfig.user },
  ];

  return (
    <>
      <Header
        title="Database Schema"
        description="View and manage your application's database schema"
        showBackButton={true}
        showHomeButton={true}
      />

      {/* Database Meta Card */}
      <div className="max-w-6xl mx-auto mt-6 mb-4">
        <Card className="rounded-lg shadow border px-6 py-4">
          <div className="flex flex-wrap gap-6 items-center">
            {meta.map((item) => (
              <div key={item.label} className="flex flex-col">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="font-medium text-gray-800 break-all">
                  {item.value || (
                    <span className="text-gray-400">-</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-60 shrink-0">
          <Card className="rounded-lg shadow border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Tables</CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="ml-2 px-2 py-1 rounded border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDialog(true)}
              >
                Change
              </Button>
            </CardHeader>
            <CardContent>
              {loading && <div className="text-gray-400">Loading...</div>}
              {error && <div className="text-red-500">{error}</div>}
              {!loading && !error && tables.length === 0 && (
                <div className="text-gray-400 italic">No tables found.</div>
              )}
              <ul className="space-y-1">
                {tables.map((table) => (
                  <li key={table.name}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded transition ${
                        selectedTable === table.name
                          ? "bg-gray-100 font-semibold border border-gray-300"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedTable(table.name)}
                    >
                      {table.name}
                      <span className="ml-2 text-xs text-gray-400">
                        ({table.columns.length})
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
        {/* Main Content */}
        <main className="flex-1">
          <Card className="rounded-lg shadow border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {selected?.name || "Database Schema"}
              </CardTitle>
              <CardDescription>
                {selected
                  ? `Columns for table "${selected.name}"`
                  : "All tables and columns in your connected PostgreSQL database."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && <div className="text-gray-500">Loading schema...</div>}
              {error && <div className="text-red-500">{error}</div>}
              {!loading && !error && tables.length === 0 && (
                <div className="text-gray-500 italic">No tables found.</div>
              )}
              {!loading && !error && selected && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="outline"
                      className="text-base font-semibold px-3 py-1"
                    >
                      {selected.name}
                    </Badge>
                    <span className="text-gray-400 text-xs">
                      ({selected.columns.length} columns)
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded border border-gray-200 shadow-sm">
                    <table className="min-w-full text-sm bg-white rounded">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-2 font-medium">
                            Column
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Type
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Nullable
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Default
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.columns.map((col) => (
                          <tr key={col.name} className="even:bg-gray-50">
                            <td className="px-3 py-2">{col.name}</td>
                            <td className="px-3 py-2">{col.type}</td>
                            <td className="px-3 py-2">
                              {col.nullable ? (
                                <span className="font-medium">YES</span>
                              ) : (
                                <span className="font-medium">NO</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {col.default !== null ? (
                                <code className="bg-gray-100 px-1 rounded">
                                  {col.default}
                                </code>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Database Config Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-full max-w-xs rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Database className="h-5 w-5" />
              Connect to PostgreSQL
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Enter your database connection info.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleDialogSave();
            }}
          >
            <Input
              placeholder="Host"
              value={dbConfig.host}
              onChange={(e) =>
                setDbConfig({ ...dbConfig, host: e.target.value })
              }
              autoFocus
              className={`rounded ${
                !validation.host ? "border-red-500" : ""
              }`}
            />
            {!validation.host && (
              <div className="text-xs text-red-500 ml-1">Host is required.</div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Port"
                value={dbConfig.port}
                onChange={(e) =>
                  setDbConfig({ ...dbConfig, port: e.target.value })
                }
                className={`w-1/3 rounded ${
                  !validation.port ? "border-red-500" : ""
                }`}
              />
              <Input
                placeholder="Database"
                value={dbConfig.database}
                onChange={(e) =>
                  setDbConfig({ ...dbConfig, database: e.target.value })
                }
                className={`w-2/3 rounded ${
                  !validation.database ? "border-red-500" : ""
                }`}
              />
            </div>
            {!validation.port && (
              <div className="text-xs text-red-500 ml-1">
                Port must be a number.
              </div>
            )}
            {!validation.database && (
              <div className="text-xs text-red-500 ml-1">
                Database is required.
              </div>
            )}
            <Input
              placeholder="User"
              value={dbConfig.user}
              onChange={(e) =>
                setDbConfig({ ...dbConfig, user: e.target.value })
              }
              className={`rounded ${
                !validation.user ? "border-red-500" : ""
              }`}
            />
            {!validation.user && (
              <div className="text-xs text-red-500 ml-1">User is required.</div>
            )}
            <Input
              placeholder="Password"
              type="password"
              value={dbConfig.password}
              onChange={(e) =>
                setDbConfig({ ...dbConfig, password: e.target.value })
              }
              className="rounded"
            />
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="w-full rounded bg-gray-900 hover:bg-gray-700 text-white font-semibold"
                disabled={
                  !dbConfig.host ||
                  !dbConfig.user ||
                  !dbConfig.database ||
                  !/^\d+$/.test(dbConfig.port)
                }
              >
                Connect
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
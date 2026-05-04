import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  FileCode2,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TreeNode {
  name: string;
  path: string;
  children: Map<string, TreeNode>;
  isFile: boolean;
}

function buildTree(files: string[]): TreeNode {
  const root: TreeNode = { name: "", path: "", children: new Map(), isFile: false };
  for (const file of files) {
    const parts = file.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          children: new Map(),
          isFile: i === parts.length - 1,
        });
      }
      current = current.children.get(part)!;
    }
  }
  return root;
}

const EXT_COLORS: Record<string, string> = {
  tsx: "text-blue-500",
  ts: "text-blue-400",
  css: "text-purple-500",
  json: "text-yellow-600",
  html: "text-orange-500",
  js: "text-yellow-500",
  jsx: "text-yellow-500",
  svg: "text-green-500",
  md: "text-neutral-500",
};

function getExtColor(name: string): string {
  const ext = name.split(".").pop() || "";
  return EXT_COLORS[ext] || "text-neutral-600";
}

function FileTreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
  searchQuery,
}: {
  node: TreeNode;
  depth: number;
  selectedPath: string;
  onSelect: (path: string) => void;
  searchQuery: string;
}) {
  const [expanded, setExpanded] = useState(depth < 2);

  const matchesSearch = useMemo(() => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (node.isFile) return node.path.toLowerCase().includes(q);
    const checkChildren = (n: TreeNode): boolean => {
      const children = Array.from(n.children.values());
      for (const child of children) {
        if (child.isFile && child.path.toLowerCase().includes(q)) return true;
        if (!child.isFile && checkChildren(child)) return true;
      }
      return false;
    };
    return checkChildren(node);
  }, [node, searchQuery]);

  if (!matchesSearch) return null;

  const sortedChildren = Array.from(node.children.values()).sort((a, b) => {
    if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  if (node.isFile) {
    const isSelected = selectedPath === node.path;
    return (
      <button
        type="button"
        data-testid={`file-${node.path}`}
        onClick={() => onSelect(node.path)}
        className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left font-body text-sm transition-colors ${
          isSelected
            ? "bg-brand-secondary/10 text-brand-secondary"
            : "text-neutral-700 hover:bg-neutral-100"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <FileCode2 className={`h-4 w-4 shrink-0 ${getExtColor(node.name)}`} />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        data-testid={`folder-${node.path}`}
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left font-body text-sm font-medium text-neutral-900 hover:bg-neutral-100"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
        )}
        <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
        <span className="truncate">{node.name}</span>
      </button>
      {expanded &&
        sortedChildren.map((child) => (
          <FileTreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            selectedPath={selectedPath}
            onSelect={onSelect}
            searchQuery={searchQuery}
          />
        ))}
    </div>
  );
}

function CodeBlock({ content, filePath }: { content: string; filePath: string }) {
  const [copied, setCopied] = useState(false);
  const lines = content.split("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2">
        <span className="font-body text-sm font-medium text-neutral-700">{filePath}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="button-copy-code"
          onClick={handleCopy}
          className="h-7 gap-1.5 px-2 font-body text-xs text-neutral-600 hover:text-neutral-900"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <pre className="p-4 font-mono text-sm leading-6">
          <table className="border-collapse">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="select-none pr-4 text-right text-neutral-400" style={{ minWidth: "3rem" }}>
                    {i + 1}
                  </td>
                  <td className="whitespace-pre text-neutral-900">{line || " "}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </pre>
      </ScrollArea>
    </div>
  );
}

const CodeViewerInner = (): JSX.Element => {
  const [selectedFile, setSelectedFile] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: filesData, isLoading: filesLoading } = useQuery<{ files: string[] }>({
    queryKey: ["/api/code/files"],
  });

  const { data: fileData, isLoading: fileLoading } = useQuery<{
    path: string;
    content: string;
  }>({
    queryKey: ["/api/code/file", selectedFile],
    queryFn: async () => {
      const res = await fetch(`/api/code/file?path=${encodeURIComponent(selectedFile)}`);
      if (!res.ok) throw new Error("Failed to load file");
      return res.json();
    },
    enabled: !!selectedFile,
  });

  const tree = useMemo(() => {
    return buildTree(filesData?.files || []);
  }, [filesData]);

  const sortedTopLevel = useMemo(() => {
    return Array.from(tree.children.values()).sort((a, b) => {
      if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [tree]);

  return (
    <section className="flex h-full min-h-[calc(100vh-1rem)] flex-col rounded-lg bg-neutral-0">
      <header className="flex items-center gap-3 rounded-t-lg border-b border-neutral-150 bg-neutral-0 px-5 py-4">
        <FileCode2 className="h-6 w-6 text-neutral-900" aria-hidden="true" />
        <h1 className="font-heading text-2xl font-semibold leading-tight tracking-[0.15px] text-neutral-900">
          Source Code
        </h1>
        <span className="font-body text-sm text-neutral-500">
          {filesData?.files.length ?? 0} files
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-[280px] shrink-0 flex-col border-r border-neutral-200 bg-neutral-0">
          <div className="border-b border-neutral-200 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                data-testid="input-file-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="h-8 rounded border-neutral-300 bg-neutral-0 pl-8 font-body text-sm placeholder:text-neutral-400"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-1">
              {filesLoading ? (
                <div className="px-4 py-8 text-center font-body text-sm text-neutral-500">
                  Loading files...
                </div>
              ) : (
                sortedTopLevel.map((node) => (
                  <FileTreeItem
                    key={node.path}
                    node={node}
                    depth={0}
                    selectedPath={selectedFile}
                    onSelect={setSelectedFile}
                    searchQuery={searchQuery}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden bg-white">
          {!selectedFile ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-neutral-400">
              <FileCode2 className="h-16 w-16 opacity-30" />
              <p className="font-body text-sm">Select a file to view its source code</p>
            </div>
          ) : fileLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="font-body text-sm text-neutral-500">Loading...</p>
            </div>
          ) : fileData ? (
            <CodeBlock content={fileData.content} filePath={fileData.path} />
          ) : null}
        </main>
      </div>
    </section>
  );
};

export const CodeViewerPage = (): JSX.Element => {
  return (
    <AppShell>
      <CodeViewerInner />
    </AppShell>
  );
};

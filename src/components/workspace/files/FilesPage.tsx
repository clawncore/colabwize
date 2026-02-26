import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    FileText,
    Search,
    Download,
    Filter,
    ArrowUpDown,
    MoreVertical,
    Calendar,
    File as FileIcon,
    ImageIcon,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { format } from "date-fns";
import WorkspaceService from "../../../services/workspaceService";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

interface WorkspaceFile {
    id: string;
    name: string;
    file_url: string;
    file_type: string;
    file_size: number;
    created_at: string;
    task: {
        id: string;
        title: string;
        project?: {
            title: string;
        };
    };
}

export default function FilesPage() {
    const { id: workspaceId } = useParams<{ id: string }>();
    const [files, setFiles] = useState<WorkspaceFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [workspaceName, setWorkspaceName] = useState<string>("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof WorkspaceFile | "task";
        direction: "asc" | "desc";
    }>({ key: "created_at", direction: "desc" });

    useEffect(() => {
        fetchFiles();

        // Fetch workspace name
        if (workspaceId) {
            WorkspaceService.getWorkspace(workspaceId)
                .then((data) => { if (data) setWorkspaceName(data.name); })
                .catch((err) => console.error("Failed to fetch workspace name", err));
        }
    }, [workspaceId]);

    const fetchFiles = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || ""}/api/workspaces/${workspaceId}/files`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                }
            );
            if (!response.ok) throw new Error("Failed to fetch files");
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error("Error fetching files:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-purple-500" />;
        if (fileType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
        return <FileIcon className="w-5 h-5 text-blue-500" />;
    };

    const handleSort = (key: keyof WorkspaceFile | "task") => {
        setSortConfig((current) => ({
            key,
            direction:
                current.key === key && current.direction === "asc" ? "desc" : "asc",
        }));
    };

    const sortedFiles = [...files].sort((a, b) => {
        const { key, direction } = sortConfig;
        let aValue: any = a[key as keyof WorkspaceFile];
        let bValue: any = b[key as keyof WorkspaceFile];

        if (key === "task") {
            aValue = a.task.title;
            bValue = b.task.title;
        }

        if (aValue < bValue) return direction === "asc" ? -1 : 1;
        if (aValue > bValue) return direction === "asc" ? 1 : -1;
        return 0;
    });

    const filteredFiles = sortedFiles.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 w-full mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center gap-2">
                    {workspaceName ? workspaceName : <div className="h-8 w-32 bg-muted animate-pulse rounded" />}{" "}
                    Files & Attachments
                </h1>
                <p className="text-slate-500">
                    Manage and access all files attached to tasks in this workspace.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search files by name or task..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2 text-slate-600">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                    </div>
                </div>

                {/* File List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("name")}>
                                    <div className="flex items-center gap-1">
                                        Name <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("file_size")}>
                                    <div className="flex items-center gap-1">
                                        Size <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("created_at")}>
                                    <div className="flex items-center gap-1">
                                        Uploaded <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("task")}>
                                    <div className="flex items-center gap-1">
                                        Associated Task <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        Loading files...
                                    </td>
                                </tr>
                            ) : filteredFiles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        No files found.
                                    </td>
                                </tr>
                            ) : (
                                filteredFiles.map((file) => (
                                    <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                                                    {getFileIcon(file.file_type)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700 truncate max-w-[200px]" title={file.name}>
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{file.file_type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 font-mono text-xs">
                                            {formatFileSize(file.file_size)}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {format(new Date(file.created_at), "MMM d, yyyy")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 font-medium truncate max-w-[150px]" title={file.task.title}>
                                                    {file.task.title}
                                                </span>
                                                {file.task.project && (
                                                    <span className="text-xs text-slate-400 truncate max-w-[150px]">
                                                        {file.task.project.title}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={`${process.env.NEXT_PUBLIC_API_URL || ""}/api/workspaces/tasks/attachments/${file.id}/download`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="w-4 h-4 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => { }}>
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Placeholder) */}
                {!loading && files.length > 0 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                        <span>Showing {filteredFiles.length} files</span>
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" disabled className="h-7 text-xs">Previous</Button>
                            <Button variant="outline" size="sm" disabled className="h-7 text-xs">Next</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

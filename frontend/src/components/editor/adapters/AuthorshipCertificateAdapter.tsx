import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  VisuallyHidden,
} from "../../ui/dialog";
import { AuthorshipCertificate } from "../../authorship/AuthorshipCertificate";

interface AuthorshipCertificateAdapterProps {
  projectId: string;
  projectTitle: string;
  editor: Editor | null;
}

/**
 * Adapter component that bridges DocumentEditor toolbar button with AuthorshipCertificate component
 *
 * Responsibilities:
 * - Provides a button for the editor footer
 * - Opens modal/dialog when clicked
 * - Shows full authorship certificate interface
 */
export const AuthorshipCertificateAdapter: React.FC<
  AuthorshipCertificateAdapterProps
> = ({ projectId, projectTitle, editor }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md text-sm font-bold shadow-sm hover:shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5"
        title="View Authorship Certificate">
        <ShieldCheck className="w-4 h-4" />
        View Proof of Work
      </button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-white">
          <VisuallyHidden>Authorship Certificate</VisuallyHidden>
          <AuthorshipCertificate
            projectId={projectId}
            projectTitle={projectTitle}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

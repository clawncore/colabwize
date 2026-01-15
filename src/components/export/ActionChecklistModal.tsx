import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ActionChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const ActionChecklistModal: React.FC<ActionChecklistModalProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  const checklistItems = [
    {
      id: 1,
      text: "Add citations to highlights",
      subtext: "Check for any 'Citation Needed' flags.",
    },
    {
      id: 2,
      text: "Rewrite close paraphrases",
      subtext: "Ensure you've used your own voice.",
    },
    {
      id: 3,
      text: "Confirm quotes are marked",
      subtext: "Verify all direct quotes have quotation marks.",
    },
    {
      id: 4,
      text: "Review reused draft sections",
      subtext: "Ensure context is appropriate for this new submission.",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-indigo-700">
            <CheckCircle2 className="w-6 h-6" />
            Before You Submit
          </DialogTitle>
          <DialogDescription>
            Closing the loop on your work. Run through this final check to
            ensure submission readiness.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-indigo-50 bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
              <div className="mt-0.5">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.text}</p>
                <p className="text-sm text-gray-500">{item.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Keep Editing
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2">
            Looks Good, Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

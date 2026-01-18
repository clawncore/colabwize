import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { CheckCircle2 } from "lucide-react";

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
  const [checkedItems, setCheckedItems] = React.useState<number[]>([]);

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

  const toggleItem = (id: number) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const allChecked = checkedItems.length === checklistItems.length;

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
          {checklistItems.map((item) => {
            const isChecked = checkedItems.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${isChecked
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}>
                <div className="mt-0.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isChecked
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-gray-300"
                      }`}>
                    {isChecked && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <p
                    className={`font-medium transition-colors ${isChecked ? "text-indigo-900" : "text-gray-900"
                      }`}>
                    {item.text}
                  </p>
                  <p
                    className={`text-sm transition-colors ${isChecked ? "text-indigo-700" : "text-gray-500"
                      }`}>
                    {item.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Keep Editing
          </button>
          <button
            onClick={onContinue}
            disabled={!allChecked}
            className={`px-6 py-2 text-sm font-medium rounded-md shadow-sm transition-all flex items-center gap-2 ${allChecked
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}>
            Looks Good, Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

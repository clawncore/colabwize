import React, { useState, useEffect } from "react";

interface RenameProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onRename: (newTitle: string) => Promise<boolean>;
}

export const RenameProjectModal: React.FC<RenameProjectModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  onRename,
}) => {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewTitle(currentTitle);
    }
  }, [isOpen, currentTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await onRename(newTitle);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Rename failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Rename Document
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter new title"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isSubmitting}>
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#5B7CFA] text-white font-medium rounded-md hover:bg-[#4F6EEA] active:bg-[#445FD8] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                disabled={
                  isSubmitting || !newTitle.trim() || newTitle === currentTitle
                }>
                {isSubmitting ? "Renaming..." : "Rename"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

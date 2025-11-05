import React from "react";
// Removed CustomButton import to make the file self-contained

const DeleteConfirm = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div
      // High-contrast overlay
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        // Modern Modal Card: Increased rounding, sharper shadow, and border
        className="bg-white rounded-xl p-8 max-w-xs w-full mx-4 shadow-2xl transform transition-all duration-300 ease-in-out scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          Confirm Deletion
        </h3>

        <p className="text-gray-700 mb-6 text-sm">
          {message ||
            "Are you absolutely sure you want to delete this item? This action is permanent and cannot be undone."}
        </p>

        <div className="flex justify-end gap-3">
          {/* Monochromatic Cancel Button (Secondary Action) */}
          <button
            onClick={onClose}
            type="button"
            className="bg-white text-gray-800 border border-gray-300 font-medium hover:bg-gray-100 rounded-lg px-4 py-2 transition duration-200 text-sm transform active:scale-[0.98]"
          >
            Cancel
          </button>

          {/* Danger Button (Destructive Action): Retained strong red for necessary UX clarity */}
          <button
            onClick={onConfirm}
            type="button"
            className="bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg px-4 py-2 transition duration-200 text-sm transform active:scale-[0.98]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;

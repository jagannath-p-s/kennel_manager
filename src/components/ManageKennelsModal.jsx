import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const ManageKennelsModal = ({ isOpen, onClose }) => {
  const [setName, setSetName] = useState("");
  const [selectedKennels, setSelectedKennels] = useState([]);
  const [unassignedKennels, setUnassignedKennels] = useState([]);
  const [error, setError] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const fetchUnassignedKennels = async () => {
    try {
      const { data, error } = await supabase
        .from("kennels")
        .select("*")
        .eq("set_name", "Maintenance");

      if (error) {
        throw error;
      } else {
        setUnassignedKennels(data);
      }
    } catch (error) {
      console.error("Error fetching unassigned kennels:", error.message);
    }
  };

  const handleKennelSelection = (kennel) => {
    setSelectedKennels((prevSelectedKennels) => {
      if (prevSelectedKennels.includes(kennel)) {
        return prevSelectedKennels.filter((k) => k !== kennel);
      } else {
        return [...prevSelectedKennels, kennel];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedKennels([]);
    } else {
      setSelectedKennels(unassignedKennels);
    }
    setSelectAll(!selectAll);
  };

  const handleCreateSet = async () => {
    if (!setName.trim()) {
      setError("Set name is required.");
      return;
    }

    if (selectedKennels.length === 0) {
      setError("Please select at least one kennel.");
      return;
    }

    try {
      const updates = selectedKennels.map((kennel) => ({
        ...kennel,
        set_name: setName,
      }));

      const { error: updateError } = await supabase
        .from("kennels")
        .upsert(updates, { onConflict: "id" });

      if (updateError) {
        throw updateError;
      }

      setSetName("");
      setSelectedKennels([]);
      setError("");
      onClose();
    } catch (error) {
      console.error("Error creating set:", error.message);
      setError("An error occurred while creating the set. Please try again.");
    }
  };

  useEffect(() => {
    fetchUnassignedKennels();
  }, []);

  useEffect(() => {
    if (selectedKennels.length === unassignedKennels.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedKennels, unassignedKennels]);

  return (
    <div
      className={`fixed inset-0 z-10 overflow-y-auto ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={onClose}
          ></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
        &#8203;
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900 mb-4"
                  id="modal-headline"
                >
                  Manage Kennels
                </h3>
                {/* Set Name */}
                <div className="mb-4">
                  <label
                    htmlFor="set-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Set Name
                  </label>
                  <input
                    type="text"
                    id="set-name"
                    className="mt-1 p-2 border rounded-md w-full"
                    value={setName}
                    onChange={(e) => setSetName(e.target.value)}
                  />
                </div>
                {/* Error Message */}
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {/* Unassigned Kennels */}
                <div>
                  <h4 className="text-md font-semibold mb-2">
                    Unassigned Kennels
                  </h4>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="select-all"
                      className="mr-2"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm">
                      Select All
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {unassignedKennels.map((kennel) => (
                      <div
                        key={kennel.id}
                        className={`p-4 text-center rounded-md cursor-pointer ${
                          selectedKennels.includes(kennel)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                        }`}
                        onClick={() => handleKennelSelection(kennel)}
                      >
                        Kennel {kennel.kennel_number}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleCreateSet}
            >
              Create Set
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageKennelsModal;

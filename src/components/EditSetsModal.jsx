import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import AddKennelsToSetModal from "./AddKennelsToSetModal";

const EditSetsModal = ({ isOpen, onClose, setToEdit }) => {
  const [editedSetName, setEditedSetName] = useState("");
  const [kennels, setKennels] = useState([]);
  const [error, setError] = useState("");
  const [isAddKennelsModalOpen, setIsAddKennelsModalOpen] = useState(false);

  useEffect(() => {
    if (setToEdit) {
      setEditedSetName(setToEdit.name);
      // Fetch the kennels for the set
      const fetchKennels = async () => {
        const { data, error } = await supabase
          .from("kennels")
          .select("*")
          .eq("set_name", setToEdit.name);

        if (error) {
          console.error("Error fetching kennels:", error);
        } else {
          setKennels(data);
        }
      };

      fetchKennels();
    }
  }, [setToEdit]);

  const handleAddKennel = () => {
    setIsAddKennelsModalOpen(true);
  };

  const handleRemoveKennel = async (kennel_id) => {
    try {
      const { error } = await supabase
        .from("kennels")
        .update({ set_name: 'Maintenance' }) // Update set_name to 'Maintenance'
        .eq("id", kennel_id);
  
      if (error) {
        throw error;
      }
  
      // Filter out the removed kennel from the state
      setKennels(kennels.filter((kennel) => kennel.id !== kennel_id));
    } catch (error) {
      console.error("Error removing kennel:", error.message);
      setError("An error occurred while removing the kennel. Please try again.");
    }
  };
  

  const handleAddKennelsToSet = (addedKennels) => {
    setKennels((prevKennels) => [...prevKennels, ...addedKennels]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editedSetName.trim()) {
      setError("Set name is required.");
      return;
    }

    if (kennels.length === 0) {
      setError("At least one kennel is required.");
      return;
    }

    try {
      const updates = kennels.map((kennel) => ({
        ...kennel,
        set_name: editedSetName,
      }));

      const { error: updateError } = await supabase
        .from("kennels")
        .upsert(updates, { onConflict: "id" });

      if (updateError) {
        throw updateError;
      }

      setEditedSetName("");
      setKennels([]);
      setError("");
      onClose();
    } catch (error) {
      console.error("Error updating set:", error.message);
      setError("An error occurred while updating the set. Please try again.");
    }
  };

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
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900 mb-4"
                    id="modal-headline"
                  >
                    Edit Set
                  </h3>
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
                      value={editedSetName}
                      onChange={(e) => setEditedSetName(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                  <div className="grid grid-cols-3 gap-4">
                    {kennels.map((kennel) => (
                      <div
                        key={kennel.id}
                        className="relative border p-4 rounded-md"
                      >
                        <span
                          className="absolute top-0 right-0 p-1 text-red-600 cursor-pointer"
                          onClick={() => handleRemoveKennel(kennel.id)}
                        >
                          &times;
                        </span>
                        <p className="text-center">
                          Kennel {kennel.kennel_number}
                        </p>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="border-dashed border-2 border-gray-300 text-gray-400 flex items-center justify-center p-4 rounded-md"
                      onClick={handleAddKennel}
                    >
                      <span className="text-2xl">+</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                close
              </button>
            </div>
          </form>
        </div>
      </div>
      {isAddKennelsModalOpen && (
        <AddKennelsToSetModal
          isOpen={isAddKennelsModalOpen}
          onClose={() => setIsAddKennelsModalOpen(false)}
          setName={editedSetName}
          onKennelsAdded={handleAddKennelsToSet}
        />
      )}
    </div>
  );
};

export default EditSetsModal;
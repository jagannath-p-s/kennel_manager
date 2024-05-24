import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import AddKennelsModal from "./AddKennelsModal";
import EditSetsModal from "./EditSetsModal";
import ManageKennelsModal from "./ManageKennelsModal";
import CustomerDetailDialog from "./CustomerDetailDialog";
import { MdEdit } from "react-icons/md";

const KennelGrid = () => {
  const [kennels, setKennels] = useState([]);
  const [isAddKennelsModalOpen, setIsAddKennelsModalOpen] = useState(false);
  const [isManageKennelsModalOpen, setIsManageKennelsModalOpen] =
    useState(false);
  const [isEditSetsModalOpen, setIsEditSetsModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedKennel, setSelectedKennel] = useState(null); // State for selected kennel
  const [isCustomerDetailDialogOpen, setIsCustomerDetailDialogOpen] =
    useState(false);

  // Fetch kennels data
  const fetchKennels = async () => {
    try {
      const { data, error } = await supabase
        .from("kennels")
        .select("*")
        .order("set_name", { ascending: true })
        .order("kennel_number", { ascending: true });

      if (error) {
        throw error;
      } else {
        setKennels(data);
      }
    } catch (error) {
      console.error("Error fetching kennels:", error.message);
    }
  };

  useEffect(() => {
    fetchKennels();

    const subscription = supabase
      .channel("public:kennels")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kennels" },
        () => {
          fetchKennels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Open the add kennels modal
  const openAddKennelsModal = () => {
    setIsAddKennelsModalOpen(true);
  };

  // Open the manage kennels modal
  const openManageKennelsModal = () => {
    setIsManageKennelsModalOpen(true);
  };

  // Open the edit sets modal
  const openEditSetsModal = (set) => {
    setSelectedSet(set);
    setIsEditSetsModalOpen(true);
  };

  // Handle kennel click
  const handleKennelClick = (kennel) => {
    if (kennel.status === "occupied" || kennel.status === "reserved") {
      setSelectedKennel(kennel);
      setIsCustomerDetailDialogOpen(true);
    }
  };

  // Group kennels by set names
  const groupedKennels = kennels.reduce((acc, kennel) => {
    const setName = kennel.set_name;
    if (!acc[setName]) {
      acc[setName] = [];
    }
    acc[setName].push(kennel);
    return acc;
  }, {});

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Kennel Status Overview</h2>

      {/* Add Kennels and Manage Kennels Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={openAddKennelsModal}
        >
          Add Kennels
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={openManageKennelsModal}
        >
          Manage Kennels
        </button>
      </div>

      {/* Display Kennels */}
      {Object.entries(groupedKennels).map(
        ([setName, kennelsForSet], index, array) => (
          <div key={index}>
            {/* Set Name */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{setName}</h3>
              <button
                onClick={() => openEditSetsModal({ name: setName })}
                className="text-gray-500 hover:text-gray-700"
              >
                <MdEdit />
              </button>
            </div>

            {/* Kennels in the Set */}
            <div className="grid grid-cols-5 md:grid-cols-10 gap-4 mb-4">
              {kennelsForSet.map((kennel) => (
             <div
             key={kennel.id}
             className={`p-4 text-center rounded-md transition-colors cursor-pointer ${
               kennel.status === "available"
                 ? "bg-green-500 text-white"
                 : kennel.status === "reserved"
                 ? "bg-yellow-500 text-white"
                 : kennel.status === "occupied"
                 ? "bg-red-500 text-white"
                 : "bg-gray-400 text-white"
             }`}
             style={{
               transition: "background-color 0.3s ease",
             }}
             onClick={() => handleKennelClick(kennel)}
           >
             Kennel {kennel.kennel_number}
           </div>
              ))}
            </div>

            {/* Horizontal Line */}
            {index !== array.length - 1 && <hr className="my-4" />}
          </div>
        )
      )}

      {/* Add Kennels Modal */}
      {isAddKennelsModalOpen && (
        <AddKennelsModal
          isOpen={isAddKennelsModalOpen}
          onClose={() => setIsAddKennelsModalOpen(false)}
        />
      )}

      {/* Manage Kennels Modal */}
      {isManageKennelsModalOpen && (
        <ManageKennelsModal
          isOpen={isManageKennelsModalOpen}
          onClose={() => setIsManageKennelsModalOpen(false)}
        />
      )}

      {/* Edit Sets Modal */}
      {isEditSetsModalOpen && (
        <EditSetsModal
          isOpen={isEditSetsModalOpen}
          onClose={() => setIsEditSetsModalOpen(false)}
          setToEdit={selectedSet}
        />
      )}

      {/* Customer Detail Dialog */}
      {isCustomerDetailDialogOpen && (
        <CustomerDetailDialog
          isOpen={isCustomerDetailDialogOpen}
          onClose={() => setIsCustomerDetailDialogOpen(false)}
          customer={selectedKennel}
        />
      )}
    </div>
  );
};

export default KennelGrid;

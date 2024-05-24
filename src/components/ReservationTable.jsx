import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import BillGenerationModal from "./BillGenerationModal";
import { supabase } from "../supabase";

const ReservationTable = ({
  reservations,
  onConfirm,
  onCancel,
  onEdit,
  onCheckout,
  isCheckoutModalOpen,
  setIsCheckoutModalOpen,
  selectedReservation,
  setSelectedReservation,
}) => {
  const handleCheckout = async (reservation) => {
    setSelectedReservation(reservation);
    setIsCheckoutModalOpen(true);

    // Perform deletion of feeding information upon checkout
    try {
      await deleteFeedingInformation(reservation);
    } catch (error) {
      console.error("Error deleting feeding information:", error.message);
      // Handle error gracefully (e.g., show error message)
    }

    // Refresh reservations after checkout
    await fetchReservations();
  };

  const deleteFeedingInformation = async (reservation) => {
    if (!reservation.kennel_ids || reservation.kennel_ids.length === 0) {
      return;
    }

    // Identify kennel_ids associated with the reservation
    const kennelIds = reservation.kennel_ids;

    // Construct queries to delete feeding_schedule entries for each kennel_id
    for (const kennelId of kennelIds) {
      const { error } = await supabase
        .from("feeding_schedule")
        .delete()
        .eq("kennel_id", kennelId);

      if (error) {
        throw new Error(
          `Failed to delete feeding information for kennel_id ${kennelId}`
        );
      }
    }
  };

  const fetchReservations = async () => {
    // Implement your fetchReservations function as previously defined
    // This function should update the state of reservations
  };

  return (
<div className="overflow-auto max-h-screen-60 rounded-lg border border-gray-200">
  <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
    <thead className="bg-gray-50 sticky top-0">
      <tr>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Customer Name
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Reservation Date
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Kennel Numbers
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Check In
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Check Out
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Pickup
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Drop
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Groom
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Status
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {reservations.map((reservation) => (
        <tr key={reservation.id} className="bg-white hover:bg-gray-100">
          <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
            {reservation.customers.customer_name}
          </td>
          <td className="whitespace-nowrap px-4 py-2 text-gray-700">
            {new Date(reservation.created_at).toDateString()}
          </td>
          <td className="whitespace-nowrap px-4 py-2 text-gray-700">
            {reservation.kennel_numbers}
          </td>
          <td className="whitespace-nowrap px-4 py-2 text-gray-700">
            {new Date(reservation.start_date).toDateString()}
          </td>
          <td className="whitespace-nowrap px-4 py-2 text-gray-700">
            {new Date(reservation.end_date).toDateString()}
          </td>
          <td className="whitespace-nowrap px-4 py-2 text-center">
            {reservation.pickup ? (
              <FaCheck className="text-green-500" />
            ) : (
              <FaTimes className="text-red-500" />
            )}
          </td>
          <td className="whitespace-nowrap px-4 py-2 text-center">
            {reservation.drop ? (
              <FaCheck className="text-green-500" />
            ) : (
              <FaTimes className="text-red-500" />
            )}
          </td>
          <td className="whitespace-nowrap px-4 py-2 text-center">
            {reservation.groom ? (
              <FaCheck className="text-green-500" />
            ) : (
              <FaTimes className="text-red-500" />
            )}
          </td>
          <td className="whitespace-nowrap px-4 py-2 text-gray-800">
            <span
              className={`rounded py-1 px-3 text-xs font-bold ${
                reservation.status === "confirmed"
                  ? "bg-green-400"
                  : reservation.status === "canceled"
                  ? "bg-red-400"
                  : reservation.status === "checkout"
                  ? "bg-blue-400"
                  : "bg-yellow-400"
              }`}
            >
              {reservation.status}
            </span>
          </td>
          <td className="whitespace-nowrap px-4 py-2 text-gray-800">
            {reservation.status === "pending" && (
              <button
                className="bg-green-500 text-white py-1 px-2 rounded-md hover:bg-green-600"
                onClick={() => onConfirm(reservation)}
              >
                Confirm
              </button>
            )}
            {reservation.status === "pending" && onCancel && (
              <button
                className="bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600 ml-2"
                onClick={() => onCancel && onCancel(reservation)} // Ensure onCancel is passed down correctly
              >
                Cancel
              </button>
            )}
            {reservation.status === "confirmed" && (
              <>
                <button
                  className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600 ml-2"
                  onClick={() => onEdit(reservation)}
                >
                  Edit
                </button>
                <button
                  className="bg-indigo-500 text-white py-1 px-2 rounded-md hover:bg-indigo-600 ml-2"
                  onClick={() => handleCheckout(reservation)}
                >
                  Checkout
                </button>
              </>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  {isCheckoutModalOpen && (
    <BillGenerationModal
      isOpen={isCheckoutModalOpen}
      onClose={() => setIsCheckoutModalOpen(false)}
      selectedReservation={selectedReservation}
    />
  )}
</div>

  );
};

export default ReservationTable;

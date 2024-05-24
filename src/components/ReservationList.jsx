import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import ReservationFilter from "./ReservationFilter";
import ReservationTable from "./ReservationTable";
import ReservationEditModal from "./ReservationEditModal";
import BillGenerationModal from "./BillGenerationModal";

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, kennel_ids, customers:customer_id (customer_name)")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Error fetching reservations:", error.message);
      }

      for (const reservation of data) {
        const kennelNumbers = await fetchKennelNumbers(reservation.kennel_ids);
        reservation.kennel_numbers = kennelNumbers.join(", ");
      }

      setReservations(data);
      setFilteredReservations(
        data.filter((reservation) => reservation.status !== "canceled")
      );
    } catch (error) {
      console.error("Fetch reservations error:", error.message);
      // Handle error gracefully (e.g., show error message)
    }
  };

  const fetchKennelNumbers = async (kennel_ids) => {
    if (!kennel_ids) return [];
    const { data, error } = await supabase
      .from("kennels")
      .select("kennel_number")
      .in("id", kennel_ids);

    if (error) {
      console.error("Error fetching kennel numbers:", error.message);
      return [];
    }

    return data.map((k) => k.kennel_number);
  };

  const confirmReservation = async (reservation) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "confirmed" })
      .eq("id", reservation.id);

    if (!error) {
      await Promise.all(
        reservation.kennel_ids.map((kennelId) =>
          supabase
            .from("kennels")
            .update({ status: "occupied" })
            .eq("id", kennelId)
        )
      );
      fetchReservations();
    }
  };

  const cancelReservation = async (reservation) => {
    try {
      // Update kennel status to 'available'
      await Promise.all(
        reservation.kennel_ids.map(async (kennelId) => {
          const { error: kennelError } = await supabase
            .from("kennels")
            .update({ status: "available" })
            .eq("id", kennelId);

          if (kennelError) {
            throw new Error(`Failed to update kennel ${kennelId} status`);
          }
        })
      );

      // Move reservation to historical_reservations with status 'cancelled'
      const { error: moveError } = await supabase
        .from("historical_reservations")
        .insert({
          customer_id: reservation.customer_id,
          pet_name: reservation.pet_name,
          pet_breed: reservation.pet_breed,
          start_date: reservation.start_date,
          end_date: reservation.end_date,
          status: "canceled",
          kennel_ids: reservation.kennel_ids,
          pickup: reservation.pickup,
          groom: reservation.groom,
          drop: reservation.drop,
          created_at: reservation.created_at,
        });

      if (moveError) {
        throw new Error("Failed to move reservation to historical_reservations");
      }

      // Delete reservation from reservations table
      const { error: deleteError } = await supabase
        .from("reservations")
        .delete()
        .eq("id", reservation.id);

      if (deleteError) {
        throw new Error("Failed to delete reservation from reservations");
      }

      // Refresh reservations list
      await fetchReservations();
    } catch (error) {
      console.error("Cancel reservation error:", error.message);
      // Handle error gracefully (e.g., show error message)
    }
  };

  const checkoutReservation = async (reservation) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "checkout" })
      .eq("id", reservation.id);

    if (!error) {
      await deleteFeedingInformation(reservation); // Call delete feeding information
      fetchReservations();
    }
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
        console.error(
          `Failed to delete feeding information for kennel_id ${kennelId}:`,
          error.message
        );
        // Handle error gracefully (e.g., show error message)
      }
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleFilterStartDateChange = (date) => {
    setFilterStartDate(date);
  };

  const handleFilterEndDateChange = (date) => {
    setFilterEndDate(date);
  };

  const handleDateFilter = (startDate, endDate) => {
    if (startDate && endDate) {
      setFilteredReservations(
        reservations.filter(
          (reservation) =>
            new Date(reservation.start_date) >= startDate &&
            new Date(reservation.end_date) <=
              endDate.setHours(23, 59, 59, 999) &&
            reservation.status !== "canceled"
        )
      );
    } else {
      setFilteredReservations(
        reservations.filter((reservation) => reservation.status !== "canceled")
      );
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query) {
      const lowerQuery = query.toLowerCase();
      const filtered = reservations.filter(
        (reservation) =>
          reservation.customers.customer_name.toLowerCase().includes(lowerQuery) &&
          reservation.status !== "canceled"
      );
      setFilteredReservations(filtered);
    } else {
      const filtered = reservations.filter(
        (reservation) => reservation.status !== "canceled"
      );
      setFilteredReservations(filtered);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reservation List</h2>
      <ReservationFilter
        searchQuery={searchQuery}
        filterStartDate={filterStartDate}
        filterEndDate={filterEndDate}
        onSearchChange={handleSearchChange}
        onDateFilter={handleDateFilter}
        setFilterStartDate={setFilterStartDate}
        setFilterEndDate={setFilterEndDate}
      />
      <ReservationTable
        reservations={filteredReservations}
        onConfirm={confirmReservation}
        onCancel={cancelReservation}
        onEdit={(reservation) => {
          setSelectedReservation(reservation);
          setIsEditModalOpen(true);
        }}
        onCheckout={(reservation) => {
          setSelectedReservation(reservation);
          setIsCheckoutModalOpen(true);
        }}
        isCheckoutModalOpen={isCheckoutModalOpen}
        setIsCheckoutModalOpen={setIsCheckoutModalOpen}
        selectedReservation={selectedReservation}
        setSelectedReservation={setSelectedReservation}
      />
      {isEditModalOpen && (
        <ReservationEditModal
          selectedReservation={selectedReservation}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={fetchReservations}
        />
      )}
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

export default ReservationList;
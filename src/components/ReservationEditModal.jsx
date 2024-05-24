import { useEffect, useState, Fragment } from "react";
import PropTypes from "prop-types";
import { supabase } from "../supabase";
import { Dialog, Transition } from "@headlessui/react";

const ReservationEditModal = ({
  selectedReservation,
  isOpen,
  onClose,
  onSave,
}) => {
  const [reservationInfo, setReservationInfo] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    pet_name: "",
    pet_breed: "",
    start_date: "",
    end_date: "",
    status: "",
    kennel_ids: [],
    pickup: false,
    groom: false,
    drop: false,
  });

  const [petInfo, setPetInfo] = useState({
    dietary_requirements: "",
    special_care_instructions: "",
    medical_notes: "",
  });

  useEffect(() => {
    const fetchInfo = async () => {
      if (selectedReservation) {
        const { data: reservationData, error: reservationError } =
          await supabase
            .from("reservations")
            .select(
              `
            *,
            customers:customer_id (
              customer_name,
              customer_phone,
              customer_address
            )
          `
            )
            .eq("id", selectedReservation.id)
            .single();

        if (!reservationError && reservationData) {
          setReservationInfo({
            ...reservationData,
            customer_name: reservationData.customers.customer_name,
            customer_phone: reservationData.customers.customer_phone,
            customer_address: reservationData.customers.customer_address,
          });
        } else {
          console.error("Error fetching reservation info:", reservationError);
        }

        const { data: petData, error: petError } = await supabase
          .from("pet_information")
          .select("*")
          .eq("reservation_id", selectedReservation.id)
          .single();

        if (!petError && petData) {
          setPetInfo(petData);
        } else {
          const { error: noDataError } = await supabase
            .from("pet_information")
            .select("*")
            .eq("reservation_id", selectedReservation.id)
            .single();

          if (noDataError && noDataError.code === "PGRST116") {
            setPetInfo({
              dietary_requirements: "",
              special_care_instructions: "",
              medical_notes: "",
            });
          } else {
            console.error("Error fetching pet info:", petError);
          }
        }
      }
    };

    fetchInfo();
  }, [selectedReservation]);

  const saveInformation = async () => {
    if (selectedReservation) {
      const { error: customerError } = await supabase
        .from("customers")
        .update({
          customer_name: reservationInfo.customer_name,
          customer_phone: reservationInfo.customer_phone,
          customer_address: reservationInfo.customer_address,
        })
        .eq("id", reservationInfo.customer_id);

      const { error: reservationError } = await supabase
        .from("reservations")
        .update({
          pet_name: reservationInfo.pet_name,
          pet_breed: reservationInfo.pet_breed,
          start_date: reservationInfo.start_date,
          end_date: reservationInfo.end_date,
          status: reservationInfo.status,
          kennel_ids: reservationInfo.kennel_ids,
          pickup: reservationInfo.pickup,
          groom: reservationInfo.groom,
          drop: reservationInfo.drop,
        })
        .eq("id", selectedReservation.id);

      let petError = null;
      if (petInfo.id) {
        const { error } = await supabase
          .from("pet_information")
          .update({
            dietary_requirements: petInfo.dietary_requirements,
            special_care_instructions: petInfo.special_care_instructions,
            medical_notes: petInfo.medical_notes,
          })
          .eq("id", petInfo.id);

        petError = error;
      } else {
        const { error } = await supabase.from("pet_information").insert({
          kennel_id: selectedReservation.kennel_ids[0],
          reservation_id: selectedReservation.id,
          dietary_requirements: petInfo.dietary_requirements,
          special_care_instructions: petInfo.special_care_instructions,
          medical_notes: petInfo.medical_notes,
        });

        petError = error;
      }

      if (!customerError && !reservationError && !petError) {
        onClose();
        onSave();
      } else {
        console.error(
          "Error saving information:",
          customerError,
          reservationError,
          petError
        );
      }
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-800 bg-opacity-50">
          <Dialog.Panel className="rounded-lg bg-white p-8 shadow-xl w-1/2">
            <Dialog.Title className="text-lg font-bold">
              Edit Reservation and Pet Information
            </Dialog.Title>
            <div className="mt-4">
              <label className="block font-semibold">Customer Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={reservationInfo.customer_name}
                onChange={(e) =>
                  setReservationInfo({
                    ...reservationInfo,
                    customer_name: e.target.value,
                  })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">Customer Phone</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={reservationInfo.customer_phone}
                onChange={(e) =>
                  setReservationInfo({
                    ...reservationInfo,
                    customer_phone: e.target.value,
                  })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">Customer Address</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={reservationInfo.customer_address}
                onChange={(e) =>
                  setReservationInfo({
                    ...reservationInfo,
                    customer_address: e.target.value,
                  })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">Pet Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={reservationInfo.pet_name}
                onChange={(e) =>
                  setReservationInfo({
                    ...reservationInfo,
                    pet_name: e.target.value,
                  })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">Pet Breed</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={reservationInfo.pet_breed}
                onChange={(e) =>
                  setReservationInfo({
                    ...reservationInfo,
                    pet_breed: e.target.value,
                  })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">Start Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={reservationInfo.start_date}
                onChange={(e) =>
                  setReservationInfo({
                    ...reservationInfo,
                    start_date: e.target.value,
                  })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">End Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={reservationInfo.end_date}
                onChange={(e) =>
                  setReservationInfo({
                    ...reservationInfo,
                    end_date: e.target.value,
                  })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">
                Dietary Requirements
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                value={petInfo.dietary_requirements}
                onChange={(e) =>
                  setPetInfo({
                    ...petInfo,
                    dietary_requirements: e.target.value,
                  })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">
                Special Care Instructions
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                value={petInfo.special_care_instructions}
                onChange={(e) =>
                  setPetInfo({
                    ...petInfo,
                    special_care_instructions: e.target.value,
                  })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">Medical Notes</label>
              <textarea
                className="w-full p-2 border rounded-md"
                value={petInfo.medical_notes}
                onChange={(e) =>
                  setPetInfo({ ...petInfo, medical_notes: e.target.value })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">Pickup</label>
              <input
                type="checkbox"
                checked={reservationInfo.pickup}
                onChange={(e) =>
                  setReservationInfo({
                    ...reservationInfo,
                    pickup: e.target.checked,
                  })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">Drop</label>
              <input
                type="checkbox"
                checked={reservationInfo.drop}
                onChange={(e) =>
                  setReservationInfo({
                    ...reservationInfo,
                    drop: e.target.checked,
                  })
                }
              />
            </div>
            <div className="mt-4">
              <label className="block font-semibold">Groom</label>
              <input
                type="checkbox"
                checked={reservationInfo.groom}
                onChange={(e) =>
                  setReservationInfo({
                    ...reservationInfo,
                    groom: e.target.checked,
                  })
                }
              />
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={saveInformation}
              >
                Save
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

ReservationEditModal.propTypes = {
  selectedReservation: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ReservationEditModal;

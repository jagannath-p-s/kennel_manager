import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCheck, FaTimes } from "react-icons/fa";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const FeedingSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [feedingTime, setFeedingTime] = useState("morning");
  const [occupiedKennels, setOccupiedKennels] = useState([]);
  const [fedKennels, setFedKennels] = useState([]);
  const [selectedKennels, setSelectedKennels] = useState([]);

  const fetchOccupiedKennels = async (date) => {
    const { data: occupiedKennelsData, error } = await supabase
      .from("kennels")
      .select("*")
      .eq("status", "occupied");

    if (error) {
      console.error("Error fetching kennels:", error.message);
    } else {
      setOccupiedKennels(occupiedKennelsData);
    }
  };

  const fetchFedKennels = async (date, time) => {
    const { data: fedKennelsData, error } = await supabase
      .from("feeding_schedule")
      .select("kennel_id")
      .eq("feeding_date", formatDate(date))
      .eq("feeding_time", time)
      .eq("fed", true);

    if (error) {
      console.error("Error fetching fed kennels:", error.message);
    } else {
      setFedKennels(fedKennelsData.map((data) => data.kennel_id));
    }
  };

  const handleSubmit = async () => {
    const feedingRecords = selectedKennels.map((kennel) => ({
      kennel_id: kennel.id,
      feeding_date: formatDate(selectedDate),
      feeding_time: feedingTime,
      fed: true,
      eaten: true,
    }));

    const { error } = await supabase.from("feeding_schedule").insert(feedingRecords);

    if (error) {
      console.error("Error inserting feeding status:", error.message);
    } else {
      // Reset state after successful submission
      setSelectedKennels([]);
      fetchFedKennels(selectedDate, feedingTime);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchOccupiedKennels(selectedDate);
      fetchFedKennels(selectedDate, feedingTime);
    }
  }, [selectedDate, feedingTime]);

  const toggleKennelSelection = (kennel) => {
    setSelectedKennels((prevSelectedKennels) => {
      if (prevSelectedKennels.includes(kennel)) {
        return prevSelectedKennels.filter((k) => k !== kennel);
      } else {
        return [...prevSelectedKennels, kennel];
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-semibold mb-6">Feeding Schedule Tracker</h2>

      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy/MM/dd"
          placeholderText="Select date"
          className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={feedingTime}
          onChange={(e) => setFeedingTime(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="morning">Morning</option>
          <option value="noon">Noon</option>
        </select>
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-xl font-medium mb-4">Occupied Kennels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {occupiedKennels.reduce((acc, kennel) => {
              const setIndex = acc.findIndex(
                (item) => item.name === kennel.set_name
              );
              if (setIndex === -1) {
                acc.push({ name: kennel.set_name, kennels: [kennel] });
              } else {
                acc[setIndex].kennels.push(kennel);
              }
              return acc;
            }, []).map((set) => (
              <div key={set.name}>
                <h4 className="text-lg font-semibold mb-2">{set.name}</h4>
                <div className="grid grid-cols-2 gap-4">
                  {set.kennels.map((kennel) => (
                    <div
                      key={kennel.id}
                      className={`p-4 text-center rounded-lg cursor-pointer transition-all shadow-md ${
                        fedKennels.includes(kennel.id)
                          ? "bg-green-500 text-white"
                          : selectedKennels.includes(kennel)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      onClick={() => toggleKennelSelection(kennel)}
                    >
                      <div className="flex flex-col items-center">
                        {fedKennels.includes(kennel.id) ? (
                          <>
                           
                            <span className="whitespace-nowrap rounded-full bg-green-100 mb-2 px-2.5 py-0.5 text-sm text-green-700">
                              Fed
                            </span>
                          </>
                        ) : selectedKennels.includes(kennel) ? (
                          <FaCheck className="text-2xl mb-2" />
                        ) : (
                          <FaTimes className="text-2xl mb-2" />
                        )}
                        <span>Kennel {kennel.kennel_number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selectedKennels.length === 0}
          className={`px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            selectedKennels.length === 0
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default FeedingSchedule;
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaFilter, FaCalendarAlt , FaDownload  } from "react-icons/fa"; // Import FontAwesome icons
import jsPDF from "jspdf";
import "jspdf-autotable";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const FeedingLogHistory = () => {
  const [feedingHistory, setFeedingHistory] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [filterKennelNumber, setFilterKennelNumber] = useState("");

  const fetchFeedingHistory = async () => {
    const { data, error } = await supabase
      .from("feeding_schedule")
      .select("*, kennels(kennel_number)")
      .order("kennel_id", { ascending: true });

    if (error) {
      console.error("Error fetching feeding history:", error.message);
    } else {
      const groupedData = data.reduce((acc, entry) => {
        const key = `${entry.kennels.kennel_number}-${entry.feeding_date}`;
        if (!acc[key]) {
          acc[key] = {
            kennel_number: entry.kennels.kennel_number,
            feeding_date: entry.feeding_date,
            morning_fed: false,
            noon_fed: false,
          };
        }
        if (entry.feeding_time === "morning") {
          acc[key].morning_fed = entry.fed;
        } else if (entry.feeding_time === "noon") {
          acc[key].noon_fed = entry.fed;
        }
        return acc;
      }, {});

      setFeedingHistory(Object.values(groupedData));
    }
  };

  const applyFilters = () => {
    let filteredData = feedingHistory;

    if (filterDate) {
      filteredData = filteredData.filter(
        (entry) =>
          formatDate(new Date(entry.feeding_date)) === formatDate(filterDate)
      );
    }

    if (filterKennelNumber) {
      filteredData = filteredData.filter(
        (entry) => entry.kennel_number.toString() === filterKennelNumber
      );
    }

    return filteredData;
  };

  const clearFilters = () => {
    setFilterDate(null);
    setFilterKennelNumber("");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const filteredData = applyFilters();

    // Set font style and size
    doc.setFont("helvetica");
    doc.setFontSize(12);

    // Add document title
    doc.text("Feeding Log History", 14, 15);

    // Define table headers
    const headers = [
      "Kennel Number",
      "Feeding Date",
      "Fed (Morning)",
      "Fed (Noon)",
    ];

    // Map data for the table
    const data = filteredData.map((entry) => [
      entry.kennel_number,
      formatDate(new Date(entry.feeding_date)),
      entry.morning_fed ? "Yes" : "No",
      entry.noon_fed ? "Yes" : "No",
    ]);

    // Add table to the document
    doc.autoTable({
      startY: 20, // Start table from 20 units down
      head: [headers],
      body: data,
      theme: "grid", // Apply grid theme for table
      styles: {
        font: "helvetica",
        fontStyle: "normal",
        fontSize: 10,
        cellPadding: 2,
        overflow: "linebreak",
      },
      headerStyles: {
        fillColor: [0, 0, 0], // Black header background color
        textColor: [255, 255, 255], // White header text color
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [0, 0, 0], // Black body text color
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Alternate row background color
      },
    });

    // Save the PDF file
    doc.save("feeding_log_history.pdf");
  };

  useEffect(() => {
    fetchFeedingHistory();
  }, []);

  return (
    <div className="container  mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Feeding Log History</h1>

      <div >
      <div className="flex flex-col md:flex-row mb-5 gap-4 items-start">
      <div className="relative flex items-center w-full md:w-64">
        <DatePicker
          selected={filterDate}
          onChange={(date) => setFilterDate(date)}
          dateFormat="yyyy/MM/dd"
          placeholderText="Filter by date"
          className="p-3 pl-10 pr-4 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          popperPlacement="bottom-start"
        />
        <FaCalendarAlt className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
      </div>

      <div className="relative flex items-center w-full md:w-48">
        <input
          type="text"
          placeholder="Kennel Number"
          value={filterKennelNumber}
          onChange={(e) => setFilterKennelNumber(e.target.value)}
          className="p-3 pl-10 pr-4 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <FaFilter className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
      </div>

      <button
        onClick={clearFilters}
        className="bg-gray-200 mt-0 lg:mt-2 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Clear Filters
      </button>

      <button
        onClick={downloadPDF}
        className="bg-blue-500 mt-0 lg:mt-2 hover:bg-blue-600 text-white flex items-center px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FaDownload className="mr-2" />
        Download PDF
      </button>
    </div>

    </div>

    <div className="overflow-x-auto rounded-lg border border-gray-200 ">
  <div className="max-h-[470px] overflow-y-auto">
    <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr>
          <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
            Feeding Date
          </th>
          <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
            Kennel Number
          </th>
          <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
            Fed (Morning)
          </th>
          <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
            Fed (Noon)
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {applyFilters().map((entry, index) => (
          <tr key={index} className="bg-white hover:bg-gray-100">
            <td className="whitespace-nowrap text-center px-4 text-gray-900">
              {formatDate(new Date(entry.feeding_date))}
            </td>
            <td className="px-6 text-center whitespace-nowrap text-sm font-medium text-gray-700">
              {entry.kennel_number}
            </td>
            <td className="px-2 text-center whitespace-nowrap">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  entry.morning_fed
                    ? "bg-green-500 text-white p-1 rounded-lg"
                    : "bg-red-500 text-white p-1 rounded-lg"
                }`}
              >
                {entry.morning_fed ? "Yes" : "No"}
              </span>
            </td>
            <td className="px-6 text-center py-1 whitespace-nowrap">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  entry.noon_fed
                    ? "bg-green-500 text-white p-1 rounded-lg"
                    : "bg-red-500 text-white p-1 rounded-lg"
                }`}
              >
                {entry.noon_fed ? "Yes" : "No"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

    </div>
  );
};

export default FeedingLogHistory;
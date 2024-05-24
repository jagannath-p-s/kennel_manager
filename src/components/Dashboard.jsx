import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  FaUsers,
  FaMoneyBill,
  FaChartLine,
  FaDog,
  FaWarehouse,
  FaPercentage,
} from "react-icons/fa";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [kennels, setKennels] = useState([]);
  const [customerNamesById, setCustomerNamesById] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      let { data: analyticsData, error: analyticsError } = await supabase
        .from("analytics")
        .select("*");
      if (analyticsError)
        console.log("Analytics data fetching error: ", analyticsError);
      else setData(analyticsData);

      let { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("*");
      if (customersError)
        console.log("Customers data fetching error: ", customersError);
      else {
        setCustomers(customersData);
        const namesById = customersData.reduce((acc, customer) => {
          acc[customer.id] = customer.customer_name;
          return acc;
        }, {});
        setCustomerNamesById(namesById);
      }

      let { data: reservationsData, error: reservationsError } = await supabase
        .from("historical_reservations")
        .select("*");
      if (reservationsError)
        console.log("Reservations data fetching error: ", reservationsError);
      else setReservations(reservationsData);

      let { data: kennelsData, error: kennelsError } = await supabase
        .from("kennels")
        .select("*");
      if (kennelsError)
        console.log("Kennels data fetching error: ", kennelsError);
      else setKennels(kennelsData);
    };
    fetchData();
  }, []);

  // Customer Insights
  const totalCustomers = customers.length;
  const customerReservationFrequency = data.reduce((acc, curr) => {
    const customerName = customerNamesById[curr.customer_id];
    acc[customerName] = (acc[customerName] || 0) + 1;
    return acc;
  }, {});

  // Reservation Metrics
  const totalReservations = reservations.length;
  const reservationStatusBreakdown = reservations.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});
  const averageStayDuration =
    data.reduce((acc, curr) => acc + curr.days_stayed, 0) / data.length;
  const totalRevenue = data.reduce((acc, curr) => acc + curr.total_bill, 0);
  const averageRevenuePerReservation = totalRevenue / data.length;
  const revenueByMonth = data.reduce((acc, curr) => {
    const month = new Date(curr.created_at).getMonth();
    acc[month] = (acc[month] || 0) + curr.total_bill;
    return acc;
  }, Array(12).fill(0));

  // Pet Insights
  const popularBreeds = data.reduce((acc, curr) => {
    acc[curr.pet_breed] = (acc[curr.pet_breed] || 0) + 1;
    return acc;
  }, {});
  const petServicesUtilization = data.reduce((acc, curr) => {
    if (curr.pickup) acc.pickup = (acc.pickup || 0) + 1;
    if (curr.groom) acc.groom = (acc.groom || 0) + 1;
    if (curr.drop) acc.drop = (acc.drop || 0) + 1;
    return acc;
  }, {});

  // Kennel Utilization
  const totalKennels = kennels.length;
  const occupiedKennels = kennels.filter(
    (kennel) => kennel.status !== "available"
  ).length;
  const occupancyRate = (occupiedKennels / totalKennels) * 100;
  const canceledReservations = reservations.filter(
    (reservation) => reservation.status === "canceled"
  ).length;
  const cancellationRate = (canceledReservations / totalReservations) * 100;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black bg-opacity-80 text-white p-2 rounded">
          <p className="font-semibold">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className=" min-h-screen">
      <header className="bg-gradient-to-r from-blue-500 to-purple-500 shadow">
      
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Customer Insights */}
          <div className="px-4 py-6 sm:px-0">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Total Customers */}
    <div className="bg-blue-50 p-4 rounded-lg shadow-lg flex items-center">
      <FaUsers className="text-4xl text-blue-500 mr-4" />
      <div>
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Total Customers
        </h3>
        <p className="text-3xl font-bold text-blue-600">{totalCustomers}</p>
      </div>
    </div>

    {/* Total Reservations */}
    <div className="bg-green-50 p-4 rounded-lg shadow-lg flex items-center">
      <FaChartLine className="text-4xl text-green-500 mr-4" />
      <div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Total Reservations
        </h3>
        <p className="text-3xl font-bold text-green-600">{totalReservations}</p>
      </div>
    </div>

    {/* Average Stay Duration */}
    <div className="bg-yellow-50 p-4 rounded-lg shadow-lg flex items-center">
      <FaWarehouse className="text-4xl text-yellow-500 mr-4" />
      <div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Average Stay Duration
        </h3>
        <p className="text-3xl font-bold text-yellow-600">
          {averageStayDuration.toFixed(2)} days
        </p>
      </div>
    </div>

    {/* Total Revenue */}
    <div className="bg-purple-50 p-4 rounded-lg shadow-lg flex items-center">
      <FaMoneyBill className="text-4xl text-purple-500 mr-4" />
      <div>
        <h3 className="text-lg font-semibold text-purple-800 mb-2">
          Total Revenue
        </h3>
        <p className="text-3xl font-bold text-purple-600">₹{totalRevenue.toFixed(2)}</p>
      </div>
    </div>
  </div>
</div>

       {/* Reservation Metrics */}
       <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-green-800">
                Reservation Metrics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Customer Reservation Frequency */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    
                    Customer Reservation Frequency
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(customerReservationFrequency).map(
                        ([customerName, frequency]) => ({
                          customerName,
                          frequency,
                        })
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="customerName" tick={{ fontSize: 14 }} />
                      <YAxis tick={{ fontSize: 14 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="frequency"
                        fill="#3B82F6"
                        name="Reservation Frequency"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Reservation Status Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 ml-12 flex items-center">
                    
                    Reservation Status Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(reservationStatusBreakdown).map(
                          ([status, count]) => ({ name: status, value: count })
                        )}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#82ca9d"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {Object.entries(reservationStatusBreakdown).map(
                          ([status], index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

             
              </div>
                 {/* Revenue Trends (Monthly) */}
                 <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-6 flex items-center">
                    
                    Revenue Trends (Monthly)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={revenueByMonth.map((revenue, index) => ({
                        month: new Date(0, index).toLocaleString("default", {
                          month: "short",
                        }),
                        revenue,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 14 }} />
                      <YAxis tick={{ fontSize: 14 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        name="Revenue"
                        strokeWidth={2}
                        dot={{ fill: "#10B981" }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            </div>
          </div>
          {/* Pet Insights */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-yellow-800">
                Pet Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    
                    Popular Pet Breeds
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(popularBreeds).map(
                        ([breed, count]) => ({ breed, count })
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="breed" tick={{ fontSize: 14 }} />
                      <YAxis tick={{ fontSize: 14 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="count" fill="#F59E0B" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    
                    Pet Services Utilization
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(petServicesUtilization).map(
                        ([service, count]) => ({ service, count })
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="service" tick={{ fontSize: 14 }} />
                      <YAxis tick={{ fontSize: 14 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="count" fill="#F59E0B" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Kennel Utilization */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-red-800">
                Kennel Utilization
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <FaWarehouse className="mr-2 text-red-500" /> Total Kennels
                  </h3>
                  <p className="text-4xl font-bold text-red-600">
                    {" "}
                    {totalKennels}{" "}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <FaWarehouse className="mr-2 text-red-500" /> Occupied
                    Kennels
                  </h3>
                  <p className="text-4xl font-bold text-red-600">
                    {" "}
                    {occupiedKennels}{" "}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <FaPercentage className="mr-2 text-red-500" /> Occupancy
                    Rate
                  </h3>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-red-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                        style={{ width: `${occupancyRate}%` }}
                      ></div>
                    </div>
                    <span className="ml-4 text-red-600 font-semibold">
                      {occupancyRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <FaPercentage className="mr-2 text-red-500" /> Cancellation
                    Rate
                  </h3>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-red-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                        style={{ width: `${cancellationRate}%` }}
                      ></div>
                    </div>
                    <span className="ml-4 text-red-600 font-semibold">
                      {cancellationRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

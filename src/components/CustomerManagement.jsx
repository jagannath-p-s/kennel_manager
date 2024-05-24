import React, { useState } from "react";
import CustomerTable from "./CustomerTable"; // Customer table component
import CustomerDetailDialog from "./CustomerDetailDialog"; // Customer detail dialog

const CustomerManagement = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCustomerDetailOpen, setIsCustomerDetailOpen] = useState(false);

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailOpen(true);
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 p-4 overflow-auto">
        <CustomerTable onViewCustomer={handleViewCustomer} />
        {/* Customer detail modal */}
        <CustomerDetailDialog
          customer={selectedCustomer}
          isOpen={isCustomerDetailOpen}
          onClose={() => setIsCustomerDetailOpen(false)}
        />
      </div>
    </div>
  );
};

export default CustomerManagement;

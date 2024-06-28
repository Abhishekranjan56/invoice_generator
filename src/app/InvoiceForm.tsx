"use client";
import React, { useState } from 'react';

interface Item {
  description: string;
  unitPrice: number;
  quantity: number;
  discount: number;
}

interface FormData {
  sellerName: string;
  sellerAddress: string;
  sellerCity: string;
  sellerState: string;
  sellerPincode: string;
  sellerPAN: string;
  sellerGST: string;
  placeOfSupply: string;
  billingName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;
  billingStateCode: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingStateCode: string;
  placeOfDelivery: string;
  orderNo: string;
  orderDate: string;
  invoiceNo: string;
  invoiceDetails: string;
  invoiceDate: string;
  reverseCharge: 'Yes' | 'No';
  items: Item[];
  signature: File | null;
}

const InvoiceForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    sellerName: '', sellerAddress: '', sellerCity: '', sellerState: '', sellerPincode: '', sellerPAN: '', sellerGST: '',
    placeOfSupply: '',
    billingName: '', billingAddress: '', billingCity: '', billingState: '', billingPincode: '', billingStateCode: '',
    shippingName: '', shippingAddress: '', shippingCity: '', shippingState: '', shippingPincode: '', shippingStateCode: '',
    placeOfDelivery: '',
    orderNo: '', orderDate: '',
    invoiceNo: '', invoiceDetails: '', invoiceDate: '',
    reverseCharge: 'No',
    items: [],
    signature: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
    );
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', unitPrice: 0, quantity: 0, discount: 0 }]
    }));
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, signature: e.target.files![0] }));
    }
  };

  const calculateTotals = () => {
    const totals = formData.items.reduce((acc, item) => {
      const netAmount = item.unitPrice * item.quantity - item.discount;
      const taxAmount = netAmount * 0.18; // Assuming 18% tax rate
      const totalAmount = netAmount + taxAmount;
      
      return {
        netAmount: acc.netAmount + netAmount,
        taxAmount: acc.taxAmount + taxAmount,
        totalAmount: acc.totalAmount + totalAmount
      };
    }, { netAmount: 0, taxAmount: 0, totalAmount: 0 });

    return totals;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totals = calculateTotals();
    console.log('Form Data:', formData);
    console.log('Totals:', totals);

    // Prepare data for Zoho API
    const invoiceData = {
      customer_id: "1234567890", // Replace with actual customer ID
      line_items: formData.items.map(item => ({
        item_id: "1234567890", // Replace with actual item ID
        description: item.description,
        rate: item.unitPrice,
        quantity: item.quantity,
        discount: item.discount,
      })),
      place_of_supply: formData.placeOfSupply,
      gst_treatment: "business_gst",
      gst_no: formData.sellerGST,
      // Add other necessary fields
    };

    try {
      const response = await fetch('http://localhost:3001/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const result = await response.json();
      console.log('Invoice created successfully:', result);

      const pdfResponse = await fetch('http://localhost:3001/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to generate PDF');
      }

      const pdfBlob = await pdfResponse.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Handle PDF download (or display)
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'invoice.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error creating invoice:', error);
      // Handle error (e.g., display an error message)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white rounded shadow-lg">
      <div className="mb-6">
        {/* Placeholder for company logo */}
        <div className="w-32 h-32 bg-gray-200 flex items-center justify-center mb-4">
          <span className="text-gray-500">Logo</span>
        </div>
        <h1 className="text-2xl font-bold">Invoice Generator</h1>
      </div>

      {/* Seller Details */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Seller Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="sellerName" placeholder="Name" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="sellerAddress" placeholder="Address" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="sellerCity" placeholder="City" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="sellerState" placeholder="State" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="sellerPincode" placeholder="Pincode" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="sellerPAN" placeholder="PAN No." onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="sellerGST" placeholder="GST Registration No." onChange={handleInputChange} className="p-2 border rounded" />
        </div>
      </section>

      {/* Place of Supply */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Place of Supply</h2>
        <input type="text" name="placeOfSupply" placeholder="Place of Supply" onChange={handleInputChange} className="w-full p-2 border rounded" />
      </section>

      {/* Billing Details */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Billing Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="billingName" placeholder="Name" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="billingAddress" placeholder="Address" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="billingCity" placeholder="City" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="billingState" placeholder="State" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="billingPincode" placeholder="Pincode" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="billingStateCode" placeholder="State/UT Code" onChange={handleInputChange} className="p-2 border rounded" />
        </div>
      </section>

      {/* Shipping Details */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Shipping Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="shippingName" placeholder="Name" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="shippingAddress" placeholder="Address" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="shippingCity" placeholder="City" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="shippingState" placeholder="State" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="shippingPincode" placeholder="Pincode" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="shippingStateCode" placeholder="State/UT Code" onChange={handleInputChange} className="p-2 border rounded" />
        </div>
      </section>

      {/* Place of Delivery */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Place of Delivery</h2>
        <input type="text" name="placeOfDelivery" placeholder="Place of Delivery" onChange={handleInputChange} className="w-full p-2 border rounded" />
      </section>

      {/* Order Details */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Order Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="orderNo" placeholder="Order No." onChange={handleInputChange} className="p-2 border rounded" />
          <input type="date" name="orderDate" onChange={handleInputChange} className="p-2 border rounded" />
        </div>
      </section>

      {/* Invoice Details */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Invoice Details</h2>
        <div className="grid grid-cols-3 gap-4">
          <input type="text" name="invoiceNo" placeholder="Invoice No." onChange={handleInputChange} className="p-2 border rounded" />
          <input type="text" name="invoiceDetails" placeholder="Invoice Details" onChange={handleInputChange} className="p-2 border rounded" />
          <input type="date" name="invoiceDate" onChange={handleInputChange} className="p-2 border rounded" />
        </div>
      </section>

      {/* Reverse Charge */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Reverse Charge</h2>
        <select name="reverseCharge" onChange={handleInputChange} className="w-full p-2 border rounded">
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </section>

      {/* Item Details */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Item Details</h2>
        {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 mb-2">
            <input type="text" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="p-2 border rounded" />
            <input type="number" placeholder="Unit Price" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="p-2 border rounded" />
            <input type="number" placeholder="Quantity" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="p-2 border rounded" />
            <input type="number" placeholder="Discount" value={item.discount} onChange={(e) => handleItemChange(index, 'discount', e.target.value)} className="p-2 border rounded" />
            <div className="p-2 border rounded bg-gray-100">
              {(item.unitPrice * item.quantity - item.discount).toFixed(2)}
            </div>
          </div>
        ))}
        <button type="button" onClick={addItem} className="mt-2 p-2 bg-blue-500 text-white rounded">Add Item</button>
      </section>

      {/* Signature Upload */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Signature</h2>
        <input type="file" accept="image/*" onChange={handleSignatureUpload} className="w-full p-2 border rounded" />
      </section>

      <button type="submit" className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600">
        Generate Invoice
      </button>
    </form>
  );
};

export default InvoiceForm;

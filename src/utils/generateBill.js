
function generateBill(consumerDetails) {
   
    const customer = {
        connection_no: consumerDetails.connection_no,
        name: `${consumerDetails.first_name} ${consumerDetails.last_name}`,
        address: consumerDetails.address,
        email: consumerDetails.email,
        phone_no: consumerDetails.phone_no,
        connection_type: consumerDetails.connection_type,
        connection_for: consumerDetails.connection_for,
        billing_type: consumerDetails.billing_type,
        district_id: consumerDetails.district_id,
        area_id: consumerDetails.area_id,
        department_id: consumerDetails.department_id,
        division_id: consumerDetails.division_id,
    };

    // Dummy items for the bill
    const items = [
        { description: 'Water Usage', quantity: 1, unit_price: 50.00 },
        { description: 'Sewerage Charges', quantity: 1, unit_price: 30.00 },
        { description: 'Maintenance Fee', quantity: 1, unit_price: 20.00 },
    ];

    return {
        customer,
        items,
        subtotal: items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
        tax: (items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) * 0.1).toFixed(2),
        total: (items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) * 1.1).toFixed(2),
        date: new Date().toISOString(),
        billNumber: `BILL-${Date.now()}`
    };
}

module.exports = generateBill;
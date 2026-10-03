import React, { useState } from 'react';
import './BasicInfoStep.css';

interface BasicInfoData {
    name: string;
    email: string;
    phone: string;
    businessType: string;
    supplierType: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
}

interface BasicInfoStepProps {
    data: BasicInfoData;
    onChange: (data: BasicInfoData) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onChange }) => {
    const handleChange = (field: keyof BasicInfoData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="basic-info-step">
            <h3 className="step-heading">Basic Information</h3>
            <p className="step-description">
                Please provide the basic details about your organization
            </p>

            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="name" className="required">
                        Supplier Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={data.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter supplier name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email" className="required">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={data.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="supplier@example.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone" className="required">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        value={data.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="gstin">GSTIN</label>
                    <input
                        type="text"
                        id="gstin"
                        value={data.gstin || ''}
                        onChange={(e) => handleChange('gstin', e.target.value)}
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="businessType" className="required">
                        Business Type
                    </label>
                    <select
                        id="businessType"
                        value={data.businessType}
                        onChange={(e) => handleChange('businessType', e.target.value)}
                        required
                    >
                        <option value="">Select business type</option>
                        <option value="Manufacturer">Manufacturer</option>
                        <option value="Trader">Trader</option>
                        <option value="Distributor">Distributor</option>
                        <option value="Wholesaler">Wholesaler</option>
                        <option value="Retailer">Retailer</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="supplierType" className="required">
                        Supplier Type
                    </label>
                    <select
                        id="supplierType"
                        value={data.supplierType}
                        onChange={(e) => handleChange('supplierType', e.target.value)}
                        required
                    >
                        <option value="">Select supplier type</option>
                        <option value="Raw Cotton Waste Supplier">Raw Cotton Waste Supplier</option>
                        <option value="Yarn Supplier">Yarn Supplier</option>
                        <option value="Dye Supplier">Dye Supplier</option>
                        <option value="Chemical Supplier">Chemical Supplier</option>
                        <option value="Packaging Supplier">Packaging Supplier</option>
                    </select>
                </div>

                <div className="form-group full-width">
                    <label htmlFor="address">Registered Address</label>
                    <textarea
                        id="address"
                        value={data.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Enter complete address"
                        rows={3}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                        type="text"
                        id="city"
                        value={data.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="Enter city"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                        type="text"
                        id="state"
                        value={data.state || ''}
                        onChange={(e) => handleChange('state', e.target.value)}
                        placeholder="Enter state"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="pinCode">Pin Code</label>
                    <input
                        type="text"
                        id="pinCode"
                        value={data.pinCode || ''}
                        onChange={(e) => handleChange('pinCode', e.target.value)}
                        placeholder="Enter pin code"
                        maxLength={6}
                    />
                </div>
            </div>
        </div>
    );
};

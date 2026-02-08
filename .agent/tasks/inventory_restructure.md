# Inventory System Restructure

## Overview
Restructure the inventory system to properly track Cotton and Yarn inventories with proper inward/outward flows.

## Tasks

### 1. UI Alignment Fixes
- [ ] Fix date filter alignment in Inventory History (top right corner)
- [ ] Fix section width alignment in Inventory History
- [ ] Fix date filter alignment in Inward Batch Entry
- [ ] Fix section width alignment in Inward Batch Entry

### 2. Mixing Module Restructure
- [ ] Create separate Input sub-page for raw materials
- [ ] Create separate Output sub-page with:
  - [ ] Yarn Production sub-section
  - [ ] Waste Breakdown sub-section
- [ ] Add close button to wizard (top right)

### 3. Inventory System Restructure
- [ ] Rename "Inventory History" to "Inventory"
- [ ] Create new Inventory page with sub-pages:
  - [ ] Cotton Inventory sub-page
  - [ ] Yarn Inventory sub-page
- [ ] Implement Cotton Inventory logic:
  - [ ] Inward batch adds to cotton inventory
  - [ ] Production consumption subtracts from cotton inventory
- [ ] Implement Yarn Inventory logic:
  - [ ] Production output adds to yarn inventory
  - [ ] Outward/Sales subtract from yarn inventory

### 4. Add Close Buttons
- [ ] Add close button to all wizard dialogs (top right corner)

## Implementation Notes
- Cotton Inventory = Inward Batches - Production Consumption
- Yarn Inventory = Production Output - Outward/Sales
- All wizards need consistent close button placement
- Date filters should be aligned to top right
- All sections should have consistent width alignment

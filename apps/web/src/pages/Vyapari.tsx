import React from 'react';
import CommerceDesk from './CommerceDesk';

/**
 * Backwards-compatible entry point for the retired Vyapari prototype.
 * Customer and ledger data now have one server-backed owner in Business Desk.
 */
const Vyapari: React.FC = () => (
  <CommerceDesk initialTab={1} />
);

export default Vyapari;

import { api } from '../api/client.js';
import { StockMovement } from './StockIn.jsx';

export default function StockOut() {
  return <StockMovement title="Stock Out" subtitle="Remove stock for a spare part" submit={api.inventory.stockOut} type="out" />;
}

// src/modules/inventory/services/inventory.service.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

const INVENTORY_URL = `${API_URL}/inventory`;
const REQUEST_URL = `${API_URL}/material-requests`;
const PO_URL = `${API_URL}/purchase-orders`;

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  };
};

export const inventoryService = {
  // =====================================
  // EQUIPMENT & GLOBAL INVENTORY
  // =====================================
  getGlobalInventory: async (params) => (await axios.get(`${INVENTORY_URL}/global`, { params, ...getHeaders() })).data,
  getAllEquipment: async (params) => (await axios.get(`${INVENTORY_URL}/equipment`, { params, ...getHeaders() })).data,
  getEquipmentById: async (id) => (await axios.get(`${INVENTORY_URL}/equipment/${id}`, getHeaders())).data,
  createEquipment: async (data) => (await axios.post(`${INVENTORY_URL}/equipment`, data, getHeaders())).data,
  updateEquipment: async (id, data) => (await axios.patch(`${INVENTORY_URL}/equipment/${id}`, data, getHeaders())).data,
  deleteEquipment: async (id) => (await axios.delete(`${INVENTORY_URL}/equipment/${id}`, getHeaders())).data,
  // POST /inventory/equipment/:id/assign
  assignEquipment: async (id, data) => (await axios.post(`${INVENTORY_URL}/equipment/${id}/assign`, data, getHeaders())).data,
  // POST /inventory/equipment/:id/release
  releaseEquipment: async (id) => (await axios.post(`${INVENTORY_URL}/equipment/${id}/release`, {}, getHeaders())).data,
  // POST /inventory/transfers
  transferItem: async (payload) => (await axios.post(`${INVENTORY_URL}/transfers`, payload, getHeaders())).data,
  // POST /inventory/global/add-stock
  addOpeningStock: async (data) => (await axios.post(`${INVENTORY_URL}/global/add-stock`, data, getHeaders())).data,

  // =====================================
  // MATERIALS MASTER
  // =====================================
  getAllMaterials: async () => (await axios.get(`${INVENTORY_URL}/materials`, getHeaders())).data,
  getMaterialById: async (id) => (await axios.get(`${INVENTORY_URL}/materials/${id}`, getHeaders())).data,
  createMaterial: async (data) => (await axios.post(`${INVENTORY_URL}/materials`, data, getHeaders())).data,
  updateMaterial: async (id, data) => (await axios.patch(`${INVENTORY_URL}/materials/${id}`, data, getHeaders())).data,
  deleteMaterial: async (id) => (await axios.delete(`${INVENTORY_URL}/materials/${id}`, getHeaders())).data,

  // =====================================
  // MATERIAL REQUESTS
  // =====================================
  requestItem: async (payload) => (await axios.post(REQUEST_URL, payload, getHeaders())).data,
  getAllMaterialRequests: async (params) => (await axios.get(REQUEST_URL, { params, ...getHeaders() })).data,
  getMaterialRequestById: async (id) => (await axios.get(`${REQUEST_URL}/${id}`, getHeaders())).data,
  updateMaterialRequestStatus: async (id, data) => (await axios.patch(`${REQUEST_URL}/${id}/status`, data, getHeaders())).data,
  fulfillRequestFromStock: async (payload) => (await axios.post(`${REQUEST_URL}/fulfill-transfer`, payload, getHeaders())).data,

  // =====================================
  // PURCHASE ORDERS — CRUD
  // =====================================
  getAllPurchaseOrders: async (params) => (await axios.get(PO_URL, { params, ...getHeaders() })).data,
  // GET /purchase-orders/:id
  getPurchaseOrderById: async (id) => (await axios.get(`${PO_URL}/${id}`, getHeaders())).data,
  createPurchaseOrder: async (data) => (await axios.post(PO_URL, data, getHeaders())).data,
  // PUT /purchase-orders/:id  (edit: title, description, expectedDelivery, actualDelivery, shippingCost, otherCharges, deliveryAddress, deliveryInstructions, notes, terms)
  updatePurchaseOrder: async (id, data) => (await axios.put(`${PO_URL}/${id}`, data, getHeaders())).data,
  deletePurchaseOrder: async (id) => (await axios.delete(`${PO_URL}/${id}`, getHeaders())).data,

  // PO Workflow — backend uses POST for all state changes
  // POST /purchase-orders/:id/submit
  submitPOForApproval: async (id) => (await axios.post(`${PO_URL}/${id}/submit`, {}, getHeaders())).data,
  // POST /purchase-orders/approvals/:id/approve
  approvePO: async (id, data) => (await axios.post(`${PO_URL}/approvals/${id}/approve`, data || {}, getHeaders())).data,
  // POST /purchase-orders/approvals/:id/reject
  rejectPO: async (id, data) => (await axios.post(`${PO_URL}/approvals/${id}/reject`, data || {}, getHeaders())).data,
  // POST /purchase-orders/:id/cancel
  cancelPO: async (id, data) => (await axios.post(`${PO_URL}/${id}/cancel`, data || {}, getHeaders())).data,
  // POST /purchase-orders/:id/order
  markAsOrdered: async (id) => (await axios.post(`${PO_URL}/${id}/order`, {}, getHeaders())).data,
  // POST /purchase-orders/:id/receive
  markAsReceived: async (id) => (await axios.post(`${PO_URL}/${id}/receive`, {}, getHeaders())).data,
  // POST /purchase-orders/:id/close
  closePO: async (id) => (await axios.post(`${PO_URL}/${id}/close`, {}, getHeaders())).data,

  // =====================================
  // GOODS RECEIPTS (GRN)
  // =====================================
  // GET /purchase-orders/:poId/goods-receipts
  getPOGoodsReceipts: async (poId) => (await axios.get(`${PO_URL}/${poId}/goods-receipts`, getHeaders())).data,
  // POST /purchase-orders/goods-receipts  { poId, deliveryChallanNo, notes, items:[{poItemId, receivedQuantity, qualityRating}] }
  createGoodsReceipt: async (poId, data) => (await axios.post(`${PO_URL}/goods-receipts`, { poId, ...data }, getHeaders())).data,
  // POST /purchase-orders/goods-receipts/:receiptId/accept-all
  acceptGRN: async (receiptId, poId) => (await axios.post(`${PO_URL}/goods-receipts/${receiptId}/accept-all`, { poId }, getHeaders())).data,
  // POST /purchase-orders/goods-receipts/:receiptId/reject-all
  rejectGRN: async (receiptId, poId, rejectionReason) => (await axios.post(`${PO_URL}/goods-receipts/${receiptId}/reject-all`, { poId, rejectionReason }, getHeaders())).data,
  // POST /purchase-orders/goods-receipts/:receiptId/update-stock
  updateStockFromReceipt: async (receiptId, poId) => (await axios.post(`${PO_URL}/goods-receipts/${receiptId}/update-stock`, { poId }, getHeaders())).data,

  // =====================================
  // REPORTS & DASHBOARD
  // =====================================
  getInventoryValuation: async () => (await axios.get(`${INVENTORY_URL}/reports/valuation`, getHeaders())).data,
  getLowStockReport: async (params) => (await axios.get(`${INVENTORY_URL}/reports/low-stock`, { params, ...getHeaders() })).data,
  getStockMovementReport: async (params) => (await axios.get(`${INVENTORY_URL}/reports/movement`, { params, ...getHeaders() })).data,
};
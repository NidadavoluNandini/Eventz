// src/pages/events/create/steps/TicketsStep.tsx
import React from 'react';

export type SubTicket = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  gst: number;
  finalPrice: number;
};

export type Ticket = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  gst: number;
  finalPrice: number;
  subTickets: SubTicket[];
  isExpanded: boolean;
};

type TicketsStepProps = {
  tickets: Ticket[];
  addTicket: () => void;
  removeTicket: (id: string) => void;
  toggleTicketExpansion: (id: string) => void;
  updateTicket: (id: string, field: keyof Ticket, value: any) => void;
  addSubTicket: (ticketId: string) => void;
  updateSubTicket: (
    ticketId: string,
    subTicketId: string,
    field: keyof SubTicket,
    value: any
  ) => void;
  removeSubTicket: (ticketId: string, subTicketId: string) => void;
  errors: Record<string, string>;
  paymentSettings: { collectPaymentCharges: boolean; platformFeePercent: number };
};

export const TicketsStep: React.FC<TicketsStepProps> = ({
  tickets,
  addTicket,
  removeTicket,
  toggleTicketExpansion,
  updateTicket,
  addSubTicket,
  updateSubTicket,
  removeSubTicket,
  errors,
  paymentSettings
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Ticket Configuration
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Add tickets and addons with pricing.
          </p>
        </div>
        <button
          type="button"
          onClick={addTicket}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm shadow-md"
        >
          <span className="text-lg leading-none">＋</span>
          <span>Add Ticket</span>
        </button>
      </div>

      {/* Error */}
      {errors.tickets && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <span className="text-red-500 text-sm font-semibold">!</span>
          <p className="text-red-700 text-sm font-medium">
            {errors.tickets}
          </p>
        </div>
      )}

      {/* No tickets */}
      {tickets.length === 0 && !errors.tickets && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-indigo-600 text-3xl">🎫</span>
          </div>
          <p className="text-gray-700 font-semibold mb-1">
            No Tickets Added
          </p>
          <p className="text-sm text-gray-500">
            Click &quot;Add Ticket&quot; to create your first ticket.
          </p>
        </div>
      )}

      {/* Tickets list */}
      <div className="space-y-3">
        {tickets.map((ticket, index) => {
          const isFree = ticket.price <= 0;

          return (
            <div
              key={ticket.id}
              className={`bg-white rounded-xl border-2 transition-all shadow-sm ${
                ticket.isExpanded ? 'border-indigo-300' : 'border-gray-200'
              }`}
            >
              {/* Header row */}
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTicketExpansion(ticket.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {ticket.name || `Ticket ${index + 1}`}
                      {isFree && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          FREE
                        </span>
                      )}
                      {ticket.subTickets?.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                          {ticket.subTickets.length} Addons
                        </span>
                      )}
                    </h3>
                    {!ticket.isExpanded && (
                      <p className="text-xs text-gray-500">
                        {ticket.quantity || 0} tickets •{' '}
                        {isFree ? 'Free' : ticket.finalPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isFree && (
                    <div className="text-right mr-2 hidden sm:block">
                      <p className="text-xs text-gray-500">Final price</p>
                      <p className="text-lg font-bold text-green-600">
                        {ticket.finalPrice.toFixed(2)}
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTicketExpansion(ticket.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg"
                  >
                    <span
                      className={`transition-transform ${
                        ticket.isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this ticket?')) {
                        removeTicket(ticket.id);
                      }
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {ticket.isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                  {/* Main ticket */}
                  <div className="bg-white rounded-lg p-4 border-2 border-indigo-200 mb-2">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      Main Ticket Details
                    </h4>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Ticket Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                          placeholder="e.g., VIP, General"
                          value={ticket.name}
                          onChange={(e) =>
                            updateTicket(ticket.id, 'name', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Quantity
                          <span className="text-gray-400"> (Optional)</span>
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                          placeholder="0"
                          min={0}
                          value={ticket.quantity || ""}
                          onChange={(e) =>
                            updateTicket(ticket.id, 'quantity', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Price
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                          placeholder="0"
                          min={0}
                          value={ticket.price || ""}
                          onChange={(e) =>
                            updateTicket(ticket.id, 'price', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          GST (%)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                          placeholder="0"
                          min={0}
                          max={100}
                          disabled={isFree}
                          value={ticket.gst || ""}
                          onChange={(e) =>
                            updateTicket(ticket.id, 'gst', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Final Price
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-bold text-green-600"
                          value={ticket.finalPrice.toFixed(2)}
                          disabled
                        />
                      </div>
                    </div>
                    {paymentSettings.collectPaymentCharges && (
                      <p className="text-[11px] text-gray-500 mt-2">
                        Final price includes GST and platform fee (
                        {paymentSettings.platformFeePercent}%).
                      </p>
                    )}
                  </div>

                  {/* Addons */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        Addons
                      </h4>
                      <button
                        type="button"
                        onClick={() => addSubTicket(ticket.id)}
                        className="px-3 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition flex items-center gap-1"
                      >
                        <span>＋</span>
                        <span>Add Addon</span>
                      </button>
                    </div>

                    {ticket.subTickets.length === 0 && (
                      <p className="text-xs text-gray-500">
                        No addons added. You can create optional extras like
                        food coupons, workshops, etc.
                      </p>
                    )}

                    {ticket.subTickets.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {ticket.subTickets.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                          >
                            <div className="grid grid-cols-6 gap-2 items-end">
                              <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  Addon Name
                                </label>
                                <input
                                  type="text"
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition outline-none text-sm"
                                  placeholder="Addon name"
                                  value={sub.name}
                                  onChange={(e) =>
                                    updateSubTicket(
                                      ticket.id,
                                      sub.id,
                                      'name',
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  Price
                                </label>
                                <input
                                  type="number"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition outline-none text-sm"
                                  placeholder="Price"
                                  min={0}
                                  value={sub.price || ""}
                                  onChange={(e) =>
                                    updateSubTicket(
                                      ticket.id,
                                      sub.id,
                                      'price',
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                             
                              <div className="col-span-1">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  Final
                                </label>
                                <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-green-600 text-center">
                                  {sub.finalPrice.toFixed(2)}
                                </div>
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeSubTicket(ticket.id, sub.id)
                                  }
                                  className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition w-full"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

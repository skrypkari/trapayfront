import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  Send,
  ChevronDown,
  Download,
  Mail,
  MessageSquare,
  Calendar,
  User,
  X,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';

interface Message {
  id: string;
  sender: 'user' | 'support';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

interface Ticket {
  id: string;
  subject: string;
  userEmail: string;
  status: 'open' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high';
  category: 'general' | 'technical' | 'billing' | 'account';
  createdAt: Date;
  lastUpdated: Date;
  messages: Message[];
}

const sampleTickets: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'Payment not processed',
    userEmail: 'john@example.com',
    status: 'open',
    priority: 'high',
    category: 'billing',
    createdAt: new Date('2024-03-20T14:30:00'),
    lastUpdated: new Date('2024-03-20T15:45:00'),
    messages: [
      {
        id: 'MSG-001',
        sender: 'user',
        content: 'Hi, I tried to make a payment but it failed. The money was deducted from my account but I didn\'t receive any confirmation.',
        timestamp: new Date('2024-03-20T14:30:00')
      },
      {
        id: 'MSG-002',
        sender: 'support',
        content: 'Hello! I understand your concern. Could you please provide the transaction ID so I can look into this for you?',
        timestamp: new Date('2024-03-20T15:45:00')
      }
    ]
  },
  {
    id: 'TKT-002',
    subject: 'Account verification issue',
    userEmail: 'sarah@example.com',
    status: 'pending',
    priority: 'medium',
    category: 'account',
    createdAt: new Date('2024-03-19T10:15:00'),
    lastUpdated: new Date('2024-03-19T11:30:00'),
    messages: [
      {
        id: 'MSG-003',
        sender: 'user',
        content: 'I\'ve been trying to verify my account for the past 2 days but keep getting an error.',
        timestamp: new Date('2024-03-19T10:15:00')
      }
    ]
  },
  {
    id: 'TKT-003',
    subject: 'API Integration Help',
    userEmail: 'dev@example.com',
    status: 'closed',
    priority: 'low',
    category: 'technical',
    createdAt: new Date('2024-03-18T09:00:00'),
    lastUpdated: new Date('2024-03-18T16:20:00'),
    messages: [
      {
        id: 'MSG-004',
        sender: 'user',
        content: 'Need help with implementing the webhook endpoint.',
        timestamp: new Date('2024-03-18T09:00:00')
      },
      {
        id: 'MSG-005',
        sender: 'support',
        content: 'Here\'s a detailed guide on implementing webhooks. Let me know if you need any clarification.',
        timestamp: new Date('2024-03-18T09:30:00')
      },
      {
        id: 'MSG-006',
        sender: 'user',
        content: 'Thanks! That solved my issue.',
        timestamp: new Date('2024-03-18T16:20:00')
      }
    ]
  }
];

const TicketDrawer: React.FC<{
  ticket: Ticket | null;
  onClose: () => void;
  onStatusChange: (ticketId: string, newStatus: Ticket['status']) => void;
}> = ({ ticket, onClose, onStatusChange }) => {
  const [newMessage, setNewMessage] = useState('');

  if (!ticket) return null;

  const statusOptions = [
    { value: 'open', label: 'Open', icon: <AlertTriangle className="h-4 w-4 text-yellow-600" /> },
    { value: 'pending', label: 'Pending', icon: <Clock className="h-4 w-4 text-blue-600" /> },
    { value: 'closed', label: 'Closed', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'tween' }}
      className="fixed inset-y-0 right-0 w-full sm:w-[600px] bg-white shadow-2xl z-50 flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
          <p className="text-sm text-gray-500">Ticket #{ticket.id}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Ticket Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
              <CustomSelect
                value={ticket.status}
                onChange={(value) => onStatusChange(ticket.id, value as Ticket['status'])}
                options={statusOptions}
                placeholder="Select status"
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-medium text-gray-500 mb-1">Priority</div>
              <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium capitalize ${
                ticket.priority === 'high' ? 'bg-red-50 text-red-700' :
                ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                'bg-green-50 text-green-700'
              }`}>
                {ticket.priority}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-medium text-gray-500 mb-1">Category</div>
              <div className="text-sm text-gray-900 capitalize">{ticket.category}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-medium text-gray-500 mb-1">Created</div>
              <div className="text-sm text-gray-900">
                {format(ticket.createdAt, 'MMM d, yyyy HH:mm')}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] ${
                  message.sender === 'user' ? 'bg-gray-100' : 'bg-primary/10'
                } rounded-xl p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' ? 'bg-gray-200' : 'bg-primary/20'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4 text-gray-500" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {message.sender}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(message.timestamp, 'MMM d, HH:mm')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-900">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reply Box */}
      <div className="p-4 border-t border-gray-200">
        <div className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your reply..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            rows={3}
          />
          <button
            className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AdminSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(sampleTickets);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open', icon: <AlertTriangle className="h-4 w-4 text-yellow-600" /> },
    { value: 'pending', label: 'Pending', icon: <Clock className="h-4 w-4 text-blue-600" /> },
    { value: 'closed', label: 'Closed', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> }
  ];

  const handleStatusChange = (ticketId: string, newStatus: Ticket['status']) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    ));
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and respond to customer support requests
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Tickets
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-yellow-600">+12.5%</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-semibold text-gray-900">45</h3>
            <p className="text-sm text-gray-500 mt-1">Open Tickets</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">+5.2%</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-semibold text-gray-900">23</h3>
            <p className="text-sm text-gray-500 mt-1">Pending Tickets</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+8.4%</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-semibold text-gray-900">156</h3>
            <p className="text-sm text-gray-500 mt-1">Resolved Today</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">-2.3%</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-semibold text-gray-900">4.2h</h3>
            <p className="text-sm text-gray-500 mt-1">Avg. Response Time</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Filter by status"
                className="w-[180px]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4">
                  <button className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                    <span>Subject</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left px-6 py-4">
                  <span className="text-sm font-medium text-gray-500">User</span>
                </th>
                <th className="text-left px-6 py-4">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                </th>
                <th className="text-left px-6 py-4">
                  <span className="text-sm font-medium text-gray-500">Priority</span>
                </th>
                <th className="text-left px-6 py-4">
                  <button className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                    <span>Last Updated</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                      <div className="text-xs text-gray-500">{ticket.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{ticket.userEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    {ticket.status === 'open' && (
                      <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg w-fit">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium capitalize">Open</span>
                      </div>
                    )}
                    {ticket.status === 'pending' && (
                      <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium capitalize">Pending</span>
                      </div>
                    )}
                    {ticket.status === 'closed' && (
                      <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg w-fit">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium capitalize">Closed</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium capitalize ${
                      ticket.priority === 'high' ? 'bg-red-50 text-red-700' :
                      ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      {ticket.priority}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {format(ticket.lastUpdated, 'MMM d, HH:mm')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setSelectedTicket(null)}
            />
            <TicketDrawer
              ticket={selectedTicket}
              onClose={() => setSelectedTicket(null)}
              onStatusChange={handleStatusChange}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSupport;
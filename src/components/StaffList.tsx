import React, { useEffect, useState } from 'react';
import { Users, Clock, MapPin, Phone, Mail, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { StaffMember } from '../types/auth';
import { getStaffPresence } from '../utils/storage';

export const StaffList: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const staffData = getStaffPresence();
    setStaff(staffData);
  }, []);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'present' && member.isPresent) ||
                         (filterStatus === 'absent' && !member.isPresent);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const presentStaff = staff.filter(member => member.isPresent);
  const absentStaff = staff.filter(member => !member.isPresent);
  const departments = [...new Set(staff.map(member => member.department))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Emmanuel</h1>
        <p className="text-gray-600 mt-1">Stato presenze e informazioni colleghi</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Presenti</p>
              <p className="text-2xl font-bold text-green-600">{presentStaff.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assenti</p>
              <p className="text-2xl font-bold text-red-600">{absentStaff.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Totale Staff</p>
              <p className="text-2xl font-bold text-blue-600">{staff.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">% Presenza</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((presentStaff.length / staff.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cerca per nome o ruolo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all">Tutti i reparti</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all">Tutti gli stati</option>
              <option value="present">Solo presenti</option>
              <option value="absent">Solo assenti</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Staff ({filteredStaff.length})
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <Filter className="w-4 h-4 mr-1" />
              {filteredStaff.length} di {staff.length} membri
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredStaff.map((member) => (
            <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    member.isPresent ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <span className={`font-semibold text-lg ${
                      member.isPresent ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.position}</p>
                    <p className="text-xs text-gray-500">{member.department}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  {member.isPresent ? (
                    <div>
                      <div className="flex items-center text-green-600 mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">
                          {member.clockInTime || 'N/A'}
                        </span>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In servizio
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Fuori servizio
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredStaff.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nessun membro del team trovato</p>
              <p className="text-sm">Prova a modificare i filtri di ricerca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
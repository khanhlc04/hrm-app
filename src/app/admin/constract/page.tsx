'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Upload, FileText, ExternalLink } from 'lucide-react';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterContractType, setFilterContractType] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Mock API base URL
  const API_BASE = 'http://localhost:8000';

  // Upload to Cloudinary function
  const uploadToCloudinary = async (file, fileType = 'image') => {
    try {
      const CLOUD_NAME = 'dp6hjihhh';
      const UPLOAD_PRESET = '_BookApp';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);
      formData.append('resource_type', fileType);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${fileType}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!data.secure_url) throw new Error('Upload fail');
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      throw new Error('Upload failed');
    }
  };

  // Fetch data from JSON Server
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [contractsRes, employeesRes, positionsRes, branchesRes] = await Promise.all([
        fetch(`${API_BASE}/contracts?deleted=false`),
        fetch(`${API_BASE}/employees?deleted=false`),
        fetch(`${API_BASE}/positions`),
        fetch(`${API_BASE}/branches`)
      ]);

      if (!contractsRes.ok || !employeesRes.ok || !positionsRes.ok || !branchesRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const contractsData = await contractsRes.json();
      const employeesData = await employeesRes.json();
      const positionsData = await positionsRes.json();
      const branchesData = await branchesRes.json();

      setContracts(contractsData);
      setEmployees(employeesData);
      setPositions(positionsData);
      setBranches(branchesData);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Lỗi khi tải dữ liệu. Vui lòng kiểm tra JSON Server có đang chạy không.');
    } finally {
      setLoading(false);
    }
  };

  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id == employeeId);
    return employee ? employee.fullName : 'Đang tải...';
  };

  // Get employee by ID
  const getEmployeeById = (employeeId) => {
    return employees.find(e => e.id == employeeId);
  };

  // Get position name by ID
  const getPositionName = (positionId) => {
    const position = positions.find(p => p.id == positionId);
    return position ? position.name : 'Đang tải...';
  };

  // Get branch name by ID
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id == branchId);
    return branch ? branch.name : 'Đang tải...';
  };

  // Check if employee has contract
  const hasContract = (employeeId) => {
    return contracts.some(contract => contract.employeeId == employeeId);
  };

  // Get contract by employee ID
  const getContractByEmployeeId = (employeeId) => {
    return contracts.find(contract => contract.employeeId == employeeId);
  };

  // Filter contracts based on search and filters
  const filteredContracts = contracts.filter(contract => {
    const employee = getEmployeeById(contract.employeeId);
    const matchesSearch = employee ?
      (employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase())) : false;

    const matchesBranch = filterBranch == '' || (employee && employee.branchId == parseInt(filterBranch));
    const matchesContractType = filterContractType == '' || contract.contractType == filterContractType;

    return matchesSearch && matchesBranch && matchesContractType;
  });

  // Get employees without contracts
  const employeesWithoutContracts = employees.filter(employee => !hasContract(employee.id));

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Handle delete contract
  const handleDelete = async (contractId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      try {
        await fetch(`${API_BASE}/contracts/${contractId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deleted: true })
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting contract:', error);
      }
    }
  };

  // Handle edit contract
  const handleEdit = (contract) => {
    setSelectedContract(contract);
    setShowEditModal(true);
  };

  // Contract form component
  const ContractForm = ({ contract, employeeId, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      employeeId: employeeId,
      contractNumber: contract?.contractNumber || '',
      contractType: contract?.contractType || 'Hợp đồng chính thức',
      startDate: contract?.startDate || '',
      endDate: contract?.endDate || '',
      benefits: contract?.benefits || '',
      contractFile: contract?.contractFile || '',
      status: contract?.status || 'Có hiệu lực',
      notes: contract?.notes || '',
      deleted: false
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileUploading, setFileUploading] = useState(false);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
          alert('Chỉ chấp nhận file ảnh (JPG, PNG) hoặc PDF');
          return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File không được vượt quá 5MB');
          return;
        }

        setSelectedFile(file);
      }
    };

    const uploadFile = async () => {
      if (!selectedFile) return formData.contractFile;

      setFileUploading(true);
      try {
        const fileType = selectedFile.type.startsWith('image/') ? 'image' : 'raw';
        const url = await uploadToCloudinary(selectedFile, fileType);
        return url;
      } catch (error) {
        alert('Lỗi khi upload file: ' + error.message);
        return formData.contractFile;
      } finally {
        setFileUploading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        setUploading(true);

        // Upload file if selected
        const contractFileUrl = await uploadFile();

        const finalData = {
          ...formData,
          contractFile: contractFileUrl,
          employeeId: parseInt(formData.employeeId),
        };

        const url = contract
          ? `${API_BASE}/contracts/${contract.id}`
          : `${API_BASE}/contracts`;

        const method = contract ? 'PUT' : 'POST';

        await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalData)
        });

        onSubmit();
        fetchData();
      } catch (error) {
        console.error('Error saving contract:', error);
        alert('Lỗi khi lưu hợp đồng');
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">
            {contract ? 'Cập nhật hợp đồng' : 'Thêm hợp đồng mới'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Số hợp đồng</label>
                <input
                  type="text"
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Loại hợp đồng</label>
                <select
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Hợp đồng chính thức">Hợp đồng chính thức</option>
                  <option value="Hợp đồng thử việc">Hợp đồng thử việc</option>
                  <option value="Hợp đồng tạm thời">Hợp đồng tạm thời</option>
                  <option value="Hợp đồng part-time">Hợp đồng part-time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phúc lợi</label>
              <textarea
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Mô tả các phúc lợi..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">File hợp đồng</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                accept="image/*,.pdf"
              />
              {formData.contractFile && (
                <div className="mt-2 flex items-center gap-2">
                  <FileText size={16} />
                  <a
                    href={formData.contractFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Xem file hiện tại
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="Có hiệu lực">Có hiệu lực</option>
                <option value="Hết hạn">Hết hạn</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ghi chú</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ghi chú thêm..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={uploading || fileUploading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {uploading || fileUploading ? 'Đang xử lý...' : (contract ? 'Cập nhật' : 'Thêm mới')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý hợp đồng nhân viên
            </h1>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên NV, số hợp đồng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            <select
              value={filterContractType}
              onChange={(e) => setFilterContractType(e.target.value)}
              className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả loại hợp đồng</option>
              <option value="Hợp đồng chính thức">Hợp đồng chính thức</option>
              <option value="Hợp đồng thử việc">Hợp đồng thử việc</option>
              <option value="Hợp đồng tạm thời">Hợp đồng tạm thời</option>
              <option value="Hợp đồng part-time">Hợp đồng part-time</option>
            </select>
          </div>
        </div>

        {/* Contract Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số hợp đồng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời hạn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hợp đồng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => {
                  const contract = getContractByEmployeeId(employee.id);
                  const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesBranch = filterBranch == '' || employee.branchId == parseInt(filterBranch);
                  const matchesContractType = filterContractType == '' || contract?.contractType == filterContractType;

                  if (!matchesSearch || !matchesBranch || !matchesContractType) return null;

                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                        <div className="text-sm text-gray-500">{employee.employeeCode}</div>
                      </td>

                      {contract ? (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">{contract.contractNumber}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{contract.contractType}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>{formatDate(contract.startDate)}</div>
                            {contract.endDate && (
                              <div className="text-xs text-gray-500">đến {formatDate(contract.endDate)}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${contract.status == 'Có hiệu lực'
                              ? 'bg-green-100 text-green-800'
                              : contract.status == 'Hết hạn'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {contract.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {contract.contractFile ? (
                              <a
                                href={contract.contractFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <FileText size={16} />
                                Xem file
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span className="text-gray-400">Chưa có file</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleEdit(contract)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Cập nhật hợp đồng"
                            >
                              <Edit size={16} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td colSpan={6} className="px-6 py-4 text-sm text-gray-500 italic">Chưa có hợp đồng</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedId(employee.id)
                                setSelectedContract(null);
                                setShowAddModal(true);
                              }}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
                            >
                              <Plus size={14} className="inline mr-1" />
                              Thêm hợp đồng
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📄</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Tổng hợp đồng</div>
                <div className="text-2xl font-bold text-gray-900">{contracts.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Có hiệu lực</div>
                <div className="text-2xl font-bold text-gray-900">
                  {contracts.filter(c => c.status == 'Có hiệu lực').length}
                </div>
              </div>
            </div>
          </div>

          {/* Hết hạn */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⏰</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Hết hạn</div>
                <div className="text-2xl font-bold text-gray-900">
                  {contracts.filter(c => c.status == 'Hết hạn').length}
                </div>
              </div>
            </div>
          </div>

          {/* Chưa hợp lệ hoặc khác */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Không hợp lệ</div>
                <div className="text-2xl font-bold text-gray-900">
                  {contracts.filter(
                    c => c.status !== 'Có hiệu lực' && c.status !== 'Hết hạn'
                  ).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <ContractForm
          contract={null}
          employeeId={selectedId}
          onSubmit={() => {
            setShowAddModal(false);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && selectedContract && (
        <ContractForm
          contract={selectedContract}
          employeeId={selectedContract.id}
          onSubmit={() => {
            setShowEditModal(false);
            setSelectedContract(null);
          }}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedContract(null);
          }}
        />
      )}
    </div>
  );
};

export default ContractManagement;
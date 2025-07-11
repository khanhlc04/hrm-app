"use client";

import React, { useEffect, useState } from "react";

interface Employee {
  id: string;
  fullName: string;
}

interface ChamCong {
  employeeId: string;
  soNgayLam: number;
  soCaLam: number;
  heSoLuong: number;
}

interface ThuongPhat {
  employeeId: string;
  thang: string;
  loai: "Thưởng" | "Phạt";
  soTien: number;
}

interface SalaryInfo {
  hoTen: string;
  luongCoBan: number;
  thuong: number;
  phat: number;
  tongLuong: number;
}

const SalaryTable: React.FC = () => {
  const [salaries, setSalaries] = useState<SalaryInfo[]>([]);

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, chamCongRes, thuongPhatRes] = await Promise.all([
          fetch(`${API_BASE}/employees`),
          fetch(`${API_BASE}/tbl_ChamCong`),
          fetch(`${API_BASE}/tbl_ThuongPhat`),
        ]);

        const [employees, chamCongs, thuongPhats] = await Promise.all([
          empRes.json(),
          chamCongRes.json(),
          thuongPhatRes.json(),
        ]);


        const salaries = employees.map((emp) => {
          const chamCong = chamCongs.find((c) => c.employeeId === emp.id);
          const thuong = thuongPhats
            .filter((t) => t.employeeId === emp.id && t.loai === "Thưởng")
            .reduce((sum, t) => sum + t.soTien, 0);
          const phat = thuongPhats
            .filter((t) => t.employeeId === emp.id && t.loai === "Phạt")
            .reduce((sum, t) => sum + t.soTien, 0);

          const luongCoBan = chamCong
            ? chamCong.soNgayLam * chamCong.soCaLam * chamCong.heSoLuong
            : 0;

          return {
            hoTen: emp.fullName,
            luongCoBan,
            thuong,
            phat,
            tongLuong: luongCoBan + thuong - phat,
          };
        });

        setSalaries(salaries);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        Bảng Lương Nhân Viên
      </h2>
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="py-3 px-4 border">Họ Tên</th>
              <th className="py-3 px-4 border">Lương Cơ Bản</th>
              <th className="py-3 px-4 border">Thưởng</th>
              <th className="py-3 px-4 border">Phạt</th>
              <th className="py-3 px-4 border">Tổng Lương</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 transition-all duration-200"
              >
                <td className="py-2 px-4 border">{item.hoTen}</td>
                <td className="py-2 px-4 border text-blue-800 font-medium">
                  {item.luongCoBan.toLocaleString()} đ
                </td>
                <td className="py-2 px-4 border text-green-700 font-semibold">
                  +{item.thuong.toLocaleString()} đ
                </td>
                <td className="py-2 px-4 border text-red-600 font-semibold">
                  -{item.phat.toLocaleString()} đ
                </td>
                <td className="py-2 px-4 border font-bold text-indigo-700">
                  {item.tongLuong.toLocaleString()} đ
                </td>
              </tr>
            ))}
            {salaries.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Không có dữ liệu lương để hiển thị.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryTable;

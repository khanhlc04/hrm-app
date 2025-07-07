'use client'

import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

export default function ReportPage() {
  const [branches, setBranches] = useState([])
  const [positions, setPositions] = useState([])
  const [employees, setEmployees] = useState([])
  const [attendances, setAttendances] = useState([])
  const [users, setUsers] = useState([])

  const currentMonth = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    fetch(`${API}/branches`).then(res => res.json()).then(setBranches)
    fetch(`${API}/positions`).then(res => res.json()).then(setPositions)
    fetch(`${API}/employees`).then(res => res.json()).then(setEmployees)
    fetch(`${API}/attendances`).then(res => res.json()).then(setAttendances)
    fetch(`${API}/users`).then(res => res.json()).then(setUsers)
  }, [])

  // 1. Nhân viên theo chi nhánh
  const employeesByBranch = branches.map((b: any) => ({
    name: b.name,
    count: employees.filter(e => e.branchId == b.id && !e.deleted).length
  }))

  // 2. Nhân viên theo vị trí
  const employeesByPosition = positions.map((p: any) => ({
    name: p.name,
    count: employees.filter(e => e.positionId == p.id && !e.deleted).length
  }))

  // 3. Tổng ca làm & ngày nghỉ tháng này
  const monthlyAttendance = attendances.filter((a: any) => a.date.startsWith(currentMonth))

  const totalShifts = monthlyAttendance.length
  const uniqueUserIds = new Set(monthlyAttendance.map(a => a.userId))
  const workingDays = uniqueUserIds.size * 30
  const totalAbsentDays = workingDays - totalShifts

  // 4. Tính chi phí nhân sự theo tháng
  const calculateHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0
    const [h1, m1] = checkIn.split(':').map(Number)
    const [h2, m2] = checkOut.split(':').map(Number)
    return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60
  }

  const totalSalary = users.reduce((sum, u: any) => {
    const userAttend = monthlyAttendance.filter((a: any) => a.userId === u.id && a.checkIn && a.checkOut)
    const hours = userAttend.reduce((acc, a) => acc + calculateHours(a.checkIn, a.checkOut), 0)
    return sum + hours * (u.salaryPerHour || 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-yellow-600 mb-6 text-center">📊 Báo Cáo & Thống Kê Tháng {currentMonth}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Số nhân viên theo chi nhánh */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-2">🏢 Nhân viên theo chi nhánh</h2>
          <ul className="space-y-1">
            {employeesByBranch.map((b: any, i) => (
              <li key={i} className="flex justify-between">
                <span>{b.name}</span>
                <span className="font-semibold">{b.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Số nhân viên theo vị trí */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-2">📌 Nhân viên theo vị trí</h2>
          <ul className="space-y-1">
            {employeesByPosition.map((p: any, i) => (
              <li key={i} className="flex justify-between">
                <span>{p.name}</span>
                <span className="font-semibold">{p.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Báo cáo chấm công */}
        <div className="bg-white p-4 rounded-xl shadow col-span-1 md:col-span-2">
          <h2 className="text-xl font-bold mb-2">⏱ Báo cáo chấm công</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-green-600">{totalShifts}</p>
              <p className="text-gray-600">Tổng ca làm</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-500">{totalAbsentDays}</p>
              <p className="text-gray-600">Ngày nghỉ</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{(totalSalary || 0).toLocaleString()} đ</p>
              <p className="text-gray-600">Chi phí nhân sự</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

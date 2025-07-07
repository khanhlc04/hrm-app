'use client'

import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

export default function SalaryPage() {
  const [users, setUsers] = useState([])
  const [attendances, setAttendances] = useState([])
  const [bonuses, setBonuses] = useState([])

  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  useEffect(() => {
    fetch(`${API}/users`).then(res => res.json()).then(setUsers)
    fetch(`${API}/attendances`).then(res => res.json()).then(setAttendances)
    fetch(`${API}/bonuses`).then(res => res.json()).then(setBonuses)
  }, [])

  const calculateHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0
    const [h1, m1] = checkIn.split(':').map(Number)
    const [h2, m2] = checkOut.split(':').map(Number)
    return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60
  }

  const getBonusForUser = (userId: string) => {
    const bonus = bonuses.find((b: any) => b.userId === userId && b.month === currentMonth)
    return bonus ? bonus.amount : 0
  }

  const salaryData = users.map((user: any) => {
    const userAttendances = attendances.filter((a: any) =>
      a.userId === user.id &&
      a.date.startsWith(currentMonth) &&
      a.checkIn &&
      a.checkOut
    )

    const totalHours = userAttendances.reduce((sum: number, a: any) =>
      sum + calculateHours(a.checkIn, a.checkOut), 0)

    const totalSalary = totalHours * (user.salaryPerHour || 0)
    const bonus = getBonusForUser(user.id)
    const finalSalary = totalSalary + bonus

    return {
      ...user,
      totalHours,
      totalSalary,
      bonus,
      finalSalary
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-yellow-600 mb-6 text-center">📊 Bảng Lương Tháng {currentMonth}</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-xl overflow-hidden shadow">
          <thead className="bg-yellow-100">
            <tr>
              <th className="p-3 border">👤 Nhân viên</th>
              <th className="p-3 border">⏱️ Giờ làm</th>
              <th className="p-3 border">💸 Lương</th>
              <th className="p-3 border">🎁 Thưởng</th>
              <th className="p-3 border">🧾 Tổng nhận</th>
            </tr>
          </thead>
          <tbody>
            {salaryData.map((u: any) => (
              <tr key={u.id} className="text-center">
                <td className="p-3 border">{u.fullName}</td>
                <td className="p-3 border">{u.totalHours.toFixed(2)} giờ</td>
                <td className="p-3 border">{u.totalSalary.toLocaleString()} đ</td>
                <td className="p-3 border text-green-600">{u.bonus.toLocaleString()} đ</td>
                <td className="p-3 border font-bold text-blue-600">{u.finalSalary.toLocaleString()} đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

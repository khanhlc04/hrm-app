'use client'

import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

export default function AttendancePage() {
  const [user, setUser] = useState<any>(null)
  const [shifts, setShifts] = useState([])
  const [selectedShift, setSelectedShift] = useState('')
  const [registrations, setRegistrations] = useState([])
  const [attendances, setAttendances] = useState([])

  const today = new Date().toISOString().split('T')[0]

  // ⚠️ Giả lập đăng nhập userId = 1
  useEffect(() => {
    fetch(`${API}/user/1`).then(res => res.json()).then(setUser)
  }, [])

  useEffect(() => {
    fetch(`${API}/shifts`).then(res => res.json()).then(setShifts)
    fetch(`${API}/registrations?date=${today}&userId=1`).then(res => res.json()).then(setRegistrations)
    fetch(`${API}/attendances?date=${today}&userId=1`).then(res => res.json()).then(setAttendances)
  }, [])

  const handleRegister = async () => {
    if (!selectedShift) return alert('Chọn ca trước khi đăng ký!')
    await fetch(`${API}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        shiftId: selectedShift,
        date: today
      })
    })
    alert('✅ Đã đăng ký ca!')
    location.reload()
  }

  const handleCheckIn = async () => {
    if (!registrations.length) return alert('Bạn chưa đăng ký ca!')
    await fetch(`${API}/attendances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        shiftId: registrations[0].shiftId,
        date: today,
        checkIn: new Date().toTimeString().slice(0, 5),
        checkOut: ''
      })
    })
    alert('✅ Đã chấm công vào!')
    location.reload()
  }

  const handleCheckOut = async () => {
    const attendance = attendances[0]
    if (!attendance) return alert('Chưa chấm công vào!')

    await fetch(`${API}/attendances/${attendance.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkOut: new Date().toTimeString().slice(0, 5)
      })
    })
    alert('✅ Đã chấm công ra!')
    location.reload()
  }

  // 👉 Tính giờ và lương
  function calculateHours(checkIn: string, checkOut: string) {
    if (!checkIn || !checkOut) return 0
    const [h1, m1] = checkIn.split(':').map(Number)
    const [h2, m2] = checkOut.split(':').map(Number)
    return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60
  }

  const hoursWorked =
    attendances.length && attendances[0].checkIn && attendances[0].checkOut
      ? calculateHours(attendances[0].checkIn, attendances[0].checkOut)
      : 0

  const salary = hoursWorked * (user?.salaryPerHour || 0)

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold text-yellow-600 mb-6">Chấm Công & Tính Lương</h1>

      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
        <div>
          <p className="text-gray-700 font-semibold">👤 Nhân viên:</p>
          <p>{user?.fullName}</p>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">🕒 Chọn ca làm:</label>
          <select
            className="w-full border rounded px-3 py-2"
            onChange={(e) => setSelectedShift(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>-- Chọn ca --</option>
            {shifts.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
            ))}
          </select>
          <button
            onClick={handleRegister}
            className="mt-2 w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-600"
          >
            Đăng ký ca
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCheckIn}
            className="flex-1 bg-green-500 text-white rounded py-2 hover:bg-green-600"
          >
            Chấm công vào
          </button>
          <button
            onClick={handleCheckOut}
            className="flex-1 bg-red-500 text-white rounded py-2 hover:bg-red-600"
          >
            Chấm công ra
          </button>
        </div>

        <div className="text-sm text-gray-600 mt-4 space-y-1">
          <p>✅ Đăng ký: {registrations.length > 0 ? 'Đã đăng ký' : 'Chưa'}</p>
          <p>🕒 Check-in: {attendances[0]?.checkIn || '--'}</p>
          <p>🕓 Check-out: {attendances[0]?.checkOut || '--'}</p>
          <p>🕰️ Số giờ làm: {hoursWorked.toFixed(2)} giờ</p>
          <p>💰 Lương hôm nay: {salary.toLocaleString()} đ</p>
        </div>
      </div>
    </div>
  )
}

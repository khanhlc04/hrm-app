'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthAndResetPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgot, setIsForgot] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [resetEmail, setResetEmail] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const endpoint = 'http://localhost:8000/user'

    try {
      const res = await fetch(endpoint)
      const users = await res.json()

      if (isLogin) {
        const user = users.find(
          (u: any) => u.email === form.email && u.password === form.password
        )
        if (user) {
          alert('✅ Đăng nhập thành công!')
          // router.push('/dashboard')
        } else {
          alert('❌ Sai email hoặc mật khẩu!')
        }
      } else {
        const existed = users.find((u: any) => u.email === form.email)
        if (existed) {
          alert('⚠️ Email đã được sử dụng!')
          return
        }

        const newUser = {
          id: Date.now().toString(),
          email: form.email,
          password: form.password,
          positionId: '1'
        }

        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        })

        alert('✅ Đăng ký thành công!')
        setIsLogin(true)
      }
    } catch (err) {
      console.error(err)
      alert('Lỗi kết nối đến JSON Server!')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const endpoint = 'http://localhost:8000/user'

    try {
      const res = await fetch(endpoint)
      const users = await res.json()
      const user = users.find((u: any) => u.email === resetEmail)

      if (user) {
        alert(`🔐 Mật khẩu của bạn là: ${user.password}`)
        setIsForgot(false)
      } else {
        alert('❌ Không tìm thấy email!')
      }
    } catch (err) {
      console.error(err)
      alert('Lỗi kết nối!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 to-yellow-200 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6">
        {isForgot ? (
          <>
            <h2 className="text-xl font-semibold text-yellow-600 text-center">
              Quên Mật Khẩu
            </h2>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition"
              >
                Lấy lại mật khẩu
              </button>
              <button
                type="button"
                onClick={() => setIsForgot(false)}
                className="w-full text-sm text-yellow-600 mt-2 hover:underline"
              >
                Quay lại đăng nhập
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-yellow-600">
              {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mật khẩu"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition"
              >
                {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
              </button>
            </form>

            <div className="flex justify-between text-sm text-gray-600">
              {isLogin ? (
                <>
                  <button
                    onClick={() => setIsForgot(true)}
                    className="hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className="hover:underline"
                  >
                    Chưa có tài khoản?
                  </button>
                </>
              ) : (
                <>
                  <span></span>
                  <button
                    onClick={() => setIsLogin(true)}
                    className="hover:underline"
                  >
                    Đã có tài khoản?
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

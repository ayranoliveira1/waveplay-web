import { Outlet } from 'react-router'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm sm:max-w-md rounded-2xl bg-surface/30 p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary text-center mb-10">
          WAVEPLAY
        </h1>
        <Outlet />
      </div>
    </div>
  )
}

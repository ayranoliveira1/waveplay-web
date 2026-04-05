import { Outlet } from 'react-router'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary text-center mb-8">
          WAVEPLAY
        </h1>
        <Outlet />
      </div>
    </div>
  )
}

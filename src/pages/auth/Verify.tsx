import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  verify,
  resendCode,
  clearError,
  clearPendingVerification,
} from '../../store/slices/authSlice'
import { RootState, AppDispatch } from '../../store'

interface VerifyFormData {
  code: string
}

const Verify = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, pendingVerification, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  )
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(60)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>()

  useEffect(() => {
    // Redirect if no pending verification
    if (!pendingVerification) {
      navigate('/login')
      return
    }

    // Redirect if authenticated (after successful verification)
    if (isAuthenticated) {
      navigate('/dashboard')
    }

    // Calculate initial countdown based on when code was sent
    if (pendingVerification.sentAt) {
      const elapsedSeconds = Math.floor((Date.now() - pendingVerification.sentAt) / 1000)
      const remainingSeconds = Math.max(0, 60 - elapsedSeconds)

      if (remainingSeconds > 0) {
        setCountdown(remainingSeconds)
        setCanResend(false)
      } else {
        setCountdown(0)
        setCanResend(true)
      }
    }

    return () => {
      dispatch(clearError())
    }
  }, [pendingVerification, isAuthenticated, navigate, dispatch])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const onSubmit = async (data: VerifyFormData) => {
    if (!pendingVerification) return

    const result = await dispatch(
      verify({
        email: pendingVerification.email,
        code: data.code,
        type: pendingVerification.type,
      })
    )

    // Handle successful verification
    if (result.type === 'auth/verify/fulfilled') {
      if (pendingVerification.type === 'forgot_password') {
        // For forgot password, navigate to reset password page
        navigate('/reset-password')
      } else {
        // For registration, navigate to dashboard
        navigate('/dashboard')
      }
    }
  }

  const handleResendCode = async () => {
    if (!canResend || !pendingVerification) return

    await dispatch(
      resendCode({
        email: pendingVerification.email,
        type: pendingVerification.type,
      })
    )

    setCanResend(false)
    setCountdown(60)
  }

  const handleGoBack = () => {
    dispatch(clearPendingVerification())
    if (pendingVerification?.type === 'register') {
      navigate('/register')
    } else {
      navigate('/forgot-password')
    }
  }

  if (!pendingVerification) {
    return null
  }

  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <span className="text-3xl">✉️</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-gray-600">We've sent a verification code to</p>
        <p className="text-gray-900 font-medium">{pendingVerification.email}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="code" className="label">
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            className={`input text-center text-2xl tracking-widest ${
              errors.code ? 'input-error' : ''
            }`}
            placeholder="000000"
            maxLength={6}
            {...register('code', {
              required: 'Verification code is required',
              pattern: {
                value: /^\d{6}$/,
                message: 'Code must be 6 digits',
              },
            })}
          />
          {errors.code && <p className="error-text">{errors.code.message as string}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full btn ${isLoading ? 'btn-disabled' : 'btn-primary'}`}
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                onClick={handleResendCode}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Resend code
              </button>
            ) : (
              <span className="text-gray-500">Resend in {countdown}s</span>
            )}
          </p>
        </div>

        <div className="text-center">
          <button onClick={handleGoBack} className="text-sm text-gray-600 hover:text-gray-800">
            ← Go back to{' '}
            {pendingVerification?.type === 'register' ? 'registration' : 'forgot password'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Verify

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword, clearError } from '../../store/slices/authSlice'
import { RootState, AppDispatch } from '../../store'

interface ForgotPasswordFormData {
  email: string
}

const ForgotPassword = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, pendingVerification } = useSelector((state: RootState) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>()

  useEffect(() => {
    if (pendingVerification?.type === 'forgot_password') {
      navigate('/verify')
    }
    return () => {
      dispatch(clearError())
    }
  }, [pendingVerification, navigate, dispatch])

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await dispatch(forgotPassword(data.email))
  }

  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
        <p className="text-gray-600">
          Enter your email and we'll send you a code to reset your password
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="your.email@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && (
            <p className="error-text">{errors.email.message as string}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full btn ${isLoading ? 'btn-disabled' : 'btn-primary'}`}
        >
          {isLoading ? 'Sending...' : 'Send Reset Code'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Back to login
        </Link>
      </div>
    </div>
  )
}

export default ForgotPassword

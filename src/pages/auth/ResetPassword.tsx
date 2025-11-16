import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resetPassword, clearError, clearPendingVerification } from '../../store/slices/authSlice'
import { RootState, AppDispatch } from '../../store'

interface ResetPasswordFormData {
  newPassword: string
  confirmPassword: string
}

const ResetPassword = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, pendingVerification } = useSelector((state: RootState) => state.auth)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>()

  const password = watch('newPassword')

  useEffect(() => {
    // Redirect if no pending verification or wrong type
    if (!pendingVerification || pendingVerification.type !== 'forgot_password') {
      navigate('/login')
    }
    return () => {
      dispatch(clearError())
    }
  }, [pendingVerification, navigate, dispatch])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!pendingVerification?.code) {
      toast.error('Verification code not found. Please verify your email first.')
      navigate('/verify')
      return
    }

    const result = await dispatch(resetPassword({
      code: pendingVerification.code,
      newPassword: data.newPassword,
    }))

    if (result.type === 'auth/resetPassword/fulfilled') {
      dispatch(clearPendingVerification())
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    }
  }

  const handleGoBack = () => {
    navigate('/verify')
  }

  if (!pendingVerification) {
    return null
  }

  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <span className="text-3xl">🔑</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
        <p className="text-gray-600">
          Enter your new password
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label htmlFor="newPassword" className="label">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            className={`input ${errors.newPassword ? 'input-error' : ''}`}
            placeholder="Create a strong password"
            {...register('newPassword', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
              validate: (value) => {
                const hasLowerCase = /[a-z]/.test(value)
                const hasUpperCase = /[A-Z]/.test(value)
                const hasNumber = /\d/.test(value)
                const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value)
                
                if (!hasLowerCase) return 'Password must contain at least one lowercase letter'
                if (!hasUpperCase) return 'Password must contain at least one uppercase letter'
                if (!hasNumber) return 'Password must contain at least one number'
                if (!hasSymbol) return 'Password must contain at least one symbol (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?~`)'
                
                return true
              },
            })}
          />
          {errors.newPassword && (
            <p className="error-text">{errors.newPassword.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="Re-enter your new password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword.message as string}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full btn ${isLoading ? 'btn-disabled' : 'btn-primary'}`}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={handleGoBack}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back to verification
        </button>
      </div>
    </div>
  )
}

export default ResetPassword

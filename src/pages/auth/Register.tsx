import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerUser, clearError } from '../../store/slices/authSlice'
import { RootState, AppDispatch } from '../../store'

interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

const Register = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading, pendingVerification } = useSelector((state: RootState) => state.auth)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const password = watch('password')

  useEffect(() => {
    if (pendingVerification?.type === 'register') {
      navigate('/verify')
    }
    return () => {
      dispatch(clearError())
    }
  }, [pendingVerification, navigate, dispatch])

  const onSubmit = async (data: RegisterFormData) => {
    await dispatch(registerUser(data))
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="label">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            className={`input ${errors.fullName ? 'input-error' : ''}`}
            placeholder="John Doe"
            {...register('fullName', {
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Full name must be at least 2 characters',
              },
            })}
          />
          {errors.fullName && (
            <p className="error-text">{errors.fullName.message}</p>
          )}
        </div>

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
            <p className="error-text">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`input ${errors.password ? 'input-error' : ''}`}
            placeholder="Create a strong password"
            {...register('password', {
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
          {errors.password && (
            <p className="error-text">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="Re-enter your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full btn ${isLoading ? 'btn-disabled' : 'btn-primary'}`}
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register

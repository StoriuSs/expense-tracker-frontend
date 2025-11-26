import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import categoriesReducer from './slices/categoriesSlice'
import expensesReducer from './slices/expensesSlice'
import budgetsReducer from './slices/budgetsSlice'
import subscriptionsReducer from './slices/subscriptionsSlice'
import statisticsReducer from './slices/statisticsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    expenses: expensesReducer,
    budgets: budgetsReducer,
    subscriptions: subscriptionsReducer,
    statistics: statisticsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

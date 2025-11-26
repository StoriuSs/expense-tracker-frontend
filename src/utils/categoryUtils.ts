import { CategoryColor } from '../types/category.types'
import { 
  ShoppingBag, 
  Utensils, 
  Car, 
  Home, 
  Zap, 
  Heart, 
  Briefcase, 
  GraduationCap, 
  Plane, 
  Music, 
  Gamepad2, 
  Gift, 
  Coffee, 
  Smartphone, 
  Wifi, 
  CreditCard,
  DollarSign,
  Tag,
  Film
} from 'lucide-react'

export const getCategoryIcon = (name: string) => {
  const normalizedName = name.toLowerCase()
  
  // Check health/healthcare FIRST before car (since "healthcare" contains "car")
  if (normalizedName.includes('health') || normalizedName.includes('doctor') || normalizedName.includes('med') || normalizedName.includes('gym')) return Heart
  
  if (normalizedName.includes('food') || normalizedName.includes('eat') || normalizedName.includes('dining') || normalizedName.includes('restaurant')) return Utensils
  if (normalizedName.includes('shop') || normalizedName.includes('buy') || normalizedName.includes('store') || normalizedName.includes('grocer')) return ShoppingBag
  if (normalizedName.includes('car') || normalizedName.includes('transport') || normalizedName.includes('bus') || normalizedName.includes('taxi') || normalizedName.includes('gas')) return Car
  if (normalizedName.includes('hous') || normalizedName.includes('rent') || normalizedName.includes('home') || normalizedName.includes('apartment')) return Home
  if (normalizedName.includes('bill') || normalizedName.includes('utility') || normalizedName.includes('electric') || normalizedName.includes('water')) return Zap
  if (normalizedName.includes('work') || normalizedName.includes('job') || normalizedName.includes('salary') || normalizedName.includes('income')) return Briefcase
  if (normalizedName.includes('education') || normalizedName.includes('school') || normalizedName.includes('course') || normalizedName.includes('book')) return GraduationCap
  if (normalizedName.includes('entertain') || normalizedName.includes('movie') || normalizedName.includes('cinema') || normalizedName.includes('show')) return Film
  if (normalizedName.includes('travel') || normalizedName.includes('trip') || normalizedName.includes('hotel') || normalizedName.includes('flight')) return Plane
  if (normalizedName.includes('music') || normalizedName.includes('spotify') || normalizedName.includes('concert')) return Music
  if (normalizedName.includes('game') || normalizedName.includes('steam') || normalizedName.includes('play')) return Gamepad2
  if (normalizedName.includes('gift') || normalizedName.includes('donation') || normalizedName.includes('charity')) return Gift
  if (normalizedName.includes('coffee') || normalizedName.includes('cafe') || normalizedName.includes('drink')) return Coffee
  if (normalizedName.includes('phone') || normalizedName.includes('mobile') || normalizedName.includes('internet')) return Smartphone
  if (normalizedName.includes('wifi') || normalizedName.includes('net')) return Wifi
  if (normalizedName.includes('card') || normalizedName.includes('bank') || normalizedName.includes('fee')) return CreditCard
  if (normalizedName.includes('money') || normalizedName.includes('cash') || normalizedName.includes('save')) return DollarSign
  
  return Tag // Default icon
}

export const getCategoryColorStyles = (color: CategoryColor) => {
  switch (color) {
    case CategoryColor.BLUE:
      return {
        bg: 'bg-blue-50',
        bgSaturated: 'bg-blue-500',
        text: 'text-blue-600',
        border: 'border-blue-100',
        hover: 'hover:bg-blue-100',
        ring: 'focus:ring-blue-500',
        gradient: 'from-blue-500 to-blue-600'
      }
    case CategoryColor.GREEN:
      return {
        bg: 'bg-green-50',
        bgSaturated: 'bg-green-500',
        text: 'text-green-600',
        border: 'border-green-100',
        hover: 'hover:bg-green-100',
        ring: 'focus:ring-green-500',
        gradient: 'from-green-500 to-green-600'
      }
    case CategoryColor.AMBER:
      return {
        bg: 'bg-amber-50',
        bgSaturated: 'bg-amber-500',
        text: 'text-amber-600',
        border: 'border-amber-100',
        hover: 'hover:bg-amber-100',
        ring: 'focus:ring-amber-500',
        gradient: 'from-amber-500 to-amber-600'
      }
    case CategoryColor.PURPLE:
      return {
        bg: 'bg-purple-50',
        bgSaturated: 'bg-purple-500',
        text: 'text-purple-600',
        border: 'border-purple-100',
        hover: 'hover:bg-purple-100',
        ring: 'focus:ring-purple-500',
        gradient: 'from-purple-500 to-purple-600'
      }
    case CategoryColor.RED:
      return {
        bg: 'bg-red-50',
        bgSaturated: 'bg-red-500',
        text: 'text-red-600',
        border: 'border-red-100',
        hover: 'hover:bg-red-100',
        ring: 'focus:ring-red-500',
        gradient: 'from-red-500 to-red-600'
      }
    case CategoryColor.PINK:
      return {
        bg: 'bg-pink-50',
        bgSaturated: 'bg-pink-500',
        text: 'text-pink-600',
        border: 'border-pink-100',
        hover: 'hover:bg-pink-100',
        ring: 'focus:ring-pink-500',
        gradient: 'from-pink-500 to-pink-600'
      }
    default:
      return {
        bg: 'bg-gray-50',
        bgSaturated: 'bg-gray-500',
        text: 'text-gray-600',
        border: 'border-gray-100',
        hover: 'hover:bg-gray-100',
        ring: 'focus:ring-gray-500',
        gradient: 'from-gray-500 to-gray-600'
      }
  }
}

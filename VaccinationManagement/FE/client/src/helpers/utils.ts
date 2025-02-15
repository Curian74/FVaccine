import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
import { UserRole } from "@/types/userRole";
import { User } from "@/types/user";
import { useEffect, useState } from "react";
import UserService from "@/services/UserService";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkEmail(email: string): boolean {
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


export interface PaginatedList<T> {
  currentPage: number,
  totalItems: number,
  totalPages: number,
  hasPreviousPage: boolean,
  hasNextPage: boolean,
  list: T[]
}

export const RoleBasedRender = (props: {
  render: (role: UserRole) => JSX.Element | JSX.Element[] | string | null,
  defaultRender?: (errorMsg?: string) => JSX.Element | JSX.Element[] | string | null,
  loadingRender?: () => JSX.Element | JSX.Element[] | string | null,
}) => {
  const [user, setUser] = useState<User>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const email = localStorage.getItem('email')!
        const profile = await UserService.GetProfile(email)
        setUser(profile)
        setError(undefined)

      } catch {
        setError("Unable to verify your access privilege")
      }
      finally {
        setIsLoading(false)
      }
    };

    fetchUserProfile()
  }, [])

  if (isLoading && props.loadingRender) return props.loadingRender()
  if ((error || !user) && props.defaultRender) return props.defaultRender(error)
  if (user) return props.render(user.roleId)
}
